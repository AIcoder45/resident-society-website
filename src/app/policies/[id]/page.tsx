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
import { getPolicyById, getPolicies } from "@/lib/api";
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
    id: policy.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const policy = await getPolicyById(id);

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
    console.log("🔍 [Policy Detail Page] Requested ID:", id);
  }

  const policy = await getPolicyById(id);

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
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Policies", href: "/policies" },
          { label: policy.title },
        ]}
      />

      <article>
        <Section className="!pt-1 !pb-3 sm:!pt-2 sm:!pb-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Header Section */}
            <div className="space-y-2 sm:space-y-3">
              <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm -ml-2 sm:-ml-3">
                <Link href="/policies">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  Back to Policies
                </Link>
              </Button>

              {policy.category && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-[9px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                    {policy.category}
                  </span>
                </div>
              )}

              <h1 className="text-base sm:text-lg md:text-xl font-bold text-text leading-tight">
                {policy.title}
              </h1>

              {policy.updatedAt && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-text-light">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Last updated: {formatDate(policy.updatedAt, "long")}</span>
                </div>
              )}
            </div>

            <Separator className="my-2 sm:my-3" />

            {/* Description */}
            {policy.description && (
              <div className="prose prose-sm sm:prose-base max-w-none">
                <RichTextContent content={policy.description} />
              </div>
            )}

            {/* Documents Section */}
            <Separator className="my-2 sm:my-3" />
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-text">
                  Documents
                </h2>
                {policy.documents && policy.documents.length > 0 && (
                  <span className="text-xs sm:text-sm text-text-light">
                    ({policy.documents.length} {policy.documents.length === 1 ? 'document' : 'documents'})
                  </span>
                )}
              </div>

              {policy.documents && policy.documents.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {policy.documents.map((doc, index) => {
                    const FileIcon = getFileIcon(doc.file || "");
                    const fileTypeLabel = getFileTypeLabel(doc.file || "");
                    const hasFile = doc.file && doc.file.length > 0;
                    
                    return (
                      <Card key={doc.id || index} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start gap-4 sm:gap-5">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <FileIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-text mb-2 leading-tight">
                                {doc.documentName}
                              </h4>
                              
                              {hasFile && (
                                <>
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-[10px] sm:text-xs text-text-light bg-gray-100 px-2 py-1 rounded">
                                      {fileTypeLabel}
                                    </span>
                                    {doc.size && (
                                      <span className="text-[10px] sm:text-xs text-text-light bg-gray-100 px-2 py-1 rounded">
                                        {(doc.size).toFixed(2)} MB
                                      </span>
                                    )}
                                  </div>
                                  
                                  <p className="text-[10px] sm:text-xs text-text-light mb-3 font-mono break-all line-clamp-1 bg-gray-50 p-2 rounded">
                                    {doc.file.split('/').pop() || doc.file}
                                  </p>
                                </>
                              )}

                              {hasFile ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                  <a
                                    href={doc.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-none text-xs sm:text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                  >
                                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span>Download Document</span>
                                  </a>
                                  <a
                                    href={doc.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-none text-xs sm:text-sm font-medium transition-colors duration-200"
                                  >
                                    <span>Open in New Tab</span>
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-text-light italic bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
                                  <FileText className="h-4 w-4" />
                                  <span>File not available for download</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-text-light font-medium">
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

