import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { RichTextContent } from "@/components/shared/RichTextContent";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { getNewsBySlug, getNews } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const news = await getNews();
  return news.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "News Not Found",
    };
  }

  return {
    title: `${news.title} - Greenwood City`,
    description: news.shortDescription,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <Breadcrumb
        items={[
          { label: "News", href: "/news" },
          { label: news.title },
        ]}
      />

      <article>
        <Section className="!pt-1 !pb-3 sm:!pt-2 sm:!pb-4">
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">
                {news.category}
              </span>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-text mt-1 mb-1 leading-tight">
                {news.title}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-text-light">
                Published on {formatDate(news.publishedAt, "long")}
              </p>
            </div>

            {/* Show Image and Video */}
            <div className="mt-1.5 space-y-2">
              {/* Image - Always show if available */}
            {news.image && (
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  unoptimized={news.image.startsWith("/") && !news.image.startsWith("http")}
                />
              </div>
            )}

              {/* Video Platform Icons - Below Image */}
              {(news.youtubeUrl || news.instagramUrl) && (
                <div className="flex gap-2">
                  {news.youtubeUrl && (
                    <a
                      href={news.youtubeUrl}
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
                  {news.instagramUrl && (
                    <a
                      href={news.instagramUrl}
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

              {/* Video Player - Show below image if available */}
              {(news.youtubeUrl || news.instagramUrl || news.video) && (
                <VideoPlayer
                  video={news.video}
                  youtubeUrl={news.youtubeUrl}
                  instagramUrl={news.instagramUrl}
                  image={news.image} // Pass image as thumbnail for YouTube/Instagram
                />
              )}
            </div>

            <Separator className="my-2" />

            <RichTextContent content={news.content} />
          </div>
        </Section>
      </article>
    </div>
  );
}
