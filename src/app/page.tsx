import type { Metadata } from "next";
import { Section } from "@/components/shared/Section";
import { MobileHero } from "@/components/shared/MobileHero";
import { ContentCard } from "@/components/shared/ContentCard";
import { EventCard } from "@/components/shared/EventCard";
import { GalleryCard } from "@/components/shared/GalleryCard";
import { AdvertisementCard } from "@/components/shared/AdvertisementCard";
import { FeaturedImageCarousel } from "@/components/shared/FeaturedImageCarousel";
import { getNews, getEvents, getGallery, getAdvertisements } from "@/lib/api";

export const metadata: Metadata = {
  title: "Greenwood City - Building Community Together",
  description: "Stay connected with Greenwood City. Get the latest news, events, and updates.",
};

export default async function HomePage() {
  // Fetch data for home page - Show 4 cards per category
  const [latestNews, events, galleryItems, featuredAds] = await Promise.all([
    getNews(4), // Latest 4 news articles
    getEvents(4, false), // All events (upcoming badge will show for upcoming ones), limit 4
    getGallery(4), // Latest 4 gallery items
    getAdvertisements(undefined, 4), // Latest 4 advertisements
  ]);

  // Get featured images from latest content
  const featuredImages = [
    ...latestNews.filter(item => item.image).slice(0, 2).map(item => ({ src: item.image!, alt: item.title, href: `/news/${item.slug}` })),
    ...events.filter(event => event.coverImage).slice(0, 2).map(event => ({ src: event.coverImage!, alt: event.title, href: `/events/${event.slug}` })),
    ...galleryItems.filter(item => item.images && item.images.length > 0).slice(0, 2).map(item => ({ src: item.images[0], alt: item.title || 'Gallery Image', href: '/gallery' })),
  ].slice(0, 4); // Show max 4 featured images

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <MobileHero
        welcomeText="Welcome to"
        title="Greenwood City"
        subtitle="Block C"
        description="Building a stronger community together.."
        descriptionMobile="Building a stronger community together.."
      />

      {/* Featured Images Carousel */}
      {featuredImages.length > 0 && (
        <div className="w-full px-0 relative z-0">
          <FeaturedImageCarousel 
            images={featuredImages} 
            autoPlayInterval={5000}
            className="w-full"
          />
        </div>
      )}

      {/* Main Content - Mobile First Layout */}
      <div className="mx-auto max-w-7xl w-full">
        {/* Latest News Section */}
        <Section 
          title="Latest News" 
          subtitle="Stay informed with the latest community updates"
          viewAllLink={latestNews.length > 0 ? { href: "/news", label: "View All" } : undefined}
        >
          {latestNews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {latestNews.slice(0, 4).map((item) => (
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
        </Section>

        {/* Events Section */}
        <Section 
          title="Events" 
          subtitle="Join us for exciting community events and activities"
          viewAllLink={events.length > 0 ? { href: "/events", label: "View All" } : undefined}
        >
          {events.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No events scheduled at the moment.</p>
            </div>
          )}
        </Section>

        {/* Gallery Section */}
        <Section 
          title="Photo Gallery" 
          subtitle="Memorable moments from our community events and activities"
          viewAllLink={galleryItems.length > 0 ? { href: "/gallery", label: "View All" } : undefined}
        >
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {galleryItems.slice(0, 4).map((item) => (
                <GalleryCard key={item.id} item={item} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-text-light">No gallery items available at the moment.</p>
            </div>
          )}
        </Section>

        {/* Featured Advertisements Section */}
        <Section 
          title="Local Advertisements" 
          subtitle="Discover offers and services from local residents"
          viewAllLink={featuredAds.length > 0 ? { href: "/advertisements", label: "View All" } : undefined}
        >
          {featuredAds.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
              {featuredAds.slice(0, 4).map((ad, index) => (
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
        </Section>
      </div>
    </div>
  );
}
