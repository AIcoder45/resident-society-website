import type {
  News,
  Event,
  GalleryItem,
  Notification,
  Policy,
  PolicyDocument,
  ContactInfo,
  ContactPageData,
  RWAMember,
  Advertisement,
  Homepage,
  Theme,
  ServiceProvider,
  VisionMission,
} from "@/types";
import { fetchStrapi, getStrapiImageUrl as getStrapiImageUrlUtil, StrapiApiError } from "@/lib/strapi";

/**
 * API utility functions for fetching content
 * Automatically uses Strapi if STRAPI_URL is set, otherwise falls back to JSON files
 */

/**
 * Get Strapi URL from environment variables at runtime
 * This ensures Next.js has loaded .env.local before reading
 */
function getStrapiUrl(): string | undefined {
  return process.env.STRAPI_URL;
}

/**
 * Check if Strapi should be used
 * Reads environment variable at runtime
 */
function shouldUseStrapi(): boolean {
  const url = getStrapiUrl();
  const useStrapi = !!url;

  // Log configuration status (always, but more verbose in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 [Strapi] Configuration:", {
      STRAPI_URL: url,
      USE_STRAPI: useStrapi,
      envKeys: Object.keys(process.env).filter((k) => k.includes("STRAPI")),
    });
  } else {
    // Production: Log only if Strapi is not configured (warning)
    if (!useStrapi) {
      console.warn("⚠️  [Strapi] STRAPI_URL not configured - using JSON fallback");
    } else {
      // Log successful configuration on startup (once)
      if (!(global as any).__strapiConfigLogged) {
        console.log(`✅ [Strapi] Connected to: ${url}`);
        (global as any).__strapiConfigLogged = true;
      }
    }
  }
  
  return useStrapi;
}

/**
 * Helper to transform Strapi image URL
 * @deprecated Use getStrapiImageUrl from @/lib/strapi instead
 */
function getStrapiImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const strapiUrl = getStrapiUrl();
  if (strapiUrl) {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${strapiUrl}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
  }
  return url;
}

/**
 * Fetches all news articles
 * @param limit - Optional limit for number of articles
 * @returns Array of news articles
 */
export async function getNews(limit?: number): Promise<News[]> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/news-articles?populate=*&sort[0]=publishedAt:desc`;
      const strapiUrl = getStrapiUrl();
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [News] Fetching from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      let news: News[] = (response.data || []).map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const newsData = isV4Structure ? item.attributes : item;

        // Extract image - handle both v4 and v5 structures
        const imageData = isV4Structure ? newsData.image : item.image;
        let imageUrl: string | undefined = undefined;

        if (imageData) {
          if (typeof imageData === "object" && "url" in imageData) {
            // Strapi v5: direct object with url property
            const url = imageData.url as string;
            imageUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          } else {
            // Strapi v4: nested structure
            imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
          }
        }

        // Extract video - handle both v4 and v5 structures
        const videoData = isV4Structure ? newsData.video : item.video;
        let videoUrl: string | undefined = undefined;

        if (videoData) {
          if (typeof videoData === "object" && "data" in videoData && videoData.data) {
            // Strapi v4/v5: nested structure with data
            const videoAttributes = videoData.data?.attributes || videoData.data;
            const url = videoAttributes?.url || videoData.data?.url;
            if (url) {
              videoUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            }
          } else if (typeof videoData === "object" && "url" in videoData) {
            // Strapi v5: direct object with url property
            const url = videoData.url as string;
            videoUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          } else {
            // Strapi v4: nested structure
            videoUrl = getStrapiImageUrlUtil(videoData) || undefined;
          }
        }

        // Extract YouTube and Instagram URLs
        const youtubeUrl = newsData.youtubeUrl || item.youtubeUrl || undefined;
        const instagramUrl = newsData.instagramUrl || item.instagramUrl || undefined;

        // Extract publishedAt (fallback to publishDate or createdAt if not available)
        const publishedAt = newsData.publishedAt || newsData.publishDate || newsData.createdAt || item.publishedAt || item.publishDate || item.createdAt;

        // Extract sequence number
        const sequence = newsData.sequence !== undefined ? newsData.sequence : (item.sequence !== undefined ? item.sequence : undefined);

        return {
          id: item.id.toString(),
          title: newsData.title || item.title,
          slug: newsData.slug || item.slug,
          shortDescription: newsData.shortDescription || item.shortDescription || "",
          content: newsData.content || item.content || "",
          image: imageUrl,
          video: videoUrl,
          youtubeUrl: youtubeUrl,
          instagramUrl: instagramUrl,
          category: newsData.category || item.category || "",
          publishedAt: publishedAt,
          sequence: sequence,
        };
      });

      // Sort by published date (newest first) to ensure correct order
      news = news.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ [News] Successfully fetched ${news.length} articles from Strapi`);
      } else {
        // Log success in production too (less verbose)
        console.log(`✅ [News] Fetched ${news.length} articles from Strapi`);
      }

      return limit ? news.slice(0, limit) : news;
    } catch (error) {
      // Always log errors (production and development)
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [News] Strapi connection failed:", {
        error: errorMessage,
        strapiUrl: getStrapiUrl(),
        endpoint: "/api/news-articles",
        action: "Falling back to JSON files",
      });
      console.error("❌ [News] Full error details:", error);
      // Fallback to JSON on error
    }
  } else {
    // Log when Strapi is not configured
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️  [News] STRAPI_URL not set, using JSON fallback");
    }
  }

  // Fallback to JSON files
  const newsData = await import("@/data/news.json");
  let news = newsData.default as any[];

  // Ensure sequence is included from JSON data
  news = news.map((item): News => ({
    ...item,
    sequence: item.sequence !== undefined ? item.sequence : undefined,
  }));

  // Sort by published date (newest first)
  news = news.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return limit ? news.slice(0, limit) : news;
}

/**
 * Fetches a single news article by slug
 * @param slug - News article slug
 * @returns News article or null
 */
