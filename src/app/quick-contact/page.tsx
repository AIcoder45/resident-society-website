import type { Metadata } from "next";
import { Section } from "@/components/shared/Section";
import { ServiceProviderCard } from "@/components/shared/ServiceProviderCard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getServiceProviders } from "@/lib/api";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export const metadata: Metadata = {
  title: "Quick Contact - Service Providers | Greenwood City Block C",
  description: "Find trusted service providers in your community - plumbers, electricians, gardeners, and more.",
};

export default async function QuickContactPage() {
  const providers = await getServiceProviders();

  // Group providers by service type
  const groupedProviders = providers.reduce(
    (acc, provider) => {
      const type = provider.serviceType.toLowerCase();
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(provider);
      return acc;
    },
    {} as Record<string, typeof providers>,
  );

  // Service type display names
  const serviceTypeNames: Record<string, string> = {
    plumber: "Plumbers",
    electrician: "Electricians",
    gardener: "Gardeners",
    landscaper: "Landscapers",
    carpenter: "Carpenters",
    painter: "Painters",
    mechanic: "Mechanics",
    "ac-repair": "AC Repair",
    "ac-repairer": "AC Repair",
    hvac: "HVAC Services",
    cleaner: "Cleaning Services",
    cleaning: "Cleaning Services",
    security: "Security Services",
    locksmith: "Locksmiths",
    "appliance-repair": "Appliance Repair",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Quick Contact" }]} />

      <Section
        title="Quick Contact - Service Providers"
        subtitle="Find trusted service providers in your community. All providers are verified by the RWA."
      >
        {providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">
              No service providers available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedProviders).map(([type, typeProviders]) => (
              <div key={type}>
                <h2 className="text-2xl font-bold text-text mb-6">
                  {serviceTypeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {typeProviders.map((provider, index) => (
                    <ServiceProviderCard
                      key={provider.id}
                      provider={provider}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

