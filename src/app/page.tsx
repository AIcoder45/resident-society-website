import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/Section";
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
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary text-white py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 md:space-y-5 lg:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Welcome to
              </h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Greenwood City{" "}
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal opacity-90">
                  Block C
                </span>
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed px-2 md:px-0">
              <span className="hidden md:inline">
                Building a stronger community together. Stay connected and informed with the latest
                news, events, and updates.
              </span>
              <span className="md:hidden">
                Building a stronger community together.
              </span>
            </p>
            <div className="hidden md:flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2">
              <Button asChild size="default" className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
                <Link href="/news">Latest News</Link>
              </Button>
              <Button asChild size="default" variant="outline" className="border-2 border-white text-white hover:bg-white/10 hover:border-white/80 transition-all">
                <Link href="/events">Upcoming Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        {/* Latest News Section */}
        <Section title="Latest News" subtitle="Stay informed with the latest community updates">
          {latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {latestNews.map((item) => (
                <ContentCard
                  key={item.id}
                  title={item.title}
                  description={item.shortDescription}
                  image={item.image}
                  href={`/news/${item.slug}`}
                  date={item.publishedAt}
                  category={item.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No news articles available at the moment.</p>
            </div>
          )}
          {latestNews.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/news">View All News</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Upcoming Events Section */}
        <Section title="Upcoming Events" subtitle="Join us for exciting community events and activities">
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No upcoming events scheduled at the moment.</p>
            </div>
          )}
          {upcomingEvents.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Gallery Section */}
        <Section title="Photo Gallery" subtitle="Memorable moments from our community events and activities">
          {galleryItems.length > 0 ? (
            <GalleryGrid items={galleryItems} columns={3} />
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No gallery items available at the moment.</p>
            </div>
          )}
          {galleryItems.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Featured Advertisements Section */}
        <Section title="Local Advertisements" subtitle="Discover offers and services from local residents">
          {featuredAds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {featuredAds.map((ad, index) => (
                <AdvertisementCard
                  key={ad.id}
                  advertisement={ad}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No advertisements available at the moment.</p>
            </div>
          )}
          {featuredAds.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/advertisements">View All Advertisements</Link>
              </Button>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
