"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SuccessMessageProps {
  onClose: () => void;
}

/**
 * Success message component shown after successful form submission
 */
export function SuccessMessage({ onClose }: SuccessMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-text mb-3 sm:mb-4">
        Thank You!
      </h3>
      <p className="text-base sm:text-lg text-text-light mb-6 sm:mb-8 max-w-md">
        Thank you for sharing your availability. See you at the event!
      </p>
      <Button onClick={onClose} size="lg" className="min-w-[140px]">
        Close
      </Button>
    </div>
  );
}

