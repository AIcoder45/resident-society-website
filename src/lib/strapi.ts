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
  
  if (process.env.NODE_ENV === "development") {
    console.log("Strapi fetchStrapi called:", {
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
      console.log("Strapi response status:", response.status, response.statusText);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi API error details:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
      });
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Strapi fetch error:", error);
    }
    throw error;
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

