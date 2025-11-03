import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { RWAMemberCard } from "@/components/shared/RWAMemberCard";
import { getRWAMembers } from "@/lib/api";

export const metadata: Metadata = {
  title: "RWA Governing Body - Greenwood City",
  description: "Meet our RWA governing body members dedicated to serving the community.",
};

export default async function RWAPage() {
  const members = await getRWAMembers();

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 RWA Page - Members received:", {
      count: members.length,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        position: m.position,
        hasPhoto: !!m.photo,
        hasMessage: !!m.message,
      })),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "RWA" }]} />

      <Section
        title="RWA Governing Body"
        subtitle="Meet our dedicated team working for the betterment of our community"
      >
        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {members.map((member, index) => (
              <RWAMemberCard
                key={member.id}
                member={member}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No RWA members available at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}