export async function getNewsBySlug(slug: string): Promise<News | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/news-articles?filters[slug][$eq]=${slug}&populate=*`;
      const response = await fetchStrapi<any[]>(url);

      if (!response.data || response.data.length === 0) return null;

      const item = response.data[0];
      const isV4Structure = item.attributes !== undefined;
      const newsData = isV4Structure ? item.attributes : item;

      // Extract image - handle both v4 and v5 structures
      const imageData = isV4Structure ? newsData.image : item.image;
      let imageUrl: string | undefined = undefined;

      if (imageData) {
        if (typeof imageData === "object" && "url" in imageData) {
          // Strapi v5: direct object with url property
          const url = imageData.url as string;
          imageUrl = url.startsWith("http")
            ? url
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
        } else {
          // Strapi v4: nested structure
          imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
        }
      }

      // Extract video - handle both v4 and v5 structures
      const videoData = isV4Structure ? newsData.video : item.video;
      let videoUrl: string | undefined = undefined;

      if (videoData) {
        if (typeof videoData === "object" && "data" in videoData && videoData.data) {
          // Strapi v4/v5: nested structure with data
          const videoAttributes = videoData.data?.attributes || videoData.data;
          const url = videoAttributes?.url || videoData.data?.url;
          if (url) {
            videoUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          }
        } else if (typeof videoData === "object" && "url" in videoData) {
          // Strapi v5: direct object with url property
          const url = videoData.url as string;
          videoUrl = url.startsWith("http")
            ? url
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
        } else {
          // Strapi v4: nested structure
          videoUrl = getStrapiImageUrlUtil(videoData) || undefined;
        }
      }

      // Extract YouTube and Instagram URLs
      const youtubeUrl = newsData.youtubeUrl || item.youtubeUrl || undefined;
      const instagramUrl = newsData.instagramUrl || item.instagramUrl || undefined;

      // Extract publishedAt (fallback to publishDate or createdAt if not available)
      const publishedAt = newsData.publishedAt || newsData.publishDate || newsData.createdAt || item.publishedAt || item.publishDate || item.createdAt;

      return {
        id: item.id.toString(),
        title: newsData.title || item.title,
        slug: newsData.slug || item.slug,
        shortDescription: newsData.shortDescription || item.shortDescription || "",
        content: newsData.content || item.content || "",
        image: imageUrl,
        video: videoUrl,
        youtubeUrl: youtubeUrl,
        instagramUrl: instagramUrl,
        category: newsData.category || item.category || "",
        publishedAt: publishedAt,
      };
    } catch (error) {
      console.error("Error fetching news from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const news = await getNews();
  return news.find((item) => item.slug === slug) || null;
}

/**
 * Fetches all events
 * @param limit - Optional limit for number of events
 * @param upcomingOnly - Filter to only upcoming events
 * @returns Array of events
 */
export async function getEvents(
  limit?: number,
  upcomingOnly: boolean = false,
): Promise<Event[]> {
  if (shouldUseStrapi()) {
    try {
      // Sort by published date (newest first)
      let url = `/api/events?populate=*&sort[0]=publishedAt:desc&pagination[pageSize]=100`;

      if (upcomingOnly) {
        const now = new Date().toISOString();
        url += `&filters[eventDate][$gte]=${now}`;
      }

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching events from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("Strapi events response:", {
          dataLength: response.data?.length || 0,
          hasMeta: !!response.meta,
          firstItem: response.data?.[0] ? Object.keys(response.data[0]) : [],
        });
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      let events: Event[] = (response.data || []).map((item: any) => {
        // Check if this is Strapi v4 structure (has attributes) or v5/flat structure
        const isV4Structure = item.attributes !== undefined;
        const eventData = isV4Structure ? item.attributes : item;
        
        if (process.env.NODE_ENV === "development" && response.data?.length > 0) {
          console.log("Processing event item:", {
            id: item.id,
            isV4Structure,
            hasAttributes: !!item.attributes,
            title: isV4Structure ? item.attributes?.title : item.title,
          });
        }

        // Extract coverImage - handle both v4 and v5 structures
        const coverImageData = isV4Structure ? eventData.coverImage : item.coverImage;
        let coverImageUrl: string | undefined = undefined;
        
        if (coverImageData) {
          // Strapi v5: direct object with url property
          if (typeof coverImageData === "object" && "url" in coverImageData) {
            const url = coverImageData.url as string;
            coverImageUrl = url.startsWith("http") 
              ? url 
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          } else {
            // Strapi v4: nested structure
            coverImageUrl = getStrapiImageUrlUtil(coverImageData) || undefined;
          }
        }

        // Extract gallery - handle both v4 and v5 structures
        const galleryData = isV4Structure 
          ? eventData.gallery?.data || eventData.gallery 
          : item.gallery?.data || item.gallery;
        
        const galleryUrls: string[] = [];
        if (Array.isArray(galleryData) && galleryData.length > 0) {
          galleryUrls.push(...galleryData.map((img: any) => {
            // Strapi v5: direct object with url property
            if (typeof img === "object" && img !== null && "url" in img) {
              const url = img.url as string;
              return url.startsWith("http") 
                ? url 
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            }
            // Strapi v4: nested structure
            const extracted = getStrapiImageUrlUtil(img);
            return extracted;
          }).filter((url: string | null): url is string => url !== null));
        }

        if (process.env.NODE_ENV === "development") {
          console.log("Event image extraction:", {
            id: item.id,
            hasCoverImage: !!coverImageData,
            coverImageUrl,
            galleryCount: galleryUrls.length,
          });
        }

        // Extract YouTube and Instagram URLs
        const youtubeUrl = eventData.youtubeUrl || item.youtubeUrl || undefined;
        const instagramUrl = eventData.instagramUrl || item.instagramUrl || undefined;

        // Extract publishedAt (fallback to publishDate or createdAt if not available)
        const publishedAt = eventData.publishedAt || eventData.publishDate || eventData.createdAt || item.publishedAt || item.publishDate || item.createdAt;

        // Extract sequence number
        const sequence = eventData.sequence !== undefined ? eventData.sequence : (item.sequence !== undefined ? item.sequence : undefined);

        return {
          id: item.id.toString(),
          title: eventData.title || item.title,
          slug: eventData.slug || item.slug,
          description: eventData.description || item.description || "",
          eventDate: eventData.eventDate || item.eventDate,
          location: eventData.location || item.location || "",
          coverImage: coverImageUrl,
          gallery: galleryUrls,
          youtubeUrl: youtubeUrl,
          instagramUrl: instagramUrl,
          publishedAt: publishedAt,
          sequence: sequence,
        };
      });

      // Sort by published date (newest first) to ensure correct order
      events = events.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${events.length} events from Strapi`);
      }

      return limit ? events.slice(0, limit) : events;
    } catch (error) {
      console.error("❌ Error fetching events from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      // Fallback to JSON - don't throw, allow graceful fallback
    }
  }

  // If not using Strapi, use JSON fallback
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ Using JSON fallback for events (USE_STRAPI:", shouldUseStrapi(), ")");
    console.warn("⚠️ STRAPI_URL is:", getStrapiUrl());
  }

  // Fallback to JSON files
  const eventsData = await import("@/data/events.json");
  let events = eventsData.default as any[];

  // Ensure publishedAt exists (fallback to createdAt or eventDate)
  // Also ensure sequence is included
  events = events.map((event): Event => ({
    ...event,
    publishedAt: event.publishedAt || event.publishDate || event.createdAt || event.eventDate,
    sequence: event.sequence !== undefined ? event.sequence : undefined,
  }));

  if (upcomingOnly) {
    const now = new Date();
    events = events.filter((event) => new Date(event.eventDate) >= now);
  }

  // Sort by published date (newest first)
  events = events.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return limit ? events.slice(0, limit) : events;
}

/**
 * Fetches a single event by slug
 * @param slug - Event slug
 * @returns Event or null
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/events?filters[slug][$eq]=${slug}&populate=*`;
      const response = await fetchStrapi<any[]>(url);

      if (!response.data || response.data.length === 0) return null;

      const item = response.data[0];
      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const isV4Structure = item.attributes !== undefined;
      const eventData = isV4Structure ? item.attributes : item;

      // Extract coverImage - handle both v4 and v5 structures
      const coverImageData = isV4Structure ? eventData.coverImage : item.coverImage;
      let coverImageUrl: string | undefined = undefined;
      
      if (coverImageData) {
        // Strapi v5: direct object with url property
        if (typeof coverImageData === "object" && "url" in coverImageData) {
          const url = coverImageData.url as string;
          coverImageUrl = url.startsWith("http") 
            ? url 
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
        } else {
          // Strapi v4: nested structure
          coverImageUrl = getStrapiImageUrlUtil(coverImageData) || undefined;
        }
      }

      // Extract gallery - handle both v4 and v5 structures
      const galleryData = isV4Structure 
        ? eventData.gallery?.data || eventData.gallery 
        : item.gallery?.data || item.gallery;
      
      const galleryUrls: string[] = [];
      if (Array.isArray(galleryData) && galleryData.length > 0) {
        galleryUrls.push(...galleryData.map((img: any) => {
          // Strapi v5: direct object with url property
          if (typeof img === "object" && img !== null && "url" in img) {
            const url = img.url as string;
            return url.startsWith("http") 
              ? url 
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          }
          // Strapi v4: nested structure
          const extracted = getStrapiImageUrlUtil(img);
          return extracted;
        }).filter((url: string | null): url is string => url !== null));
      }

      // Extract YouTube and Instagram URLs
      const youtubeUrl = eventData.youtubeUrl || item.youtubeUrl || undefined;
      const instagramUrl = eventData.instagramUrl || item.instagramUrl || undefined;

      // Extract publishedAt (fallback to publishDate or createdAt if not available)
      const publishedAt = eventData.publishedAt || eventData.publishDate || eventData.createdAt || item.publishedAt || item.publishDate || item.createdAt;

      return {
        id: item.id.toString(),
        title: eventData.title || item.title,
        slug: eventData.slug || item.slug,
        description: eventData.description || item.description || "",
        eventDate: eventData.eventDate || item.eventDate,
        location: eventData.location || item.location || "",
        coverImage: coverImageUrl,
        gallery: galleryUrls,
        youtubeUrl: youtubeUrl,
        instagramUrl: instagramUrl,
        publishedAt: publishedAt,
      };
    } catch (error) {
      console.error("Error fetching event from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const events = await getEvents();
  return events.find((item) => item.slug === slug) || null;
}

/**
 * Fetches all gallery items
 * @param limit - Optional limit for number of items
 * @returns Array of gallery items
 */
