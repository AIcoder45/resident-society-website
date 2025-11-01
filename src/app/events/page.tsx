import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { EventCard } from "@/components/shared/EventCard";
import { getEvents } from "@/lib/api";

export const metadata: Metadata = {
  title: "Events - Greenwood City",
  description: "View all upcoming and past community events.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Events" }]} />

      <Section title="All Events" subtitle="Join us for community events and activities">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No events scheduled at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
