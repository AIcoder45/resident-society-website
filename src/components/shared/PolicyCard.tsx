"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileText, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Policy } from "@/types";

export interface PolicyCardProps {
  policy: Policy;
  className?: string;
}

/**
 * Policy Card Component
 * Displays a policy with its documents and download buttons
 */
export function PolicyCard({ policy, className }: PolicyCardProps) {
  const hasDocuments = policy.documents && policy.documents.length > 0 && policy.documents.some(doc => doc.file && doc.file.length > 0);
  // Use slug if available, otherwise use id
  const policyIdentifier = policy.slug || (policy.id && policy.id !== "" ? policy.id : "unknown");
  const policyUrl = `/policies/${policyIdentifier}`;
  
  // Get first document with valid file URL
  const firstDocument = hasDocuments ? policy.documents!.find(doc => doc.file && doc.file.length > 0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card className="h-full w-full overflow-hidden border border-gray-200/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white relative">
        <CardHeader className="pb-3">
          <Link 
            href={policyUrl} 
            className="block"
          >
            {policy.category && (
              <span className="text-[9px] sm:text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 block">
                {policy.category}
              </span>
            )}
            <CardTitle className="text-sm sm:text-base font-semibold text-text leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {policy.title}
            </CardTitle>
            {policy.description && (
              <p className="text-[10px] sm:text-xs text-text-light line-clamp-2 mt-1">
                {policy.description.replace(/[#*]/g, "").substring(0, 100)}
              </p>
            )}
            {policy.updatedAt && (
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-text-light mt-2">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatDate(policy.updatedAt, "short")}</span>
              </div>
            )}
          </Link>
        </CardHeader>

        <CardContent className="pt-0">
          {hasDocuments && firstDocument ? (
            <div className="flex items-center justify-between gap-2 pt-2">
              <Link 
                href={policyUrl}
                className="flex items-center gap-2 flex-1 min-w-0 hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs text-text-light">
                    {policy.documents!.filter(doc => doc.file && doc.file.length > 0).length} {policy.documents!.filter(doc => doc.file && doc.file.length > 0).length === 1 ? 'document' : 'documents'} available
                  </span>
                </div>
              </Link>
              <a
                href={firstDocument.file}
                target="_blank"
                rel="noopener noreferrer"
                download={firstDocument.documentName || undefined}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors duration-200 flex-shrink-0 touch-manipulation shadow-sm hover:shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          ) : (
            <Link href={policyUrl} className="block">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-primary font-medium pt-2 hover:text-primary/80 transition-colors">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

