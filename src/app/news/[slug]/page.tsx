import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { RichTextContent } from "@/components/shared/RichTextContent";
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

            {news.image && (
              <div className="relative w-full aspect-video overflow-hidden rounded-lg mt-1.5">
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

            <Separator className="my-2" />

            <RichTextContent content={news.content} />
          </div>
        </Section>
      </article>
    </div>
  );
}