export async function getGallery(limit?: number): Promise<GalleryItem[]> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/galleries?populate=*&sort[0]=publishedAt:desc`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching gallery from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      let gallery: GalleryItem[] = (response.data || []).map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const galleryData = isV4Structure ? item.attributes : item;

        // Extract images - handle both v4 and v5 structures
        const imagesData = isV4Structure 
          ? galleryData.images?.data || galleryData.images 
          : galleryData.images?.data || galleryData.images || item.images;
        
        const imageUrls: string[] = [];
        if (Array.isArray(imagesData) && imagesData.length > 0) {
          imageUrls.push(...imagesData.map((img: any) => {
            // Strapi v5: direct object with url property
            if (typeof img === "object" && img !== null && "url" in img) {
              const url = img.url as string;
              return url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            }
            // Strapi v4: nested structure
            const extracted = getStrapiImageUrlUtil(img);
            return extracted;
          }).filter((url: string | null): url is string => url !== null));
        }

        // Extract eventId if exists
        const eventData = isV4Structure 
          ? galleryData.event?.data || galleryData.event 
          : item.event?.data || item.event;
        const eventId = eventData?.id?.toString() || undefined;

        // Extract YouTube and Instagram URLs
        const youtubeUrl = galleryData.youtubeUrl || item.youtubeUrl || undefined;
        const instagramUrl = galleryData.instagramUrl || item.instagramUrl || undefined;

        // Extract publishedAt (fallback to publishDate or createdAt if not available)
        const publishedAt = galleryData.publishedAt || galleryData.publishDate || galleryData.createdAt || item.publishedAt || item.publishDate || item.createdAt;
        const createdAt = galleryData.createdAt || item.createdAt;

        // Debug logging in development
        if (process.env.NODE_ENV === "development" && (youtubeUrl || instagramUrl)) {
          console.log(`Gallery item ${item.id}:`, {
            title: galleryData.title || item.title,
            youtubeUrl,
            instagramUrl,
            hasYoutubeUrl: !!youtubeUrl,
            hasInstagramUrl: !!instagramUrl,
          });
        }

        return {
          id: item.id.toString(),
          title: galleryData.title || item.title || "",
          description: galleryData.description || item.description || undefined,
          images: imageUrls,
          eventId,
          createdAt: createdAt,
          publishedAt: publishedAt,
          youtubeUrl: youtubeUrl,
          instagramUrl: instagramUrl,
        };
      });

      // Sort by published date (newest first) to ensure correct order
      gallery = gallery.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${gallery.length} gallery items from Strapi`);
      }

      return limit ? gallery.slice(0, limit) : gallery;
    } catch (error) {
      console.error("Error fetching gallery from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const galleryData = await import("@/data/gallery.json");
  let gallery: GalleryItem[] = (galleryData.default as any[]).map((item) => ({
    ...item,
    eventId: item.eventId ?? undefined,
    publishedAt: item.publishedAt || item.publishDate || item.createdAt,
  }));

  // Sort by published date (newest first)
  gallery = gallery.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return limit ? gallery.slice(0, limit) : gallery;
}

/**
 * Fetches all active notifications
 * @returns Array of active notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  if (shouldUseStrapi()) {
    try {
      const now = new Date().toISOString();
      const url = `/api/notifications?filters[$or][0][expiryDate][$gt]=${now}&filters[$or][1][expiryDate][$null]=true&populate=*&sort[0]=createdAt:desc`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching notifications from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const notifications: Notification[] = (response.data || []).map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const notificationData = isV4Structure ? item.attributes : item;

        return {
          id: item.id.toString(),
          title: notificationData.title || item.title,
          message: notificationData.message || item.message || "",
          priority: (notificationData.priority || item.priority || "normal") as "normal" | "urgent",
          expiryDate: notificationData.expiryDate || item.expiryDate || undefined,
          createdAt: notificationData.createdAt || item.createdAt,
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${notifications.length} notifications from Strapi`);
      }

      return notifications;
    } catch (error) {
      console.error("Error fetching notifications from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const notificationsData = await import("@/data/notifications.json");
  const notifications = notificationsData.default as Notification[];
  const now = new Date();

  // Filter out expired notifications
  return notifications.filter((notification) => {
    if (!notification.expiryDate) return true;
    return new Date(notification.expiryDate) > now;
  });
}

/**
 * Fetches all policies
 * @returns Array of policies
 */
export async function getPolicies(): Promise<Policy[]> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/policies?populate=*`;

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching policies from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5 (flat structure)
      const policies: Policy[] = (response.data || []).map((item: any) => {
        // Extract data - handle both v4 (with attributes) and v5 (flat)
        const itemData = item.attributes ? item.attributes : item;
        const itemId = item.id || "";

        // Extract documents array
        const documentsData = itemData.documents || [];
        const documents: PolicyDocument[] = [];

        if (Array.isArray(documentsData) && documentsData.length > 0) {
          documents.push(...documentsData.map((doc: any) => {
            // Extract file URL - handle multiple structures:
            // Strapi v4: file.data.attributes.url
            // Strapi v5: file.url
            // Direct: file.url (string)
            let fileUrl = "";
            let fileSize: number | undefined = undefined;
            let fileMime: string | undefined = undefined;

            // Priority 1: Strapi v4 nested structure - file.data.attributes.url
            if (doc.file?.data?.attributes?.url) {
              const url = doc.file.data.attributes.url as string;
              fileUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
              fileSize = doc.file.data.attributes.size;
              fileMime = doc.file.data.attributes.mime;
            }
            // Priority 2: Strapi v5 flat structure - file.url
            else if (doc.file?.url) {
              const url = doc.file.url as string;
              fileUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
              fileSize = doc.file.size;
              fileMime = doc.file.mime;
            }
            // Priority 3: Direct string URL
            else if (typeof doc.file === "string" && doc.file.length > 0) {
              fileUrl = doc.file.startsWith("http")
                ? doc.file
                : `${getStrapiUrl()}${doc.file.startsWith("/") ? "" : "/"}${doc.file}`;
            }

            return {
              id: doc.id?.toString() || "",
              documentName: doc.documentName || "Document",
              file: fileUrl,
              mime: fileMime,
              size: fileSize,
            };
          }).filter((doc: PolicyDocument) => doc.file && doc.file.length > 0)); // Only include documents with valid file URLs
        }

        // Ensure we always have a valid ID
        const policyId = itemId != null ? String(itemId) : "";

        return {
          id: policyId,
          slug: itemData.slug || item.slug || undefined,
          title: itemData.title || "Untitled Policy",
          description: itemData.description || null,
          category: itemData.category || null,
          documents: documents.length > 0 ? documents : undefined,
          updatedAt: itemData.updatedAt || itemData.createdAt || itemData.publishedAt || new Date().toISOString(),
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${policies.length} policies from Strapi`);
        if (policies.length > 0) {
          console.log("Sample policy IDs:", policies.slice(0, 3).map(p => ({ id: p.id, title: p.title })));
        }
      }

      return policies;
    } catch (error) {
      console.error("Error fetching policies from Strapi:", error);
      return [];
    }
  }

  return [];
}

