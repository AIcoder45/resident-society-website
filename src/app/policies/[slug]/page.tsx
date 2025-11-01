import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeShare } from "@/components/shared/QRCodeShare";
import { getPolicyBySlug, getPolicies } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.map((policy) => ({
    slug: policy.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);

  if (!policy) {
    return {
      title: "Policy Not Found",
    };
  }

  return {
    title: `${policy.title} - Greenwood City`,
    description: policy.description,
  };
}

export default async function PolicyDetailPage({ params }: Props) {
  const { slug } = await params;
  const policy = await getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  // Generate the full URL for QR code
  // The QRCodeShare component will use client-side detection if URL is not provided
  const policyPath = `/policies/${slug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Policies", href: "/policies" },
          { label: policy.title },
        ]}
      />

      <article>
        <Section>
          <div className="space-y-6">
            <div>
              <Button asChild variant="ghost" className="mb-4">
                <Link href="/policies">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Policies
                </Link>
              </Button>

              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  {policy.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {policy.title}
              </h1>

              {policy.updatedAt && (
                <p className="text-text-light">
                  Last updated: {formatDate(policy.updatedAt, "long")}
                </p>
              )}
            </div>

            <Separator />

            <div className="prose prose-lg max-w-none text-text">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {policy.description}
              </p>
            </div>

            {policy.file && (
              <>
                <Separator />
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-text mb-2">
                          Document Download
                        </h3>
                        <p className="text-sm text-text-light">
                          Download the full policy document in PDF format.
                        </p>
                      </div>
                      <Button asChild size="lg">
                        <Link
                          href={policy.file}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download PDF
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* QR Code Share Section */}
            <Separator />
            <QRCodeShare url={policyPath} title={policy.title} />
          </div>
        </Section>
      </article>
    </div>
  );
}

