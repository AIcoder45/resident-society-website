import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { RichTextContent } from "@/components/shared/RichTextContent";
import { PageShareButton } from "@/components/shared/PageShareButton";
import { EventAnalytics } from "@/components/shared/EventAnalytics";
import { MarkAvailabilityButton } from "@/components/shared/MarkAvailabilityButton";
import { getEventBySlug, getEvents } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  // Get the site URL - fallback to production URL if not set
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in';
  const pageUrl = `${siteUrl}/events/${event.slug}`;
  
  // Ensure image URL is absolute
  const imageUrl = event.coverImage 
    ? event.coverImage.startsWith('http') 
      ? event.coverImage 
      : `${siteUrl}${event.coverImage}`
    : `${siteUrl}/logo.png`; // Fallback to logo

  // Extract plain text description (remove HTML tags if present)
  const plainDescription = event.description?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Join us for this exciting event';

  return {
    title: `${event.title} - Greenwood City`,
    description: plainDescription,
    openGraph: {
      title: event.title,
      description: plainDescription,
      url: pageUrl,
      siteName: 'Greenwood City Block C',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: event.eventDate,
      authors: ['Greenwood City Block C'],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: plainDescription,
      images: [imageUrl],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate >= new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <article>
        <Section>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex-1">
                  {isUpcoming && (
                    <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                      Upcoming Event
                    </span>
                  )}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text leading-tight">
                    {event.title}
                  </h1>
                </div>
                <PageShareButton
                  title={event.title}
                  description={event.description}
                />
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-base text-text-light">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>{formatDate(event.eventDate, "long")}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Show Image and Video Platform Icons */}
            <div className="space-y-2">
            {event.coverImage && (
              <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  unoptimized={event.coverImage.startsWith("/") && !event.coverImage.startsWith("http")}
                />
              </div>
            )}

              {/* Video Platform Icons - Below Image */}
              {(event.youtubeUrl || event.instagramUrl) && (
                <div className="flex gap-2">
                  {event.youtubeUrl && (
                    <a
                      href={event.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md text-xs sm:text-sm font-medium"
                      aria-label="Watch on YouTube"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Watch on YouTube</span>
                    </a>
                  )}
                  {event.instagramUrl && (
                    <a
                      href={event.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-md text-xs sm:text-sm font-medium"
                      aria-label="View on Instagram"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>View on Instagram</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <RichTextContent content={event.description} />

            {/* Gallery Section */}
            {event.gallery && event.gallery.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-text leading-tight">Event Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {event.gallery.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative w-full aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${event.title} - Gallery image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={imageUrl.startsWith("/") && !imageUrl.startsWith("http")}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mark Availability Button - Small, at end of page, only for upcoming events */}
            {isUpcoming && (
              <>
                <Separator />
                <div className="flex justify-center">
                  <MarkAvailabilityButton event={event} size="sm" />
                </div>
              </>
            )}

            {/* Event Analytics Section - Show for all events */}
            <>
              <Separator />
              <EventAnalytics eventId={event.id} />
            </>
          </div>
        </Section>
      </article>
    </div>
  );
}
