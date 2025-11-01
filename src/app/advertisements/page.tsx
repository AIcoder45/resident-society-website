import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { AdvertisementCard } from "@/components/shared/AdvertisementCard";
import { getAdvertisements } from "@/lib/api";

export const metadata: Metadata = {
  title: "Advertisements - Greenwood City",
  description: "Browse local business advertisements, offers, and discounts from residents.",
};

export default async function AdvertisementsPage() {
  const advertisements = await getAdvertisements();

  // Get unique categories
  const categories = Array.from(
    new Set(advertisements.map((ad) => ad.category))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Advertisements" }]} />

      <Section
        title="Local Advertisements"
        subtitle="Discover offers, discounts, and services from local residents and businesses"
      >
        {advertisements.length > 0 ? (
          <div className="space-y-8">
            {categories.length > 1 ? (
              // Group by category
              categories.map((category) => {
                const categoryAds = advertisements.filter(
                  (ad) => ad.category === category
                );
                return (
                  <div key={category} className="mb-8">
                    <h2 className="text-2xl font-bold text-text mb-4">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {categoryAds.map((ad, index) => (
                        <AdvertisementCard
                          key={ad.id}
                          advertisement={ad}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Single grid if one or no categories
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {advertisements.map((ad, index) => (
                  <AdvertisementCard
                    key={ad.id}
                    advertisement={ad}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">
              No advertisements available at the moment.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}