/**
 * Fetches a single policy by slug
 * @param slug - Policy slug
 * @returns Policy or null
 */
export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/policies?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 [getPolicyBySlug] Fetching policy from Strapi:", {
          slug,
          url: `${strapiUrl}${url}`,
          fullUrl: `${strapiUrl}${url}`,
        });
      }

      let response;
      try {
        response = await fetchStrapi<any[]>(url);
      } catch (error) {
        // Handle 404 and other API errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [getPolicyBySlug] API Error for slug:", slug, {
            error: errorMessage,
            url: `${getStrapiUrl()}${url}`,
          });
        }
        // If it's a 404, the policy doesn't exist - return null
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          return null;
        }
        // For other errors, re-throw or return null
        return null;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("📦 [getPolicyBySlug] Response received:", {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataLength: Array.isArray(response?.data) ? response.data.length : 0,
          dataType: typeof response?.data,
          fullResponse: JSON.stringify(response, null, 2).substring(0, 1000),
        });
      }

      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [getPolicyBySlug] No data in response for slug:", slug);
        }
        return null;
      }

      // Get the first (and should be only) policy from the filtered results
      const item = response.data[0];
      const itemData = item.attributes ? item.attributes : item;
      const itemId = item.id || "";

      // Extract documents array - check both itemData.documents and item.documents
      const documentsData = itemData.documents || item.documents || [];
      const documents: PolicyDocument[] = [];

      if (process.env.NODE_ENV === "development") {
        console.log("📄 [getPolicyBySlug] Documents data:", {
          hasItemDataDocuments: !!itemData.documents,
          hasItemDocuments: !!item.documents,
          documentsCount: documentsData.length,
          documentsStructure: documentsData.length > 0 ? Object.keys(documentsData[0]) : [],
        });
      }

      if (Array.isArray(documentsData) && documentsData.length > 0) {
        documents.push(...documentsData.map((doc: any) => {
          // Extract file URL - handle multiple structures:
          // Strapi v4: file.data.attributes.url
          // Strapi v5 flat: file.url (direct object)
          // Direct: file.url (string)
          let fileUrl = "";
          let fileSize: number | undefined = undefined;
          let fileMime: string | undefined = undefined;

          if (process.env.NODE_ENV === "development") {
            console.log("📄 [getPolicyBySlug] Processing document:", {
              docId: doc.id,
              docName: doc.documentName,
              hasFile: !!doc.file,
              fileType: typeof doc.file,
              fileKeys: doc.file ? Object.keys(doc.file) : [],
            });
          }

          // Priority 1: Strapi v4 nested structure - file.data.attributes.url
          if (doc.file?.data?.attributes?.url) {
            const url = doc.file.data.attributes.url as string;
            fileUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            fileSize = doc.file.data.attributes.size;
            fileMime = doc.file.data.attributes.mime;
          }
          // Priority 2: Strapi v5 flat structure - file.url (direct object)
          else if (doc.file?.url) {
            const url = doc.file.url as string;
            fileUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            fileSize = doc.file.size;
            fileMime = doc.file.mime;
          }
          // Priority 3: Direct string URL
          else if (typeof doc.file === "string" && doc.file.length > 0) {
            fileUrl = doc.file.startsWith("http")
              ? doc.file
              : `${getStrapiUrl()}${doc.file.startsWith("/") ? "" : "/"}${doc.file}`;
          }

          if (process.env.NODE_ENV === "development") {
            console.log("📄 [getPolicyBySlug] Extracted file:", {
              docId: doc.id,
              fileUrl: fileUrl.substring(0, 80),
              hasUrl: !!fileUrl,
              fileSize,
              fileMime,
            });
          }

          return {
            id: doc.id?.toString() || "",
            documentName: doc.documentName || "Document",
            file: fileUrl,
            mime: fileMime,
            size: fileSize,
          };
        }).filter((doc: PolicyDocument) => doc.file && doc.file.length > 0));
      }

      if (process.env.NODE_ENV === "development") {
        console.log("📄 [getPolicyBySlug] Final documents:", {
          totalDocuments: documents.length,
          documents: documents.map(d => ({
            id: d.id,
            name: d.documentName,
            hasFile: !!d.file,
            fileUrl: d.file?.substring(0, 60),
          })),
        });
      }

      // Ensure we always have a valid ID
      const policyId = itemId != null ? String(itemId) : "";

      const policy = {
        id: policyId,
        slug: itemData.slug || item.slug || slug,
        title: itemData.title || "Untitled Policy",
        description: itemData.description || null,
        category: itemData.category || null,
        documents: documents.length > 0 ? documents : undefined,
        updatedAt: itemData.updatedAt || itemData.createdAt || itemData.publishedAt || new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [getPolicyBySlug] Policy extracted:", {
          id: policy.id,
          slug: policy.slug,
          title: policy.title,
          documentsCount: policy.documents?.length || 0,
        });
      }

      return policy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [getPolicyBySlug] Error fetching policy from Strapi:", {
        slug,
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      return null;
    }
  }

  return null;
}

/**
 * Fetches a single policy by ID
 * @param id - Policy ID
 * @returns Policy or null
 */
