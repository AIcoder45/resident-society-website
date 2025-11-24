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
    <div className="mx-auto max-w-7xl w-full">
      <div className="px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 md:pt-4">
        <Breadcrumb items={[{ label: "Quick Contact" }]} />
      </div>

      <Section
        title="Quick Contact - Service Providers"
        subtitle="Greenwood City RWA is not responsible for the performance, actions, commitments, delays, or service quality of any external service providers. The information shared is solely for resident awareness and convenience. All services are provided directly by the respective vendors at their own responsibility."
      >
        {providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">
              No service providers available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedProviders).map(([type, typeProviders]) => (
              <div key={type}>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text mb-3 sm:mb-4">
                  {serviceTypeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full">
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

