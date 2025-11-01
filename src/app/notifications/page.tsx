import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { getNotifications } from "@/lib/api";

export const metadata: Metadata = {
  title: "Notifications - Greenwood City",
  description: "Important announcements and notifications for residents.",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  // Sort: urgent first, then by date
  const sortedNotifications = notifications.sort((a, b) => {
    if (a.priority === "urgent" && b.priority !== "urgent") return -1;
    if (a.priority !== "urgent" && b.priority === "urgent") return 1;
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Notifications" }]} />

      <Section title="Notifications" subtitle="Important announcements and updates for residents">
        {sortedNotifications.length > 0 ? (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => (
              <NoticeBanner key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No active notifications at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
