import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { getGallery } from "@/lib/api";

export const metadata: Metadata = {
  title: "Gallery - Greenwood City",
  description: "Browse photos from community events and activities.",
};

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <div className="mx-auto max-w-7xl w-full">
      <div className="px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 md:pt-4">
        <Breadcrumb items={[{ label: "Gallery" }]} />
      </div>

      <Section title="Photo Gallery" subtitle="Memorable moments from our community events and activities">
        {gallery.length > 0 ? (
          <GalleryGrid items={gallery} columns={3} />
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-text-light">No gallery items available at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
