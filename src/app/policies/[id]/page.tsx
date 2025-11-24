import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, FileText, ArrowLeft, Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextContent } from "@/components/shared/RichTextContent";
import { getPolicyById, getPolicyBySlug, getPolicies } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Get file icon based on file extension
function getFileIcon(fileUrl: string) {
  const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
      return FileText;
    case 'xls':
    case 'xlsx':
      return FileText;
    case 'ppt':
    case 'pptx':
      return FileText;
    default:
      return FileText;
  }
}

// Get file type label
function getFileTypeLabel(fileUrl: string): string {
  const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf':
      return 'PDF Document';
    case 'doc':
    case 'docx':
      return 'Word Document';
    case 'xls':
    case 'xlsx':
      return 'Excel Spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint Presentation';
    default:
      return 'Document';
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.map((policy) => ({
    id: policy.slug || policy.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Try slug first, then fallback to ID
  const policy = await getPolicyBySlug(id) || await getPolicyById(id);

  if (!policy) {
    return {
      title: "Policy Not Found",
    };
  }

  return {
    title: `${policy.title} - Policies - Greenwood City`,
    description: policy.description || `View policy details and download documents for ${policy.title}`,
  };
}

export default async function PolicyDetailPage({ params }: Props) {
  const { id } = await params;
  
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [Policy Detail Page] Requested identifier:", id);
  }

  // Try slug first (most common), then fallback to ID
  const policy = await getPolicyBySlug(id) || await getPolicyById(id);

  if (!policy) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ [Policy Detail Page] Policy not found for ID:", id);
    }
    notFound();
  }

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("✅ [Policy Detail Page] Policy loaded:", {
      policyId: id,
      policyTitle: policy.title,
      hasDocuments: !!policy.documents,
      documentsCount: policy.documents?.length || 0,
      documents: policy.documents?.map(d => ({
        id: d.id,
        name: d.documentName,
        hasFile: !!d.file,
        fileUrl: d.file ? d.file.substring(0, 60) : "NO FILE"
      })),
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-5 md:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Policies", href: "/policies" },
          { label: policy.title },
        ]}
      />

      <article>
        <Section className="!pt-2 !pb-4 sm:!pt-3 sm:!pb-5">
          <div className="space-y-4 sm:space-y-5">
            {/* Header Section - Mobile Optimized */}
            <div className="space-y-3">
              <Button 
                asChild 
                variant="ghost" 
                size="sm" 
                className="text-xs sm:text-sm -ml-1 sm:-ml-2 h-9 sm:h-10 px-2 sm:px-3 touch-manipulation"
              >
                <Link href="/policies" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 sm:h-4 sm:w-4 mr-1.5" />
                  <span>Back</span>
                </Link>
              </Button>

              {policy.category && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                    {policy.category}
                  </span>
                </div>
              )}

              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text leading-tight">
                {policy.title}
              </h1>

              {policy.updatedAt && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-light">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Updated {formatDate(policy.updatedAt, "short")}</span>
                </div>
              )}
            </div>

            <Separator className="my-3 sm:my-4" />

            {/* Description - Mobile Optimized */}
            {policy.description && (
              <div className="prose prose-sm sm:prose-base max-w-none text-text [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed [&_p]:mb-3">
                <RichTextContent content={policy.description} />
              </div>
            )}

            {!policy.description && (
              <div className="text-sm sm:text-base text-text-light italic py-2">
                No description available for this policy.
              </div>
            )}

            {/* Documents Section - Mobile Optimized */}
            <Separator className="my-3 sm:my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text">
                  Documents
                </h2>
                {policy.documents && policy.documents.length > 0 && (
                  <span className="text-xs sm:text-sm text-text-light bg-gray-100 px-2 py-1 rounded-full">
                    {policy.documents.length} {policy.documents.length === 1 ? 'file' : 'files'}
                  </span>
                )}
              </div>

              {policy.documents && policy.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {policy.documents.map((doc, index) => {
                    const FileIcon = getFileIcon(doc.file || "");
                    const fileTypeLabel = getFileTypeLabel(doc.file || "");
                    const hasFile = doc.file && doc.file.length > 0;
                    
                    return (
                      <Card key={doc.id || index} className="border border-gray-200 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col">
                        <CardContent className="p-2 sm:p-2.5 flex flex-col flex-1">
                          {/* Icon and Title */}
                          <div className="flex flex-col items-center text-center mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-primary/10 flex items-center justify-center mb-1.5">
                              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-semibold text-text leading-tight line-clamp-2 mb-1">
                              {doc.documentName}
                            </h4>
                            {hasFile && (
                              <span className="text-[9px] sm:text-[10px] text-text-light bg-gray-100 px-1.5 py-0.5 rounded">
                                {fileTypeLabel}
                              </span>
                            )}
                          </div>

                          {/* Download Button - Fixed to stay inside card */}
                          {hasFile ? (
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={doc.documentName || undefined}
                              className="mt-auto flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors duration-200 shadow-sm hover:shadow-md touch-manipulation w-full"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <div className="mt-auto flex items-center justify-center gap-1.5 text-[10px] text-text-light italic bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span>Not available</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="h-10 w-10 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-text-light font-medium px-4">
                    No documents available for this policy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Section>
      </article>
    </div>
  );
}

