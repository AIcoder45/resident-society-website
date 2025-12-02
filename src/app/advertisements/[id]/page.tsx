import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Globe, Tag, Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/shared/RichTextContent";
import { PageShareButton } from "@/components/shared/PageShareButton";
import { getAdvertisements } from "@/lib/api";
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
  const advertisements = await getAdvertisements();
  const advertisement = advertisements.find((ad) => ad.id === id);

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

  const advertisements = await getAdvertisements();
  const advertisement = advertisements.find((ad) => ad.id === id);

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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Advertisements", href: "/advertisements" },
          { label: advertisement.title },
        ]}
      />

      <article>
        <Section>
          <div className="space-y-4 sm:space-y-6">
            {/* Back + meta */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                asChild
                variant="ghost"
                className="w-max px-0 text-sm sm:text-base"
              >
                <Link href="/advertisements">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Advertisements
                </Link>
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {advertisement.category && (
                  <Badge
                    variant="outline"
                    className="text-[11px] sm:text-xs md:text-sm"
                  >
                    {advertisement.category}
                  </Badge>
                )}
                {isExpired && (
                  <Badge
                    variant="destructive"
                    className="text-[11px] sm:text-xs md:text-sm"
                  >
                    Expired
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text leading-tight">
                      {advertisement.title}
                    </h1>
                    {advertisement.businessName && (
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-primary mt-1">
                        {advertisement.businessName}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 md:self-start">
                    <PageShareButton
                      title={advertisement.title}
                      description={advertisement.description}
                    />
                  </div>
                </div>

                {advertisement.validUntil && (
                  <p className="text-xs sm:text-sm text-text-light">
                    Valid until:{" "}
                    <span className="font-medium">
                      {formatDate(advertisement.validUntil, "long")}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Main responsive layout */}
            <div className="mt-2 grid grid-cols-1 gap-5 sm:gap-6 lg:gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
              {/* Left: Image + description + offer */}
              <div className="space-y-4 sm:space-y-5">
                {/* Image Section */}
                {advertisement.image && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={advertisement.image}
                      alt={advertisement.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 720px"
                    />
                  </div>
                )}

                {/* Description */}
                {advertisement.description && (
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <RichTextContent content={advertisement.description} />
                    </CardContent>
                  </Card>
                )}

                {/* Discount and Offers */}
                {(advertisement.discount || advertisement.offer) && (
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <h2 className="text-lg sm:text-xl font-semibold text-text mb-3 sm:mb-4 leading-tight">
                        Special Offers
                      </h2>
                      <div className="space-y-3">
                        {advertisement.discount && (
                          <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                            <p className="font-semibold text-text">
                              Discount:{" "}
                              <span className="text-primary">
                                {advertisement.discount}
                              </span>
                            </p>
                          </div>
                        )}
                        {advertisement.offer && (
                          <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                            <p className="text-text-light">
                              {advertisement.offer}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Contact + quick facts */}
              <div className="space-y-4 sm:space-y-5">
                {/* Contact Information */}
                {(advertisement.contactPhone ||
                  advertisement.contactEmail ||
                  advertisement.website) && (
                  <Card>
                    <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-text leading-tight">
                        Contact & Actions
                      </h2>
                      {advertisement.contactPhone && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-start gap-3 text-sm sm:text-base"
                        >
                          <a
                            href={`tel:${advertisement.contactPhone.replace(
                              /\s+/g,
                              "",
                            )}`}
                            className="flex w-full items-center gap-3"
                          >
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="font-medium text-left">
                              Call {advertisement.contactPhone}
                            </span>
                          </a>
                        </Button>
                      )}
                      {advertisement.contactEmail && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-start gap-3 text-sm sm:text-base whitespace-normal text-left"
                        >
                          <a
                            href={`mailto:${advertisement.contactEmail}`}
                            className="flex w-full min-w-0 items-center gap-3 whitespace-normal"
                          >
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium break-all text-left">
                              Email {advertisement.contactEmail}
                            </span>
                          </a>
                        </Button>
                      )}
                      {advertisement.website && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-start gap-3 text-sm sm:text-base"
                        >
                          <a
                            href={advertisement.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-3"
                          >
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-medium truncate text-left">
                              Visit{" "}
                              {advertisement.website.replace(
                                /^https?:\/\//,
                                "",
                              )}
                            </span>
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Summary card */}
                <Card>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <h2 className="text-sm sm:text-base font-semibold text-text">
                      Advertisement details
                    </h2>
                    {advertisement.validUntil && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-text-light">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>
                          Valid until{" "}
                          <span className="font-medium">
                            {formatDate(advertisement.validUntil, "long")}
                          </span>
                        </span>
                      </div>
                    )}
                    {advertisement.category && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-text-light">
                        <Tag className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Category: {advertisement.category}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Section>
      </article>
    </div>
  );
}

