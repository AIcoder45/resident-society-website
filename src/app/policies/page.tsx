import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { getPolicies } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Policies - Greenwood City",
  description: "Access community policies, rules, and regulations.",
};

export default async function PoliciesPage() {
  const policies = await getPolicies();
  const categories = Array.from(new Set(policies.map((p) => p.category)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Policies" }]} />

      <Section title="Policies & Documents" subtitle="Community policies, rules, and regulations">
        {policies.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryPolicies = policies.filter((p) => p.category === category);
              return (
                <div key={category} className="mb-8">
                  <h2 className="text-2xl font-bold text-text mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {categoryPolicies.map((policy, index) => (
                      <AnimatedCard key={policy.id} index={index}>
                        <Link href={`/policies/${policy.slug}`} className="block h-full">
                          <Card className="h-full w-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{policy.title}</CardTitle>
                              </div>
                              <CardDescription className="line-clamp-2">
                                {policy.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                              <div className="space-y-3">
                                {policy.updatedAt && (
                                  <p className="text-xs text-text-light">
                                    Updated: {formatDate(policy.updatedAt, "short")}
                                  </p>
                                )}
                                <Button size="sm" className="w-full" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </AnimatedCard>
                    ))}
                  </div>
                </div>
              );
            })}
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