export async function getPolicyById(id: string): Promise<Policy | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/policies/${id}?populate=*`;

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 [getPolicyById] Fetching policy from Strapi:", {
          id,
          url: `${strapiUrl}${url}`,
          fullUrl: `${strapiUrl}${url}`,
        });
      }

      let response;
      try {
        response = await fetchStrapi<any>(url);
      } catch (error) {
        // Handle 404 and other API errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === "development") {
          console.error("❌ [getPolicyById] API Error for ID:", id, {
            error: errorMessage,
            url: `${getStrapiUrl()}${url}`,
          });
        }
        // If it's a 404, the policy doesn't exist - return null
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          return null;
        }
        // For other errors, re-throw or return null
        return null;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("📦 [getPolicyById] Response received:", {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
          hasAttributes: !!response?.data?.attributes,
          attributesKeys: response?.data?.attributes ? Object.keys(response.data.attributes) : [],
          responseId: response?.data?.id,
          responseSlug: response?.data?.attributes?.slug || response?.data?.slug,
          fullResponse: JSON.stringify(response, null, 2).substring(0, 1500),
        });
      }

      if (!response || !response.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [getPolicyById] No data in response for ID:", id);
        }
        return null;
      }

      // Handle both Strapi v4 (with attributes) and v5 (flat structure)
      const item = response.data.attributes ? response.data.attributes : response.data;
      const itemId = response.data.id || id;
      
      // Check if slug exists in the response
      const itemSlug = item.slug || response.data.slug;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [getPolicyById] Extracted data:", {
          requestedId: id,
          responseId: itemId,
          itemSlug: itemSlug,
          hasAttributes: !!response.data.attributes,
          itemKeys: Object.keys(item),
        });
      }

      // Extract documents array - check both item.documents and response.data.documents
      const documentsData = item.documents || response.data.documents || [];
      const documents: PolicyDocument[] = [];

      if (process.env.NODE_ENV === "development") {
        console.log("📄 [getPolicyById] Documents data:", {
          hasItemDocuments: !!item.documents,
          hasDataDocuments: !!response.data.documents,
          documentsCount: documentsData.length,
          documentsStructure: documentsData.length > 0 ? Object.keys(documentsData[0]) : [],
        });
      }

      if (Array.isArray(documentsData) && documentsData.length > 0) {
        documents.push(...documentsData.map((doc: any) => {
          // Extract file URL - handle multiple structures:
          // Strapi v4: file.data.attributes.url
          // Strapi v5 flat: file.url (direct object)
          // Direct: file.url (string)
          let fileUrl = "";
          let fileSize: number | undefined = undefined;
          let fileMime: string | undefined = undefined;

          if (process.env.NODE_ENV === "development") {
            console.log("📄 [getPolicyById] Processing document:", {
              docId: doc.id,
              docName: doc.documentName,
              hasFile: !!doc.file,
              fileType: typeof doc.file,
              fileKeys: doc.file ? Object.keys(doc.file) : [],
            });
          }

          // Priority 1: Strapi v4 nested structure - file.data.attributes.url
          if (doc.file?.data?.attributes?.url) {
            const url = doc.file.data.attributes.url as string;
            fileUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            fileSize = doc.file.data.attributes.size;
            fileMime = doc.file.data.attributes.mime;
          }
          // Priority 2: Strapi v5 flat structure - file.url (direct object)
          else if (doc.file?.url) {
            const url = doc.file.url as string;
            fileUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            fileSize = doc.file.size;
            fileMime = doc.file.mime;
          }
          // Priority 3: Direct string URL
          else if (typeof doc.file === "string" && doc.file.length > 0) {
            fileUrl = doc.file.startsWith("http")
              ? doc.file
              : `${getStrapiUrl()}${doc.file.startsWith("/") ? "" : "/"}${doc.file}`;
          }

          if (process.env.NODE_ENV === "development") {
            console.log("📄 [getPolicyById] Extracted file:", {
              docId: doc.id,
              fileUrl: fileUrl.substring(0, 80),
              hasUrl: !!fileUrl,
              fileSize,
              fileMime,
            });
          }

          return {
            id: doc.id?.toString() || "",
            documentName: doc.documentName || "Document",
            file: fileUrl,
            mime: fileMime,
            size: fileSize,
          };
        }).filter((doc: PolicyDocument) => doc.file && doc.file.length > 0));
      }

      if (process.env.NODE_ENV === "development") {
        console.log("📄 [getPolicyById] Final documents:", {
          totalDocuments: documents.length,
          documents: documents.map(d => ({
            id: d.id,
            name: d.documentName,
            hasFile: !!d.file,
            fileUrl: d.file?.substring(0, 60),
          })),
        });
      }

      // Ensure we always have a valid ID
      const policyId = itemId != null ? String(itemId) : id;

      const policy = {
        id: policyId,
        slug: item.slug || response.data.slug || undefined,
        title: item.title || "Untitled Policy",
        description: item.description || null,
        category: item.category || null,
        documents: documents.length > 0 ? documents : undefined,
        updatedAt: item.updatedAt || item.createdAt || item.publishedAt || new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.log("✅ [getPolicyById] Policy extracted:", {
          requestedId: id,
          extractedId: policy.id,
          responseId: itemId,
          itemSlug: itemSlug,
          title: policy.title,
          documentsCount: policy.documents?.length || 0,
          hasSlug: !!itemSlug,
        });
        
        // Warn if ID doesn't match requested ID and slug matches
        if (String(policy.id) !== String(id) && itemSlug === id) {
          console.warn("⚠️ [getPolicyById] ID mismatch detected - requested ID might be a slug:", {
            requestedId: id,
            extractedId: policy.id,
            slug: itemSlug,
            message: "The requested ID appears to be a slug. Consider using getPolicyBySlug() instead.",
          });
        }
      }

      return policy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [getPolicyById] Error fetching policy from Strapi:", {
        id,
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      return null;
    }
  }

  return null;
}

/**
 * Fetches contact page data
 * @returns Contact page data or null
 */
export async function getContactPageData(): Promise<ContactPageData | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/contact?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching contact page data from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("Contact API response:", {
          responseType: typeof response.data,
          isArray: Array.isArray(response.data),
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
        });
      }

      if (!response.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No contact data returned from Strapi");
        }
        return null;
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const isV4Structure = response.data.attributes !== undefined;
      const contactData = isV4Structure ? response.data.attributes : response.data;

      const contactPageData: ContactPageData = {
        id: response.data.id.toString(),
        pageTitle: contactData.pageTitle || response.data.pageTitle || "",
        pageSubtitle: contactData.pageSubtitle || response.data.pageSubtitle || null,
        phoneNumber: contactData.phoneNumber || response.data.phoneNumber || undefined,
        emailAddress: contactData.emailAddress || response.data.emailAddress || undefined,
        address: contactData.address || response.data.address || undefined,
        officeHours: contactData.officeHours || response.data.officeHours || undefined,
        messageSectionTitle: contactData.messageSectionTitle || response.data.messageSectionTitle || null,
        generalInquiryText: contactData.generalInquiryText || response.data.generalInquiryText || null,
        urgentMattersText: contactData.urgentMattersText || response.data.urgentMattersText || null,
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched contact page data from Bemo CMS`);
        console.log("Contact data:", {
          pageTitle: contactPageData.pageTitle,
          hasPhone: !!contactPageData.phoneNumber,
          hasEmail: !!contactPageData.emailAddress,
          hasAddress: !!contactPageData.address,
        });
      }

      return contactPageData;
    } catch (error) {
      console.error("❌ Error fetching contact page data from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      // Return null to trigger fallback
      return null;
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ USE_STRAPI is false, using default contact info");
    }
  }

  return null;
}

/**
 * Fetches homepage content data
 * @returns Homepage data or null if not available
 */
export async function getHomepage(): Promise<Homepage | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/homepage?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 Fetching homepage data from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("📦 Homepage API response:", {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
        });
      }

      if (!response?.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No homepage data returned from Strapi");
        }
        return null;
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const isV4Structure = response.data.attributes !== undefined;
      const homepageData = isV4Structure ? response.data.attributes : response.data;

      const homepage: Homepage = {
        id: response.data.id.toString(),
        heroWelcomeText: homepageData.heroWelcomeText || response.data.heroWelcomeText || "Welcome to",
        heroTitleText: homepageData.heroTitleText || response.data.heroTitleText || "Greenwood City",
        heroSubtitleText: homepageData.heroSubtitleText || response.data.heroSubtitleText || "Block C",
        heroDescription: homepageData.heroDescription || response.data.heroDescription || "Building a stronger community together..",
        heroDescriptionMobile: homepageData.heroDescriptionMobile || response.data.heroDescriptionMobile || null,
        newsSectionTitle: homepageData.newsSectionTitle || response.data.newsSectionTitle || "Latest News",
        newsSectionSubtitle: homepageData.newsSectionSubtitle || response.data.newsSectionSubtitle || "Stay informed with the latest community updates",
        eventsSectionTitle: homepageData.eventsSectionTitle || response.data.eventsSectionTitle || "Events",
        eventsSectionSubtitle: homepageData.eventsSectionSubtitle || response.data.eventsSectionSubtitle || "Join us for exciting community events and activities",
        gallerySectionTitle: homepageData.gallerySectionTitle || response.data.gallerySectionTitle || "Photo Gallery",
        gallerySectionSubtitle: homepageData.gallerySectionSubtitle || response.data.gallerySectionSubtitle || "Memorable moments from our community events and activities",
        advertisementsSectionTitle: homepageData.advertisementsSectionTitle || response.data.advertisementsSectionTitle || "Local Advertisements",
        advertisementsSectionSubtitle: homepageData.advertisementsSectionSubtitle || response.data.advertisementsSectionSubtitle || "Discover offers and services from local residents",
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched homepage data from Strapi`);
        console.log("Homepage data:", {
          heroTitleText: homepage.heroTitleText,
          heroSubtitleText: homepage.heroSubtitleText,
          newsSectionTitle: homepage.newsSectionTitle,
        });
      }

      return homepage;
    } catch (error) {
      console.error("❌ Error fetching homepage data from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      return null;
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ USE_STRAPI is false, using default homepage content");
    }
  }

  return null;
}

/**
 * Fetches vision and mission data
 * @returns VisionMission data or null if not available
 */
export async function getVisionMission(): Promise<VisionMission | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/vision-mission?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 Fetching vision-mission data from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (!response?.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No vision-mission data returned from Strapi");
        }
        return null;
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const isV4Structure = response.data.attributes !== undefined;
      const vmData = isV4Structure ? response.data.attributes : response.data;

      // Extract images
      const visionImageData = isV4Structure 
        ? vmData.visionImage?.data || vmData.visionImage
        : response.data.visionImage?.data || response.data.visionImage;
      
      const missionImageData = isV4Structure 
        ? vmData.missionImage?.data || vmData.missionImage
        : response.data.missionImage?.data || response.data.missionImage;

      const visionImage = getStrapiImageUrlUtil(visionImageData);
      const missionImage = getStrapiImageUrlUtil(missionImageData);

      const visionMission: VisionMission = {
        id: response.data.id.toString(),
        visionTitle: vmData.visionTitle || response.data.visionTitle || "Our Vision",
        visionContent: vmData.visionContent || response.data.visionContent || "",
        missionTitle: vmData.missionTitle || response.data.missionTitle || "Our Mission",
        missionContent: vmData.missionContent || response.data.missionContent || "",
        visionImage: visionImage || undefined,
        missionImage: missionImage || undefined,
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched vision-mission data from Strapi`);
      }

      return visionMission;
    } catch (error) {
      console.error("❌ Error fetching vision-mission data from Strapi:", error);
      return null;
    }
  }

  return null;
}

