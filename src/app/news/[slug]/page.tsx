import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "News", href: "/news" },
          { label: news.title },
        ]}
      />

      <article>
        <Section>
          <div className="space-y-6">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                {news.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text mt-2 mb-4">
                {news.title}
              </h1>
              <p className="text-text-light">
                Published on {formatDate(news.publishedAt, "long")}
              </p>
            </div>

            {news.image && (
              <div className="relative w-full h-96 overflow-hidden rounded-lg">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}

            <Separator />

            <div
              className="prose prose-lg max-w-none text-text"
              dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, "<br />") }}
            />
          </div>
        </Section>
      </article>
    </div>
  );
}
