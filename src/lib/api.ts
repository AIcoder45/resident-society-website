import type {
  News,
  Event,
  GalleryItem,
  Notification,
  Policy,
  ContactInfo,
  ContactPageData,
  RWAMember,
  Advertisement,
  Homepage,
  Theme,
  ServiceProvider,
} from "@/types";
import { fetchStrapi, getStrapiImageUrl as getStrapiImageUrlUtil } from "@/lib/strapi";

/**
 * API utility functions for fetching content
 * Automatically uses Strapi if STRAPI_URL is set, otherwise falls back to JSON files
 */

const STRAPI_URL = process.env.STRAPI_URL;
const USE_STRAPI = !!STRAPI_URL;

// Debug logging (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log("Strapi Configuration:", {
    STRAPI_URL,
    USE_STRAPI,
    envKeys: Object.keys(process.env).filter((k) => k.includes("STRAPI")),
  });
}

/**
 * Helper to transform Strapi image URL
 * @deprecated Use getStrapiImageUrl from @/lib/strapi instead
 */
function getStrapiImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (STRAPI_URL) {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `${STRAPI_URL}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
  }
  return url;
}

/**
 * Fetches all news articles
 * @param limit - Optional limit for number of articles
 * @returns Array of news articles
 */
export async function getNews(limit?: number): Promise<News[]> {
  if (USE_STRAPI) {
    try {
      const url = `/api/news-articles?populate=*&sort[0]=publishedAt:desc`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching news from Strapi:", `${STRAPI_URL}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const news: News[] = (response.data || []).map((item: any) => {
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
              : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
          } else {
            // Strapi v4: nested structure
            imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
          }
        }

        return {
          id: item.id.toString(),
          title: newsData.title || item.title,
          slug: newsData.slug || item.slug,
          shortDescription: newsData.shortDescription || item.shortDescription || "",
          content: newsData.content || item.content || "",
          image: imageUrl,
          category: newsData.category || item.category || "",
          publishedAt: newsData.publishedAt || item.publishedAt,
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${news.length} news articles from Strapi`);
      }

      return limit ? news.slice(0, limit) : news;
    } catch (error) {
      console.error("Error fetching news from Strapi:", error);
      // Fallback to JSON on error
    }
  }

  // Fallback to JSON files
  const newsData = await import("@/data/news.json");
  let news = newsData.default as News[];

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
  if (USE_STRAPI) {
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
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
        } else {
          // Strapi v4: nested structure
          imageUrl = getStrapiImageUrlUtil(imageData) || undefined;
        }
      }

      return {
        id: item.id.toString(),
        title: newsData.title || item.title,
        slug: newsData.slug || item.slug,
        shortDescription: newsData.shortDescription || item.shortDescription || "",
        content: newsData.content || item.content || "",
        image: imageUrl,
        category: newsData.category || item.category || "",
        publishedAt: newsData.publishedAt || item.publishedAt,
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
  if (USE_STRAPI) {
    try {
      let url = `/api/events?populate=*&sort[0]=eventDate:asc`;

      if (upcomingOnly) {
        const now = new Date().toISOString();
        url += `&filters[eventDate][$gte]=${now}`;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching events from Strapi:", `${STRAPI_URL}${url}`);
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
      const events: Event[] = (response.data || []).map((item: any) => {
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
              : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

        return {
          id: item.id.toString(),
          title: eventData.title || item.title,
          slug: eventData.slug || item.slug,
          description: eventData.description || item.description || "",
          eventDate: eventData.eventDate || item.eventDate,
          location: eventData.location || item.location || "",
          coverImage: coverImageUrl,
          gallery: galleryUrls,
        };
      });

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
    console.warn("⚠️ Using JSON fallback for events (USE_STRAPI:", USE_STRAPI, ")");
    console.warn("⚠️ STRAPI_URL is:", STRAPI_URL);
  }

  // Fallback to JSON files
  const eventsData = await import("@/data/events.json");
  let events = eventsData.default as Event[];

  if (upcomingOnly) {
    const now = new Date();
    events = events.filter((event) => new Date(event.eventDate) >= now);
  }

  // Sort by event date (upcoming first)
  events = events.sort(
    (a, b) =>
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
  );

  return limit ? events.slice(0, limit) : events;
}

/**
 * Fetches a single event by slug
 * @param slug - Event slug
 * @returns Event or null
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (USE_STRAPI) {
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
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
              : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
          }
          // Strapi v4: nested structure
          const extracted = getStrapiImageUrlUtil(img);
          return extracted;
        }).filter((url: string | null): url is string => url !== null));
      }

      return {
        id: item.id.toString(),
        title: eventData.title || item.title,
        slug: eventData.slug || item.slug,
        description: eventData.description || item.description || "",
        eventDate: eventData.eventDate || item.eventDate,
        location: eventData.location || item.location || "",
        coverImage: coverImageUrl,
        gallery: galleryUrls,
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
  if (USE_STRAPI) {
    try {
      const url = `/api/galleries?populate=*&sort[0]=createdAt:desc`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching gallery from Strapi:", `${STRAPI_URL}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const gallery: GalleryItem[] = (response.data || []).map((item: any) => {
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
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

        return {
          id: item.id.toString(),
          title: galleryData.title || item.title || "",
          description: galleryData.description || item.description || undefined,
          images: imageUrls,
          eventId,
          createdAt: galleryData.createdAt || item.createdAt,
        };
      });

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
  }));

  // Sort by creation date (newest first)
  gallery = gallery.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return limit ? gallery.slice(0, limit) : gallery;
}

