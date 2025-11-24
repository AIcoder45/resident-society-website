/**
 * Strapi API client utility
 * Provides type-safe functions for fetching data from Strapi CMS
 */

/**
 * Get Strapi URL from environment variables at runtime
 * This ensures Next.js has loaded .env.local before reading
 */
function getStrapiUrl(): string {
  return process.env.STRAPI_URL || "http://localhost:1337";
}

/**
 * Strapi API response structure
 */
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Strapi media object structure
 */
interface StrapiMedia {
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: unknown;
}

interface StrapiMediaData {
  id: number;
  attributes: StrapiMedia;
}

interface StrapiMediaResponse {
  data: StrapiMediaData | StrapiMediaData[];
}

/**
 * Custom error class for Strapi API failures
 */
export class StrapiApiError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly endpoint: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "StrapiApiError";
  }
}

/**
 * Fetches data from Strapi API with retry logic
 * @param endpoint - API endpoint (e.g., '/api/events')
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Strapi response with data
 */
export async function fetchStrapi<T>(
  endpoint: string,
  options?: RequestInit,
  maxRetries: number = 2,
): Promise<StrapiResponse<T>> {
  const strapiUrl = getStrapiUrl();
  const url = `${strapiUrl}${endpoint}`;
  
  // Always log in development, log errors in production
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [Strapi] Fetching:", {
      fullUrl: url,
      endpoint,
      STRAPI_URL: strapiUrl,
    });
  }

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry (exponential backoff: 1s, 2s)
        const delay = attempt * 1000;
        console.log(`🔄 [Strapi] Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Build fetch options compatible with static export
      // During static export, Next.js cannot use 'no-store'
      // Use revalidate: 0 for fresh data (removed cache: 'no-store' to fix static export)
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
        next: { revalidate: 0 }, // Always fetch fresh data
        signal: AbortSignal.timeout(10000), // 10 second timeout
      };

      const response = await fetch(url, fetchOptions);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [Strapi] Response status:", response.status, response.statusText);
      }

      if (!response.ok) {
        const errorText = await response.text();
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          url,
          endpoint,
          strapiUrl,
          attempt: attempt + 1,
          errorText: errorText.substring(0, 500),
        };

        // Always log errors (production and development)
        console.error(`❌ [Strapi] API Error (attempt ${attempt + 1}/${maxRetries + 1}):`, errorDetails);
        
        // Provide actionable error messages
        let errorMessage = `Strapi API error: ${response.status} ${response.statusText}`;
        
        if (response.status === 404) {
          errorMessage += `\n⚠️  Endpoint not found: ${url}\n💡 Check if the collection type exists in Strapi and is published.`;
        } else if (response.status === 403) {
          errorMessage += `\n⚠️  Access forbidden: ${url}\n💡 Check Strapi API permissions (Settings → Users & Permissions → Roles → Public).`;
        } else if (response.status === 502) {
          errorMessage += `\n⚠️  Bad Gateway: ${url}\n💡 Strapi server is not responding.`;
        } else if (response.status === 503) {
          errorMessage += `\n⚠️  Service Unavailable: ${url}\n💡 Strapi server is temporarily unavailable.`;
        } else if (response.status === 0 || response.status === 500) {
          errorMessage += `\n⚠️  Server error or CORS issue: ${url}`;
        }

        lastError = new StrapiApiError(errorMessage, url, endpoint, response.status);
        
        // If this is not the last attempt, continue to retry
        if (attempt < maxRetries) {
          continue;
        }
        
        // Last attempt failed, throw error
        throw lastError;
      }

      // Success - return the response
      return response.json();
    } catch (error) {
      // Check if it's a timeout or network error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = error instanceof TypeError && errorMessage.includes("fetch");
      const isTimeoutError = error instanceof Error && (error.name === "TimeoutError" || errorMessage.includes("timeout"));
      const isAbortError = error instanceof Error && error.name === "AbortError";

      lastError = error instanceof Error ? error : new Error(errorMessage);

      // Log the error
      console.error(`❌ [Strapi] Fetch Error (attempt ${attempt + 1}/${maxRetries + 1}):`, {
        error: errorMessage,
        url,
        endpoint,
        strapiUrl,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isNetworkError,
        isTimeoutError,
        isAbortError,
      });

      // If this is not the last attempt and it's a network/timeout error, retry
      if (attempt < maxRetries && (isNetworkError || isTimeoutError || isAbortError)) {
        continue;
      }

      // Last attempt failed or non-retryable error
      if (isNetworkError) {
        throw new StrapiApiError(
          `❌ [Strapi] Network Error: Cannot connect to ${url}\n` +
          `💡 Possible causes:\n` +
          `   - Strapi server is down or unreachable\n` +
          `   - Network connectivity issue\n` +
          `   - DNS resolution failed for ${strapiUrl}\n` +
          `   - Firewall blocking connection\n` +
          `   - SSL certificate issue\n` +
          `\n🔧 Action: Check Strapi server status and network connectivity.`,
          url,
          endpoint,
        );
      }

      if (error instanceof Error && errorMessage.includes("CORS")) {
        throw new StrapiApiError(
          `❌ [Strapi] CORS Error: ${errorMessage}\n` +
          `💡 Fix: Add ${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in'} to Strapi CORS allowed origins\n` +
          `   (Strapi Admin → Settings → Security → CORS)`,
          url,
          endpoint,
        );
      }

      // Re-throw StrapiApiError as-is
      if (error instanceof StrapiApiError) {
        throw error;
      }

      // Wrap other errors
      throw new StrapiApiError(
        `Strapi fetch failed after ${attempt + 1} attempt(s): ${errorMessage}`,
        url,
        endpoint,
      );
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new StrapiApiError("Unknown error occurred", url, endpoint);
}

/**
 * Get image URL from Strapi media object
 * @param media - Strapi media object, array, or data structure
 * @returns Image URL or null
 */
export function getStrapiImageUrl(media: unknown): string | null {
  if (!media) return null;

  // Handle Strapi v4 structure: { data: { attributes: { url: ... } } }
  if (
    typeof media === "object" &&
    media !== null &&
    "data" in media
  ) {
    const data = (media as { data: StrapiMediaData | StrapiMediaData[] | null })
      .data;
    
    if (Array.isArray(data) && data.length > 0) {
      const mediaObj = data[0];
      if (
        mediaObj &&
        typeof mediaObj === "object" &&
        "attributes" in mediaObj &&
        mediaObj.attributes &&
        typeof mediaObj.attributes === "object" &&
        "url" in mediaObj.attributes
      ) {
        const url = mediaObj.attributes.url as string;
        const strapiUrl = getStrapiUrl();
        return url.startsWith("http") ? url : `${strapiUrl}${url}`;
      }
    } else if (
      data &&
      typeof data === "object" &&
      "attributes" in data &&
      data.attributes &&
      typeof data.attributes === "object" &&
      "url" in data.attributes
    ) {
      const url = data.attributes.url as string;
      const strapiUrl = getStrapiUrl();
      return url.startsWith("http") ? url : `${strapiUrl}${url}`;
    }
  }

  // Handle direct media object: { url: ... }
  const mediaObj = Array.isArray(media) ? media[0] : media;

  if (
    typeof mediaObj === "object" &&
    mediaObj !== null &&
    "url" in mediaObj
  ) {
    const url = mediaObj.url as string;
    const strapiUrl = getStrapiUrl();
    return url.startsWith("http") ? url : `${strapiUrl}${url}`;
  }

  return null;
}

