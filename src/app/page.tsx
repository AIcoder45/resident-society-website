import type { Metadata } from "next";
import { Section } from "@/components/shared/Section";
import { MobileHero } from "@/components/shared/MobileHero";
import { ContentCard } from "@/components/shared/ContentCard";
import { EventCard } from "@/components/shared/EventCard";
import { GalleryCard } from "@/components/shared/GalleryCard";
import { AdvertisementCard } from "@/components/shared/AdvertisementCard";
import { FeaturedImageCarousel } from "@/components/shared/FeaturedImageCarousel";
import { VisionMission } from "@/components/shared/VisionMission";
import { getNews, getEvents, getGallery, getAdvertisements, getHomepage, getVisionMission } from "@/lib/api";

export const metadata: Metadata = {
  title: "Greenwood City - Building Community Together",
  description: "Stay connected with Greenwood City. Get the latest news, events, and updates.",
};

export default async function HomePage() {
  // Fetch data for home page - Show 4 cards per category
  const [latestNews, allEvents, galleryItems, featuredAds, homepage, visionMission] = await Promise.all([
    getNews(4), // Latest 4 news articles
    getEvents(20, false), // Fetch more events to sort properly
    getGallery(4), // Latest 4 gallery items
    getAdvertisements(undefined, 4), // Latest 4 advertisements
    getHomepage(), // Homepage content from Strapi
    getVisionMission(), // Vision and Mission from Strapi
  ]);

  // Sort events: upcoming events first (ascending by date), then past events (descending by date)
  // Normalize dates to start of day to avoid hydration mismatches
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for consistent comparison
  
  const upcomingEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= now;
    })
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  
  const pastEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < now;
    })
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  
  // Combine: upcoming first, then past events, limit to 4
  const events = [...upcomingEvents, ...pastEvents].slice(0, 4);

  // Get featured images from content with sequence number 1
  // If no items have sequence === 1, fall back to showing items without sequence filtering
  const newsWithSequence1 = latestNews.filter(item => item.image && item.sequence === 1);
  const eventsWithSequence1 = events.filter(event => event.coverImage && event.sequence === 1);
  
  // Check if we have any items with sequence === 1
  const hasSequence1Items = newsWithSequence1.length > 0 || eventsWithSequence1.length > 0;
  
  let featuredImages: Array<{ src: string; alt: string; href: string }> = [];
  
  if (hasSequence1Items) {
    // Show only items with sequence === 1
    featuredImages = [
      ...newsWithSequence1.map(item => ({ src: item.image!, alt: item.title, href: `/news/${item.slug}` })),
      ...eventsWithSequence1.map(event => ({ src: event.coverImage!, alt: event.title, href: `/events/${event.slug}` })),
    ].slice(0, 4);
  } else {
    // Fallback: show items without sequence filtering (original behavior)
    featuredImages = [
      ...latestNews.filter(item => item.image).slice(0, 2).map(item => ({ src: item.image!, alt: item.title, href: `/news/${item.slug}` })),
      ...events.filter(event => event.coverImage).slice(0, 2).map(event => ({ src: event.coverImage!, alt: event.title, href: `/events/${event.slug}` })),
    ].slice(0, 4);
  }

  // Use homepage data from Strapi if available, otherwise use defaults
  const heroWelcomeText = homepage?.heroWelcomeText || "Welcome to";
  const heroTitleText = homepage?.heroTitleText || "Greenwood City";
  const heroSubtitleText = homepage?.heroSubtitleText || "Block C";
  const heroDescription = homepage?.heroDescription || "Building a stronger community together..";
  const heroDescriptionMobile = homepage?.heroDescriptionMobile || heroDescription;

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <MobileHero
        welcomeText={heroWelcomeText}
        title={heroTitleText}
        subtitle={heroSubtitleText}
        description={heroDescription}
        descriptionMobile={heroDescriptionMobile}
      />

      {/* Featured Images Carousel */}
      {featuredImages.length > 0 && (
        <div className="w-full flex items-center justify-center px-0 relative z-0">
          <FeaturedImageCarousel 
            images={featuredImages} 
            autoPlayInterval={5000}
            className="w-full"
          />
        </div>
      )}

      {/* Vision Section - Testimonial Style */}
      {visionMission && (
        <VisionMission
          visionTitle={visionMission.visionTitle}
          visionContent={visionMission.visionContent}
          visionImage={visionMission.visionImage}
        />
      )}

      {/* Main Content - Mobile First Layout */}
      <div className="mx-auto max-w-7xl w-full">
        {/* Latest News Section */}
        <Section 
          title={homepage?.newsSectionTitle || "Latest News"} 
          subtitle={homepage?.newsSectionSubtitle || "Stay informed with the latest community updates"}
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
                  youtubeUrl={item.youtubeUrl}
                  instagramUrl={item.instagramUrl}
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
          title={homepage?.eventsSectionTitle || "Events"} 
          subtitle={homepage?.eventsSectionSubtitle || "Join us for exciting community events and activities"}
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
          title={homepage?.gallerySectionTitle || "Photo Gallery"} 
          subtitle={homepage?.gallerySectionSubtitle || "Memorable moments from our community events and activities"}
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
          title={homepage?.advertisementsSectionTitle || "Local Advertisements"} 
          subtitle={homepage?.advertisementsSectionSubtitle || "Discover offers and services from local residents"}
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
