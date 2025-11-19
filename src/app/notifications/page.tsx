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
    <div className="mx-auto max-w-7xl w-full">
      <div className="px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 md:pt-4">
        <Breadcrumb items={[{ label: "Notifications" }]} />
      </div>

      <Section title="Notifications" subtitle="Important announcements and updates for residents">
        {sortedNotifications.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {sortedNotifications.map((notification) => (
              <NoticeBanner key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-text-light">No active notifications at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
