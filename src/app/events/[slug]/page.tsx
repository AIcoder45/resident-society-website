import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { RichTextContent } from "@/components/shared/RichTextContent";
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

  return {
    title: `${event.title} - Greenwood City`,
    description: event.description,
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
              {isUpcoming && (
                <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                  Upcoming Event
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-3 sm:mb-4 leading-tight">
                {event.title}
              </h1>
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
          </div>
        </Section>
      </article>
    </div>
  );
}
