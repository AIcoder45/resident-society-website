import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
import { MobileHero } from "@/components/shared/MobileHero";
import { ContentCard } from "@/components/shared/ContentCard";
import { EventCard } from "@/components/shared/EventCard";
import { GalleryGrid } from "@/components/shared/GalleryGrid";
import { AdvertisementCard } from "@/components/shared/AdvertisementCard";
import { getNews, getEvents, getGallery, getAdvertisements } from "@/lib/api";

export const metadata: Metadata = {
  title: "Greenwood City - Building Community Together",
  description: "Stay connected with Greenwood City. Get the latest news, events, and updates.",
};

export default async function HomePage() {
  // Fetch data for home page
  const [latestNews, upcomingEvents, galleryItems, featuredAds] = await Promise.all([
    getNews(6), // Latest 6 news articles
    getEvents(6, true), // Upcoming events only, limit 6
    getGallery(6), // Latest 6 gallery items
    getAdvertisements(undefined, 6), // Latest 6 advertisements
  ]);

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <MobileHero
        welcomeText="Welcome to"
        title="Greenwood City"
        subtitle="Block C"
        description="Building a stronger community together. Stay connected and informed with the latest news, events, and updates."
        descriptionMobile="Building a stronger community together. Stay connected and informed with the latest news, events, and updates."
      />

      {/* Main Content - Mobile First Layout */}
      <div className="mx-auto max-w-7xl w-full">
        {/* Latest News Section */}
        <Section title="Latest News" subtitle="Stay informed with the latest community updates">
          {latestNews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {latestNews.map((item) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  description={item.shortDescription}
                  image={item.image}
                  href={`/news/${item.slug}`}
                  date={item.publishedAt}
                  category={item.category}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No news articles available at the moment.</p>
            </div>
          )}
          {latestNews.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto min-w-[200px]">
                <Link href="/news">View All News</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Upcoming Events Section */}
        <Section title="Upcoming Events" subtitle="Join us for exciting community events and activities">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No upcoming events scheduled at the moment.</p>
            </div>
          )}
          {upcomingEvents.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto min-w-[200px]">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Gallery Section */}
        <Section title="Photo Gallery" subtitle="Memorable moments from our community events and activities">
          {galleryItems.length > 0 ? (
            <GalleryGrid items={galleryItems} columns={2} />
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No gallery items available at the moment.</p>
            </div>
          )}
          {galleryItems.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto min-w-[200px]">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Featured Advertisements Section */}
        <Section title="Local Advertisements" subtitle="Discover offers and services from local residents">
          {featuredAds.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {featuredAds.map((ad, index) => (
                <AdvertisementCard
                  key={ad.id}
                  advertisement={ad}
                  index={index}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No advertisements available at the moment.</p>
            </div>
          )}
          {featuredAds.length > 0 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto min-w-[200px]">
                <Link href="/advertisements">View All Advertisements</Link>
              </Button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