/**
 * Fetches theme/branding data
 * @returns Theme data or null if not available
 */
export async function getTheme(): Promise<Theme | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/theme?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 Fetching theme data from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("📦 Theme API response:", {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
        });
      }

      if (!response?.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No theme data returned from Strapi");
        }
        return null;
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const isV4Structure = response.data.attributes !== undefined;
      const themeData = isV4Structure ? response.data.attributes : response.data;

      // Extract logo URLs
      // Handle both Strapi v4 (nested) and v5 (flat) structures
      let logoUrl: string | undefined = undefined;
      let logoDarkUrl: string | undefined = undefined;
      let faviconUrl: string | undefined = undefined;

      // Check logo - can be in themeData or directly in response.data
      const logoSource = themeData.logo || response.data.logo;
      
      if (logoSource) {
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Logo extraction:", {
            hasLogo: !!logoSource,
            logoType: typeof logoSource,
            hasUrl: typeof logoSource === "object" && "url" in logoSource,
            logoKeys: typeof logoSource === "object" ? Object.keys(logoSource) : [],
          });
        }

        // Strapi v5: logo is already populated as an object with url property
        if (typeof logoSource === "object" && logoSource !== null && "url" in logoSource) {
          const url = (logoSource as any).url as string;
          logoUrl = url.startsWith("http")
            ? url
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
          
          if (process.env.NODE_ENV === "development") {
            console.log("✅ Logo URL extracted:", logoUrl);
          }
        } else if (typeof logoSource === "object" && logoSource !== null && "data" in logoSource) {
          // Strapi v4: nested structure with data.attributes.url
          const logoData = (logoSource as any).data;
          logoUrl = getStrapiImageUrlUtil(logoData) || undefined;
        } else {
          // Try using the utility function as fallback
          logoUrl = getStrapiImageUrlUtil(logoSource) || undefined;
        }
      }

      // Check logoDark
      const logoDarkSource = themeData.logoDark || response.data.logoDark;
      if (logoDarkSource) {
        if (typeof logoDarkSource === "object" && logoDarkSource !== null && "url" in logoDarkSource) {
          const url = (logoDarkSource as any).url as string;
          logoDarkUrl = url.startsWith("http")
            ? url
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
        } else if (typeof logoDarkSource === "object" && logoDarkSource !== null && "data" in logoDarkSource) {
          const logoDarkData = (logoDarkSource as any).data;
          logoDarkUrl = getStrapiImageUrlUtil(logoDarkData) || undefined;
        } else {
          logoDarkUrl = getStrapiImageUrlUtil(logoDarkSource) || undefined;
        }
      }

      // Check favicon
      const faviconSource = themeData.favicon || response.data.favicon;
      if (faviconSource) {
        if (typeof faviconSource === "object" && faviconSource !== null && "url" in faviconSource) {
          const url = (faviconSource as any).url as string;
          faviconUrl = url.startsWith("http")
            ? url
            : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
        } else if (typeof faviconSource === "object" && faviconSource !== null && "data" in faviconSource) {
          const faviconData = (faviconSource as any).data;
          faviconUrl = getStrapiImageUrlUtil(faviconData) || undefined;
        } else {
          faviconUrl = getStrapiImageUrlUtil(faviconSource) || undefined;
        }
      }

      const theme: Theme = {
        id: response.data.id.toString(),
        siteName: themeData.siteName || response.data.siteName || undefined,
        siteShortName: themeData.siteShortName || response.data.siteShortName || undefined,
        siteDescription: themeData.siteDescription || response.data.siteDescription || undefined,
        logo: logoUrl,
        logoDark: logoDarkUrl,
        favicon: faviconUrl,
        primaryColor: themeData.primaryColor || response.data.primaryColor || "#2F855A",
        primaryColorDark: themeData.primaryColorDark || response.data.primaryColorDark || "#22543D",
        primaryColorLight: themeData.primaryColorLight || response.data.primaryColorLight || "#48BB78",
        secondaryColor: themeData.secondaryColor || response.data.secondaryColor || null,
        backgroundColor: themeData.backgroundColor || response.data.backgroundColor || "#F0FFF4",
        backgroundColorDark: themeData.backgroundColorDark || response.data.backgroundColorDark || "#C6F6D5",
        textColor: themeData.textColor || response.data.textColor || "#1A202C",
        textColorLight: themeData.textColorLight || response.data.textColorLight || "#4A5568",
        themeColor: themeData.themeColor || response.data.themeColor || "#2F855A",
        accentColor: themeData.accentColor || response.data.accentColor || null,
        errorColor: themeData.errorColor || response.data.errorColor || "#E53E3E",
        successColor: themeData.successColor || response.data.successColor || "#38A169",
        warningColor: themeData.warningColor || response.data.warningColor || "#D69E2E",
        infoColor: themeData.infoColor || response.data.infoColor || "#3182CE",
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched theme data from Strapi`);
        console.log("Theme data:", {
          primaryColor: theme.primaryColor,
          backgroundColor: theme.backgroundColor,
          textColor: theme.textColor,
          hasLogo: !!theme.logo,
        });
      }

      return theme;
    } catch (error) {
      console.error("❌ Error fetching theme data from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      // Re-throw StrapiApiError so layout can show maintenance page
      if (error instanceof StrapiApiError) {
        throw error;
      }
      return null;
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ USE_STRAPI is false, using default theme");
    }
  }

  return null;
}

/**
 * Fetches contact information (legacy - for backward compatibility)
 * Converts ContactPageData to ContactInfo array format
 * @returns Contact information array
 */
export async function getContactInfo(): Promise<ContactInfo[]> {
  const contactData = await getContactPageData();
  
  if (!contactData) {
    return [];
  }

  const contactInfo: ContactInfo[] = [];

  // Phone
  if (contactData.phoneNumber) {
    contactInfo.push({
      id: `${contactData.id}-phone`,
      title: "Phone",
      content: contactData.phoneNumber,
      link: `tel:${contactData.phoneNumber.replace(/\s+/g, "")}`,
      icon: "phone",
      order: 1,
    });
  }

  // Email
  if (contactData.emailAddress) {
    contactInfo.push({
      id: `${contactData.id}-email`,
      title: "Email",
      content: contactData.emailAddress,
      link: `mailto:${contactData.emailAddress}`,
      icon: "mail",
      order: 2,
    });
  }

  // Address
  if (contactData.address) {
    contactInfo.push({
      id: `${contactData.id}-address`,
      title: "Address",
      content: contactData.address,
      link: null,
      icon: "map",
      order: 3,
    });
  }

  // Office Hours
  if (contactData.officeHours) {
    contactInfo.push({
      id: `${contactData.id}-hours`,
      title: "Office Hours",
      content: contactData.officeHours,
      link: null,
      icon: "clock",
      order: 4,
    });
  }

  return contactInfo;
}

/**
 * Fetches RWA governing body members
 * @returns Array of RWA members
 */
export async function getRWAMembers(): Promise<RWAMember[]> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/rwas?populate=*&sort[0]=sequence:asc`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 RWA: USE_STRAPI is true");
        const strapiUrl = getStrapiUrl();
        console.log("🔍 RWA: STRAPI_URL:", strapiUrl);
        console.log("🔍 Fetching RWA members from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("📦 RWA API response:", {
          hasResponse: !!response,
          dataLength: response?.data?.length || 0,
          hasData: !!response?.data,
          dataType: Array.isArray(response?.data) ? "array" : typeof response?.data,
          firstItem: response?.data?.[0] ? Object.keys(response.data[0]) : [],
          fullResponse: JSON.stringify(response, null, 2).substring(0, 500),
        });
      }

      // Check if we got valid data
      if (!response || !response.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ RWA: No data in response, falling back to JSON");
        }
        throw new Error("No data in Strapi response");
      }

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const members: RWAMember[] = (response.data || []).map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const memberData = isV4Structure ? item.attributes : item;

        if (process.env.NODE_ENV === "development") {
          console.log("Processing RWA member:", {
            id: item.id,
            isV4Structure,
            name: memberData.name || item.name,
            hasPhoto: !!(memberData.photo || item.photo),
          });
        }

        // Extract photo - handle Strapi v4 nested structure: photo.data.attributes.url
        const photoData = isV4Structure ? memberData.photo : item.photo;
        let photoUrl: string | undefined = undefined;

        if (photoData) {
          if (isV4Structure) {
            // Strapi v4: photo.data.attributes.url
            if (photoData.data) {
              const photoAttributes = photoData.data.attributes || photoData.data;
              if (photoAttributes.url) {
                const url = photoAttributes.url as string;
                photoUrl = url.startsWith("http")
                  ? url
                  : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
              }
            }
          } else {
            // Strapi v5: direct object with url property
            if (typeof photoData === "object" && "url" in photoData) {
              const url = photoData.url as string;
              photoUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            } else {
              // Try getStrapiImageUrlUtil as fallback
              photoUrl = getStrapiImageUrlUtil(photoData) || undefined;
            }
          }
        }

        // Extract sequence field (priority: sequence > order > id)
        const sequence = memberData.sequence !== undefined 
          ? memberData.sequence 
          : (item.sequence !== undefined 
            ? item.sequence 
            : (memberData.order !== undefined 
              ? memberData.order 
              : (item.order !== undefined ? item.order : parseInt(item.id) || 0)));

        return {
          id: item.id.toString(),
          name: memberData.name || item.name || "",
          position: memberData.position || item.position || "",
          photo: photoUrl,
          message: memberData.message || item.message || undefined,
          order: sequence, // Store sequence in order field for compatibility
        };
      });

      // Sort by sequence (stored in order field) if available, otherwise by id
      members.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return parseInt(a.id) - parseInt(b.id);
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched ${members.length} RWA members from Strapi`);
        if (members.length > 0) {
          console.log("RWA members:", members.map((m) => ({ name: m.name, position: m.position, hasPhoto: !!m.photo })));
        } else {
          console.warn("⚠️ RWA: No members found in Strapi response, falling back to JSON");
        }
      }

      // If we got members from Strapi, return them
      if (members.length > 0) {
        return members;
      } else {
        // If empty array, fall through to JSON
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ RWA: Empty members array from Strapi, using JSON fallback");
        }
        throw new Error("Empty members array from Strapi");
      }
    } catch (error) {
      console.error("❌ Error fetching RWA members from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      // Fallback to JSON
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ RWA: USE_STRAPI is false, using JSON fallback");
      console.warn("⚠️ RWA: STRAPI_URL is:", getStrapiUrl());
    }
  }

  // Fallback to JSON files
  if (process.env.NODE_ENV === "development") {
    console.log("📄 RWA: Loading from JSON fallback");
  }
  
  try {
    const rwaData = await import("@/data/rwa-members.json");
    const members: RWAMember[] = (rwaData.default as any[]).map((item) => ({
      ...item,
      order: item.order || 0,
    }));

    // Sort by order
    members.sort((a, b) => (a.order || 0) - (b.order || 0));

    if (process.env.NODE_ENV === "development") {
      console.log(`📄 RWA: Loaded ${members.length} members from JSON fallback`);
    }

    return members;
  } catch (error) {
    console.error("Error loading RWA members JSON:", error);
    if (error instanceof Error) {
      console.error("JSON Error message:", error.message);
    }
    return [];
  }
}

/**
 * Fetches advertisements
 * @param category - Optional category filter
 * @param limit - Optional limit on number of results
 * @returns Array of advertisements
 */
export async function getAdvertisements(
  category?: string,
  limit?: number
): Promise<Advertisement[]> {
  if (shouldUseStrapi()) {
    try {
      let url = `/api/advertisements?populate=*&sort[0]=publishedAt:desc`;

      if (category) {
        url += `&filters[category][$eq]=${encodeURIComponent(category)}`;
      }

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("Fetching advertisements from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const advertisements: Advertisement[] = (response.data || []).map(
        (item: any) => {
          const isV4Structure = item.attributes !== undefined;
          const adData = isV4Structure ? item.attributes : item;

          // Extract image - handle both v4 and v5 structures
          const imageData = isV4Structure ? adData.image : item.image;
          let imageUrl: string | undefined = undefined;

          if (imageData) {
            if (isV4Structure) {
              // Strapi v4: image.data.attributes.url
              if (imageData.data) {
                const imageAttributes =
                  imageData.data.attributes || imageData.data;
                if (imageAttributes.url) {
                  const url = imageAttributes.url as string;
                  imageUrl = url.startsWith("http")
                    ? url
                    : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
                }
              }
            } else {
              // Strapi v5: direct object with url property (flat structure)
              if (typeof imageData === "object" && imageData !== null && "url" in imageData) {
                const url = imageData.url as string;
                imageUrl = url.startsWith("http")
                  ? url
                  : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
              } else if (imageData && typeof imageData === "object") {
                // Try fallback method
                imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
              }
            }
          }

          return {
            id: item.id.toString(),
            slug: adData.slug || item.slug || item.id.toString(),
            title: adData.title || item.title || "",
            description: adData.description || item.description || "",
            category: adData.category || item.category || "",
            businessName: adData.businessName || item.businessName || undefined,
            contactPhone:
              adData.contactPhone || item.contactPhone || undefined,
            contactEmail:
              adData.contactEmail || item.contactEmail || undefined,
            website: adData.website || item.website || undefined,
            discount: adData.discount || item.discount || undefined,
            offer: adData.offer || item.offer || undefined,
            image: imageUrl,
            validUntil:
              adData.validUntil || item.validUntil || undefined,
            publishedAt:
              adData.publishedAt || item.publishedAt || adData.createdAt || item.createdAt,
            createdAt:
              adData.createdAt || item.createdAt || new Date().toISOString(),
          };
        }
      );

      // Filter out expired ads
      const now = new Date();
      const activeAds = advertisements.filter((ad) => {
        if (!ad.validUntil) return true;
        return new Date(ad.validUntil) > now;
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ Successfully fetched ${activeAds.length} active advertisements from Strapi`
        );
      }

      const result = limit ? activeAds.slice(0, limit) : activeAds;
      return result;
    } catch (error) {
      console.error("❌ Error fetching advertisements from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  try {
    const adsData = await import("@/data/advertisements.json");
    let advertisements: Advertisement[] = adsData.default as Advertisement[];

    // Filter by category if provided
    if (category) {
      advertisements = advertisements.filter(
        (ad) => ad.category === category
      );
    }

    // Filter out expired ads
    const now = new Date();
    advertisements = advertisements.filter((ad) => {
      if (!ad.validUntil) return true;
      return new Date(ad.validUntil) > now;
    });

    // Sort by published date (newest first)
    advertisements.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    );

    return limit ? advertisements.slice(0, limit) : advertisements;
  } catch (error) {
    console.error("Error loading advertisements JSON:", error);
    return [];
  }
}

