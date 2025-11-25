import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cache Revalidation API Route
 * Invalidates Next.js cache on pull-to-refresh
 * Can invalidate by path or by cache tag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, path } = body;

    // Invalidate by cache tags (more granular)
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag === "strapi-all") {
          // Invalidate all Strapi-related cache tags
          // These match the endpoints used in src/lib/api.ts
          const strapiTags = [
            "strapi-/api/news",
            "strapi-/api/events",
            "strapi-/api/galleries",
            "strapi-/api/advertisements",
            "strapi-/api/homepage",
            "strapi-/api/notifications",
            "strapi-/api/policies",
            "strapi-/api/contact",
            "strapi-/api/theme",
            "strapi-/api/vision-mission",
            "strapi-/api/contact-infos",
            "strapi-/api/rwas",
            "strapi-/api/service-providers",
          ];
          
          for (const strapiTag of strapiTags) {
            try {
              revalidateTag(strapiTag);
            } catch (error) {
              console.warn(`Failed to revalidate tag ${strapiTag}:`, error);
            }
          }
        } else {
          try {
            revalidateTag(tag);
          } catch (error) {
            console.warn(`Failed to revalidate tag ${tag}:`, error);
          }
        }
      }
    }

    // Invalidate by path (full page refresh)
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      message: "Cache invalidated successfully",
      invalidatedTags: tags,
      invalidatedPath: path,
    });
  } catch (error) {
    console.error("❌ Cache revalidation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

