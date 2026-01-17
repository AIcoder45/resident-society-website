"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityModal } from "./AvailabilityModal";
import type { Event } from "@/types";

export interface MarkAvailabilityButtonProps {
  event: Event;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

/**
 * Button component that opens the availability modal
 * Can be used standalone or integrated into EventCard
 */
export function MarkAvailabilityButton({
  event,
  className,
  variant = "default",
  size = "default",
}: MarkAvailabilityButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        variant={variant}
        size={size}
        className={className}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Mark Availability
      </Button>

      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
      />
    </>
  );
}