/**
 * Fetches a single advertisement by ID
 * @param id - Advertisement ID
 * @returns Advertisement or null
 */
export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  if (shouldUseStrapi()) {
    try {
      const url = `/api/advertisements/${id}?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 Fetching advertisement by ID from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (process.env.NODE_ENV === "development") {
        console.log("📦 Advertisement detail API response:", {
          hasResponse: !!response,
          hasData: !!response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
        });
      }

      if (!response || !response.data) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No data in advertisement detail response");
        }
        return null;
      }

      const item = response.data;
      const isV4Structure = item.attributes !== undefined;
      const adData = isV4Structure ? item.attributes : item;

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Processing advertisement:", {
          id: item.id,
          isV4Structure,
          title: adData.title || item.title,
          hasImage: !!(adData.image || item.image),
        });
      }

      // Extract image - handle both v4 and v5 structures
      const imageData = isV4Structure ? adData.image : item.image;
      let imageUrl: string | undefined = undefined;

      if (imageData) {
        if (process.env.NODE_ENV === "development") {
          console.log("🖼️ Image data:", {
            type: typeof imageData,
            hasUrl: "url" in imageData,
            keys: typeof imageData === "object" ? Object.keys(imageData) : [],
          });
        }

        if (isV4Structure) {
          // Strapi v4: image.data.attributes.url
          if (imageData.data) {
            const imageAttributes =
              imageData.data.attributes || imageData.data;
            if (imageAttributes.url) {
              const url = imageAttributes.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            }
          }
        } else {
          // Strapi v5: direct object with url property (flat structure)
          if (typeof imageData === "object" && imageData !== null && "url" in imageData) {
            const url = imageData.url as string;
            imageUrl = url.startsWith("http")
              ? url
              : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            
            if (process.env.NODE_ENV === "development") {
              console.log("✅ Extracted image URL:", imageUrl);
            }
          } else if (imageData && typeof imageData === "object") {
            imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
          }
        }
      }

      const advertisement: Advertisement = {
        id: item.id.toString(),
        slug: adData.slug || item.slug || item.id.toString(),
        title: adData.title || item.title || "",
        description: adData.description || item.description || "",
        category: adData.category || item.category || "",
        businessName: adData.businessName || item.businessName || undefined,
        contactPhone: adData.contactPhone || item.contactPhone || undefined,
        contactEmail: adData.contactEmail || item.contactEmail || undefined,
        website: adData.website || item.website || undefined,
        discount: adData.discount || item.discount || undefined,
        offer: adData.offer || item.offer || undefined,
        image: imageUrl,
        validUntil: adData.validUntil || item.validUntil || undefined,
        publishedAt:
          adData.publishedAt || item.publishedAt || adData.createdAt || item.createdAt,
        createdAt: adData.createdAt || item.createdAt || new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Successfully fetched advertisement:", {
          id: advertisement.id,
          title: advertisement.title,
          hasImage: !!advertisement.image,
          imageUrl: advertisement.image,
        });
      }

      return advertisement;
    } catch (error) {
      console.error("❌ Error fetching advertisement from Strapi:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      return null;
    }
  }

  // Fallback to JSON files
  try {
    const adsData = await import("@/data/advertisements.json");
    const advertisements: Advertisement[] = adsData.default as Advertisement[];
    const ad = advertisements.find((a) => a.id === id);
    return ad || null;
  } catch (error) {
    console.error("Error loading advertisement JSON:", error);
    return null;
  }
}

/**
 * Fetches all service providers
 * @param serviceType - Optional filter by service type
 * @returns Array of service providers
 */
export async function getServiceProviders(
  serviceType?: string,
): Promise<ServiceProvider[]> {
  if (shouldUseStrapi()) {
    try {
      let url = `/api/service-providers?populate=*&sort[0]=order:asc&sort[1]=name:asc`;
      
      if (serviceType) {
        url += `&filters[serviceType][$eqi]=${encodeURIComponent(serviceType)}`;
      }

      if (process.env.NODE_ENV === "development") {
        const strapiUrl = getStrapiUrl();
        console.log("🔍 Fetching service providers from Strapi:", `${strapiUrl}${url}`);
      }

      const response = await fetchStrapi<any>(url);

      if (!response?.data || !Array.isArray(response.data)) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No service providers data returned from Strapi");
        }
        return [];
      }

      const providers: ServiceProvider[] = response.data.map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const providerData = isV4Structure ? item.attributes : item;

        // Extract image URL
        const imageData = providerData.image || item.image;
        let imageUrl: string | undefined = undefined;

        if (imageData) {
          // Handle Strapi v5 flat structure
          if (typeof imageData === "object" && imageData !== null) {
            // Try to get medium format first, then small, then full URL
            if (imageData.formats?.medium?.url) {
              const url = imageData.formats.medium.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            } else if (imageData.formats?.small?.url) {
              const url = imageData.formats.small.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            } else if (imageData.url) {
              const url = imageData.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${getStrapiUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
            } else {
              // Fallback to utility function
              imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
            }
          }
        }

        return {
          id: item.id.toString(),
          name: providerData.name || item.name || "",
          serviceType: providerData.serviceType || item.serviceType || "",
          phone: providerData.phone || item.phone || "",
          email: providerData.email || item.email || undefined,
          address: providerData.address || item.address || undefined,
          description: providerData.description || item.description || undefined,
          rating: providerData.rating || item.rating || undefined,
          verified: providerData.verified ?? item.verified ?? false,
          available: providerData.available ?? item.available ?? true,
          emergency: providerData.emergency ?? item.emergency ?? false,
          order: providerData.order || item.order || 0,
          image: imageUrl,
          createdAt: providerData.createdAt || item.createdAt || new Date().toISOString(),
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched ${providers.length} service providers`);
      }

      return providers;
    } catch (error) {
      console.error("❌ Error fetching service providers from Strapi:", error);
      return [];
    }
  }

  // Fallback to JSON files
  try {
    const providersData = await import("@/data/service-providers.json");
    let providers: ServiceProvider[] = providersData.default as ServiceProvider[];
    
    if (serviceType) {
      providers = providers.filter(
        (p) => p.serviceType.toLowerCase() === serviceType.toLowerCase(),
      );
    }
    
    return providers.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error loading service providers JSON:", error);
    return [];
  }
}
