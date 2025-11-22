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
  const hasDocuments = policy.documents && policy.documents.length > 0;
  // Ensure we have a valid ID for the URL
  const policyId = policy.id && policy.id !== "" ? policy.id : "unknown";
  const policyUrl = `/policies/${policyId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card className="h-full w-full overflow-hidden border border-gray-200/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white relative cursor-pointer">
        <Link 
          href={policyUrl} 
          className="absolute inset-0 z-0 touch-manipulation tap-feedback" 
          aria-label={`View details for ${policy.title}`}
          style={{ pointerEvents: 'auto' }}
        />
        <CardHeader className="pb-3 relative z-10">
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
        </CardHeader>

        {hasDocuments && (
          <CardContent className="pt-0 relative z-10">
            <div className="space-y-2">
              <h4 className="text-[10px] sm:text-xs font-semibold text-text mb-2">
                Documents ({policy.documents!.length})
              </h4>
              {policy.documents!.slice(0, 2).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-text truncate">
                      {doc.documentName}
                    </span>
                  </div>
                  {doc.file && (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-20 inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-colors duration-200 flex-shrink-0 touch-manipulation"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
              {policy.documents!.length > 2 && (
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-primary font-medium pt-1">
                  <span>+{policy.documents!.length - 2} more document{policy.documents!.length - 2 > 1 ? 's' : ''}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </div>
          </CardContent>
        )}

        {!hasDocuments && (
          <CardContent className="pt-0 relative z-10">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-primary font-medium">
              <span>View Details</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

