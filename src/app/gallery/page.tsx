import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { GalleryCarousel } from "@/components/shared/GalleryCarousel";
import { getGallery } from "@/lib/api";

export const metadata: Metadata = {
  title: "Gallery - Greenwood City",
  description: "Browse photos from community events and activities.",
};

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Gallery" }]} />

      <Section title="Photo Gallery" subtitle="Memorable moments from our community events and activities">
        {gallery.length > 0 ? (
          <div className="space-y-8">
            {/* Carousel View */}
            <div>
              <h3 className="text-xl font-semibold text-text mb-4">Featured Gallery</h3>
              <GalleryCarousel items={gallery} />
            </div>

            {/* Grid View */}
            <div>
              <h3 className="text-xl font-semibold text-text mb-4">All Photos</h3>
              <GalleryGrid items={gallery} columns={3} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No gallery items available at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
