import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { PolicyCard } from "@/components/shared/PolicyCard";
import { getPolicies } from "@/lib/api";

export const metadata: Metadata = {
  title: "Policies & Documents - Greenwood City",
  description: "Access community policies, rules, and regulations.",
};

export default async function PoliciesPage() {
  const policies = await getPolicies();
  const categories = Array.from(new Set(policies.map((p) => p.category || "Other").filter(Boolean)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Policies" }]} />

      <Section title="Policies & Documents" subtitle="Community policies, rules, and regulations">
        {policies.length > 0 ? (
          <div className="space-y-8">
            {categories.length > 0 ? (
              categories.map((category) => {
                const categoryPolicies = policies.filter((p) => (p.category || "Other") === category);
                return (
                  <div key={category} className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full">
                      {categoryPolicies.map((policy) => (
                        <PolicyCard key={policy.id} policy={policy} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full">
                {policies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No policies available at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}

