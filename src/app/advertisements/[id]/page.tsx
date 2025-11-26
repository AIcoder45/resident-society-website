import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Globe, Tag, Calendar, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/shared/RichTextContent";
import { PageShareButton } from "@/components/shared/PageShareButton";
import { getAdvertisementById, getAdvertisements } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Props = {
  params: { id: string };
};

export async function generateStaticParams() {
  const advertisements = await getAdvertisements();
  return advertisements.map((ad) => ({
    id: ad.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const advertisement = await getAdvertisementById(id);

  if (!advertisement) {
    return {
      title: "Advertisement Not Found",
    };
  }

  return {
    title: `${advertisement.title} - Greenwood City`,
    description: advertisement.description,
  };
}

export default async function AdvertisementDetailPage({ params }: Props) {
  const { id } = params;
  
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Advertisement detail page - ID:", id);
  }

  const advertisement = await getAdvertisementById(id);

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Advertisement detail page - Result:", {
      hasAdvertisement: !!advertisement,
      title: advertisement?.title,
    });
  }

  if (!advertisement) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Advertisement not found, calling notFound()");
    }
    notFound();
  }

  const isExpired = advertisement.validUntil
    ? new Date(advertisement.validUntil) < new Date()
    : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Advertisements", href: "/advertisements" },
          { label: advertisement.title },
        ]}
      />

      <article>
        <Section>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Button asChild variant="ghost" className="mb-3 sm:mb-4 text-sm sm:text-base">
                <Link href="/advertisements">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Advertisements
                </Link>
              </Button>

              <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                <Badge variant="outline" className="text-xs sm:text-sm">{advertisement.category}</Badge>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs sm:text-sm">Expired</Badge>
                )}
              </div>

              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text leading-tight flex-1">
                  {advertisement.title}
                </h1>
                <PageShareButton
                  title={advertisement.title}
                  description={advertisement.description}
                />
              </div>

              {advertisement.businessName && (
                <p className="text-base sm:text-lg font-semibold text-primary mb-2">
                  {advertisement.businessName}
                </p>
              )}

              {advertisement.validUntil && (
                <p className="text-xs sm:text-sm text-text-light">
                  Valid until: {formatDate(advertisement.validUntil, "long")}
                </p>
              )}
            </div>

            {/* Image Section */}
            {advertisement.image && (
              <>
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={advertisement.image}
                    alt={advertisement.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
                <Separator />
              </>
            )}

            {/* Description */}
            {advertisement.description && (
              <RichTextContent content={advertisement.description} />
            )}

            {/* Discount and Offers */}
            {(advertisement.discount || advertisement.offer) && (
              <>
                <Separator />
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-text mb-3 sm:mb-4 leading-tight">
                      Special Offers
                    </h2>
                    <div className="space-y-3">
                      {advertisement.discount && (
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-text">
                              Discount: <span className="text-primary">{advertisement.discount}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      {advertisement.offer && (
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-text-light">
                              {advertisement.offer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Contact Information */}
            {(advertisement.contactPhone ||
              advertisement.contactEmail ||
              advertisement.website) && (
              <>
                <Separator />
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-text mb-3 sm:mb-4 leading-tight">
                      Contact Information
                    </h2>
                    <div className="space-y-3">
                      {advertisement.contactPhone && (
                        <a
                          href={`tel:${advertisement.contactPhone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-3 text-text hover:text-primary transition-colors"
                        >
                          <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-lg">{advertisement.contactPhone}</span>
                        </a>
                      )}
                      {advertisement.contactEmail && (
                        <a
                          href={`mailto:${advertisement.contactEmail}`}
                          className="flex items-center gap-3 text-text-light hover:text-primary transition-colors"
                        >
                          <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-lg">{advertisement.contactEmail}</span>
                        </a>
                      )}
                      {advertisement.website && (
                        <a
                          href={advertisement.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-text-light hover:text-primary transition-colors"
                        >
                          <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-lg truncate">{advertisement.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </Section>
      </article>
    </div>
  );
}

