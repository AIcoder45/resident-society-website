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
    <div className="mx-auto max-w-7xl w-full">
      <div className="pt-2 sm:pt-3 md:pt-4 px-4 sm:px-6 md:px-8">
        <Breadcrumb items={[{ label: "Advertisements" }]} />
      </div>

      <Section
        title="Local Advertisements"
        subtitle="Discover offers, discounts, and services from local residents and businesses"
      >
        {advertisements.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {categories.length > 1 ? (
              // Group by category
              categories.map((category) => {
                const categoryAds = advertisements.filter(
                  (ad) => ad.category === category
                );
                return (
                  <div key={category} className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text mb-3 sm:mb-4 px-4 sm:px-0">
                      {category}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
                      {categoryAds.map((ad, index) => (
                        <AdvertisementCard
                          key={ad.id}
                          advertisement={ad}
                          index={index}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Single grid if one or no categories
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
                {advertisements.map((ad, index) => (
                  <AdvertisementCard
                    key={ad.id}
                    advertisement={ad}
                    index={index}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-text-light">
              No advertisements available at the moment.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}