/**
 * Fetches all active notifications
 * @returns Array of active notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  if (USE_STRAPI) {
    try {
      const now = new Date().toISOString();
      const url = `/api/notifications?filters[$or][0][expiryDate][$gt]=${now}&filters[$or][1][expiryDate][$null]=true&populate=*&sort[0]=createdAt:desc`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching notifications from Strapi:", `${STRAPI_URL}${url}`);
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
 * @param category - Optional category filter
 * @returns Array of policies
 */
export async function getPolicies(category?: string): Promise<Policy[]> {
  if (USE_STRAPI) {
    try {
      let url = `/api/policies?populate=*&sort[0]=updatedAt:desc`;

      if (category) {
        url += `&filters[category][$eq]=${encodeURIComponent(category)}`;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching policies from Strapi:", `${STRAPI_URL}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      // Handle both Strapi v4 (with attributes) and v5/flat structure
      const policies: Policy[] = (response.data || []).map((item: any) => {
        const isV4Structure = item.attributes !== undefined;
        const policyData = isV4Structure ? item.attributes : item;

        // Extract file - handle both v4 and v5 structures
        const fileData = isV4Structure ? policyData.file : item.file;
        let fileUrl: string | undefined = undefined;

        if (fileData) {
          if (typeof fileData === "object" && "url" in fileData) {
            // Strapi v5: direct object with url property
            const url = fileData.url as string;
            fileUrl = url.startsWith("http")
              ? url
              : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
          } else {
            // Strapi v4: nested structure
            fileUrl = getStrapiImageUrlUtil(fileData) || undefined;
          }
        }

        return {
          id: item.id.toString(),
          title: policyData.title || item.title,
          slug: policyData.slug || item.slug || item.id.toString(),
          description: policyData.description || item.description || "",
          file: fileUrl,
          category: policyData.category || item.category || "",
          updatedAt: policyData.updatedAt || item.updatedAt,
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Successfully fetched ${policies.length} policies from Strapi`);
      }

      return policies;
    } catch (error) {
      console.error("Error fetching policies from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const policiesData = await import("@/data/policies.json");
  let policies: Policy[] = (policiesData.default as any[]).map((item) => ({
    ...item,
    slug: item.slug || item.id.toString(),
  }));

  if (category) {
    policies = policies.filter((policy) => policy.category === category);
  }

  // Sort by updated date (newest first)
  policies = policies.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return policies;
}

/**
 * Fetches a single policy by slug
 * @param slug - Policy slug
 * @returns Policy or null
 */
export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  if (USE_STRAPI) {
    try {
      const url = `/api/policies?filters[slug][$eq]=${slug}&populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching policy from Strapi:", `${STRAPI_URL}${url}`);
      }

      const response = await fetchStrapi<any[]>(url);

      if (!response.data || response.data.length === 0) return null;

      const item = response.data[0];
      const isV4Structure = item.attributes !== undefined;
      const policyData = isV4Structure ? item.attributes : item;

      // Extract file - handle both v4 and v5 structures
      const fileData = isV4Structure ? policyData.file : item.file;
      let fileUrl: string | undefined = undefined;

      if (fileData) {
        if (typeof fileData === "object" && "url" in fileData) {
          // Strapi v5: direct object with url property
          const url = fileData.url as string;
          fileUrl = url.startsWith("http")
            ? url
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
        } else {
          // Strapi v4: nested structure
          fileUrl = getStrapiImageUrlUtil(fileData) || undefined;
        }
      }

      return {
        id: item.id.toString(),
        title: policyData.title || item.title,
        slug: policyData.slug || item.slug || item.id.toString(),
        description: policyData.description || item.description || "",
        file: fileUrl,
        category: policyData.category || item.category || "",
        updatedAt: policyData.updatedAt || item.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching policy from Strapi:", error);
      // Fallback to JSON
    }
  }

  // Fallback to JSON files
  const policies = await getPolicies();
  return policies.find((item) => item.slug === slug) || null;
}

/**
 * Fetches contact page data
 * @returns Contact page data or null
 */
export async function getContactPageData(): Promise<ContactPageData | null> {
  if (USE_STRAPI) {
    try {
      const url = `/api/contact?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching contact page data from Strapi:", `${STRAPI_URL}${url}`);
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
        streetAddress: contactData.streetAddress || response.data.streetAddress || undefined,
        city: contactData.city || response.data.city || undefined,
        state: contactData.state || response.data.state || undefined,
        zipCode: contactData.zipCode || response.data.zipCode || undefined,
        officeHours: contactData.officeHours || response.data.officeHours || undefined,
        generalInquiryText: contactData.generalInquiryText || response.data.generalInquiryText || null,
        urgentMattersText: contactData.urgentMattersText || response.data.urgentMattersText || null,
      };

      if (process.env.NODE_ENV === "development") {
        console.log(`✅ Successfully fetched contact page data from Strapi`);
        console.log("Contact data:", {
          pageTitle: contactPageData.pageTitle,
          hasPhone: !!contactPageData.phoneNumber,
          hasEmail: !!contactPageData.emailAddress,
          hasAddress: !!(contactPageData.streetAddress || contactPageData.city),
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
  if (USE_STRAPI) {
    try {
      const url = `/api/homepage?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Fetching homepage data from Strapi:", `${STRAPI_URL}${url}`);
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
        heroDescription: homepageData.heroDescription || response.data.heroDescription || "Building a stronger community together. Stay connected and informed with the latest news, events, and updates.",
        heroDescriptionMobile: homepageData.heroDescriptionMobile || response.data.heroDescriptionMobile || null,
        newsSectionTitle: homepageData.newsSectionTitle || response.data.newsSectionTitle || "Latest News",
        newsSectionSubtitle: homepageData.newsSectionSubtitle || response.data.newsSectionSubtitle || "Stay informed with the latest community updates",
        eventsSectionTitle: homepageData.eventsSectionTitle || response.data.eventsSectionTitle || "Upcoming Events",
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
 * Fetches theme/branding data
 * @returns Theme data or null if not available
 */
export async function getTheme(): Promise<Theme | null> {
  if (USE_STRAPI) {
    try {
      const url = `/api/theme?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Fetching theme data from Strapi:", `${STRAPI_URL}${url}`);
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
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
          
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
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
            : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
  const addressParts = [
    contactData.streetAddress,
    contactData.city,
    contactData.state,
    contactData.zipCode,
  ].filter(Boolean);
  
  if (addressParts.length > 0) {
    contactInfo.push({
      id: `${contactData.id}-address`,
      title: "Address",
      content: addressParts.join(", "),
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
  if (USE_STRAPI) {
    try {
      const url = `/api/rwas?populate=*&sort[0]=order:asc`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 RWA: USE_STRAPI is true");
        console.log("🔍 RWA: STRAPI_URL:", STRAPI_URL);
        console.log("🔍 Fetching RWA members from Strapi:", `${STRAPI_URL}${url}`);
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
                  : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
              }
            }
          } else {
            // Strapi v5: direct object with url property
            if (typeof photoData === "object" && "url" in photoData) {
              const url = photoData.url as string;
              photoUrl = url.startsWith("http")
                ? url
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
            } else {
              // Try getStrapiImageUrlUtil as fallback
              photoUrl = getStrapiImageUrlUtil(photoData) || undefined;
            }
          }
        }

        return {
          id: item.id.toString(),
          name: memberData.name || item.name || "",
          position: memberData.position || item.position || "",
          photo: photoUrl,
          message: memberData.message || item.message || undefined,
          order: memberData.order !== undefined ? memberData.order : (item.order !== undefined ? item.order : 0),
        };
      });

      // Sort by order if available, otherwise by id
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
      console.warn("⚠️ RWA: STRAPI_URL is:", STRAPI_URL);
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
  if (USE_STRAPI) {
    try {
      let url = `/api/advertisements?populate=*&sort[0]=publishedAt:desc`;

      if (category) {
        url += `&filters[category][$eq]=${encodeURIComponent(category)}`;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Fetching advertisements from Strapi:", `${STRAPI_URL}${url}`);
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
                    : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
                }
              }
            } else {
              // Strapi v5: direct object with url property (flat structure)
              if (typeof imageData === "object" && imageData !== null && "url" in imageData) {
                const url = imageData.url as string;
                imageUrl = url.startsWith("http")
                  ? url
                  : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
  if (USE_STRAPI) {
    try {
      const url = `/api/advertisements/${id}?populate=*`;
      
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Fetching advertisement by ID from Strapi:", `${STRAPI_URL}${url}`);
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
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
            }
          }
        } else {
          // Strapi v5: direct object with url property (flat structure)
          if (typeof imageData === "object" && imageData !== null && "url" in imageData) {
            const url = imageData.url as string;
            imageUrl = url.startsWith("http")
              ? url
              : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
            
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
  if (USE_STRAPI) {
    try {
      let url = `/api/service-providers?populate=*&sort[0]=order:asc&sort[1]=name:asc`;
      
      if (serviceType) {
        url += `&filters[serviceType][$eqi]=${encodeURIComponent(serviceType)}`;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Fetching service providers from Strapi:", `${STRAPI_URL}${url}`);
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
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
            } else if (imageData.formats?.small?.url) {
              const url = imageData.formats.small.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
            } else if (imageData.url) {
              const url = imageData.url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
