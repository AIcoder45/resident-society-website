import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { ContentCard } from "@/components/shared/ContentCard";
import { getNews } from "@/lib/api";

export const metadata: Metadata = {
  title: "News - Greenwood City",
  description: "Stay updated with the latest news and announcements from Greenwood City.",
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "News" }]} />
      
      <Section title="All News" subtitle="Latest updates and announcements from our community">
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {news.map((item) => (
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-light">No news articles available at the moment.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
