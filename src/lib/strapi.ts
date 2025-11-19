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
 * Fetches data from Strapi API
 * @param endpoint - API endpoint (e.g., '/api/events')
 * @param options - Fetch options
 * @returns Strapi response with data
 */
export async function fetchStrapi<T>(
  endpoint: string,
  options?: RequestInit,
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

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

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
        errorText: errorText.substring(0, 500),
      };

      // Always log errors (production and development)
      console.error("❌ [Strapi] API Error:", errorDetails);
      
      // Provide actionable error messages
      let errorMessage = `Strapi API error: ${response.status} ${response.statusText}`;
      
      if (response.status === 404) {
        errorMessage += `\n⚠️  Endpoint not found: ${url}\n💡 Check if the collection type exists in Strapi and is published.`;
      } else if (response.status === 403) {
        errorMessage += `\n⚠️  Access forbidden: ${url}\n💡 Check Strapi API permissions (Settings → Users & Permissions → Roles → Public).`;
      } else if (response.status === 0 || response.status === 500) {
        errorMessage += `\n⚠️  Server error or CORS issue: ${url}\n💡 Check:\n   - Strapi is running\n   - CORS is configured (Settings → Security → CORS)\n   - SSL certificate is valid`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Always log errors (production and development)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      error: errorMessage,
      url,
      endpoint,
      strapiUrl,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    };

    console.error("❌ [Strapi] Fetch Error:", errorDetails);

    // Provide specific error messages for common issues
    if (error instanceof TypeError && errorMessage.includes("fetch")) {
      const enhancedError = new Error(
        `❌ [Strapi] Network Error: Cannot connect to ${url}\n` +
        `💡 Possible causes:\n` +
        `   - Strapi server is down or unreachable\n` +
        `   - Network connectivity issue\n` +
        `   - DNS resolution failed for ${strapiUrl}\n` +
        `   - Firewall blocking connection\n` +
        `   - SSL certificate issue\n` +
        `\n🔧 Action: Check Strapi server status and network connectivity.`
      );
      throw enhancedError;
    }

    if (error instanceof Error && errorMessage.includes("CORS")) {
      const enhancedError = new Error(
        `❌ [Strapi] CORS Error: ${errorMessage}\n` +
        `💡 Fix: Add ${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in'} to Strapi CORS allowed origins\n` +
        `   (Strapi Admin → Settings → Security → CORS)`
      );
      throw enhancedError;
    }

    // Re-throw with enhanced message if it's already an Error
    if (error instanceof Error) {
      throw error;
    }

    // Wrap unknown errors
    throw new Error(`Strapi fetch failed: ${errorMessage}`);
  }
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

