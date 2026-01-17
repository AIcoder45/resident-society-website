"use client";

import * as React from "react";
import { useState } from "react";
import {
  Home,
  User,
  Users,
  Phone,
  Loader2,
  AlertCircle,
  CircleDot,
  Building2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitEventInterest, checkEventInterest } from "@/lib/event-interest";
import type { Event, EventInterestFormData } from "@/types";

export interface AvailabilityFormProps {
  event: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

const FLOOR_OPTIONS = [
  { value: "Ground", label: "Ground", icon: CircleDot },
  { value: "First", label: "First", icon: Building2 },
  { value: "Second", label: "Second", icon: Building2 },
  { value: "Third", label: "Third", icon: Building2 },
  { value: "Fourth", label: "Fourth", icon: Building2 },
];
const HOUSE_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

/**
 * Form component for marking event availability
 * Includes all required fields with validation
 */
export function AvailabilityForm({
  event,
  onSuccess,
  onCancel,
}: AvailabilityFormProps) {
  const [formData, setFormData] = useState<EventInterestFormData>({
    event: event.id,
    floorNumber: "",
    houseNumber: "",
    residentName: "",
    attendeeCount: 1,
    contactNumber: "",
    notes: "",
    interested: "yes",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EventInterestFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [existingInterestId, setExistingInterestId] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<
      Record<keyof EventInterestFormData, string>
    > = {};

    if (!formData.floorNumber.trim()) {
      newErrors.floorNumber = "Floor number is required";
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = "House number is required";
    }

    if (!formData.attendeeCount || formData.attendeeCount < 1) {
      newErrors.attendeeCount = "Attendee count must be at least 1";
    }

    // Resident name and contact number are optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format house number with "C-" prefix
      const formattedHouseNumber = `C-${formData.houseNumber}`;

      // Always check for duplicate before submitting (unless updating existing)
      if (!existingInterestId) {
        const checkResult = await checkEventInterest(
          formData.event,
          formattedHouseNumber,
          formData.floorNumber
        );

        if (checkResult.success && checkResult.data?.exists && checkResult.data.interest) {
          // Duplicate found - prevent submission
          setSubmitError(
            `An entry already exists for House ${formData.houseNumber} on ${formData.floorNumber} floor. Please update the existing entry instead.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      const result = await submitEventInterest(
        {
          event: formData.event,
          houseNumber: formattedHouseNumber,
          floorNumber: formData.floorNumber,
          residentName: formData.residentName,
          attendeeCount: formData.attendeeCount,
          contactNumber: formData.contactNumber,
          notes: formData.notes,
          interested: "yes",
        },
        existingInterestId || undefined
      );

      if (result.success) {
        // Trigger refresh event for summary component
        window.dispatchEvent(
          new CustomEvent("eventInterestUpdated", {
            detail: { eventId: formData.event },
          })
        );
        onSuccess();
      } else {
        setSubmitError(
          result.error || "Failed to submit availability. Please try again."
        );
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for existing data when house number and floor are both selected
  React.useEffect(() => {
    async function checkExistingData() {
      if (!formData.houseNumber || !formData.floorNumber || isSubmitting) {
        return;
      }

      setIsChecking(true);
      try {
        const formattedHouseNumber = `C-${formData.houseNumber}`;
        const result = await checkEventInterest(
          formData.event,
          formattedHouseNumber,
          formData.floorNumber
        );

        if (result.success && result.data?.exists && result.data.interest) {
          const existing = result.data.interest;
          setExistingInterestId(existing.id);
          
          // Populate form with existing data
          setFormData((prev) => ({
            ...prev,
            attendeeCount: existing.attendeeCount || existing.numberOfMembers || prev.attendeeCount,
            residentName: existing.residentName || "",
            contactNumber: existing.contactNumber || "",
            notes: existing.notes || "",
          }));
        } else {
          // No existing data found, reset to defaults
          setExistingInterestId(null);
          setFormData((prev) => ({
            ...prev,
            attendeeCount: 1,
            residentName: "",
            contactNumber: "",
            notes: "",
          }));
        }
      } catch (error) {
        console.error("Error checking existing data:", error);
        // Don't show error to user, just continue with form
      } finally {
        setIsChecking(false);
      }
    }

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(() => {
      checkExistingData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.houseNumber, formData.floorNumber, formData.event, isSubmitting]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "attendeeCount" ? parseInt(value, 10) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof EventInterestFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Error Message */}
      {submitError && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 leading-relaxed">{submitError}</p>
        </div>
      )}

      {/* Event ID (Hidden) */}
      <input type="hidden" name="event" value={formData.event} />

      {/* Loading indicator when checking existing data */}
      {isChecking && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Checking...</span>
        </div>
      )}

      {/* Existing data found indicator */}
      {existingInterestId && !isChecking && (
        <div className="bg-green-50 border border-green-200 rounded-md p-2">
          <p className="text-xs text-green-800">
            <strong>✓ Found!</strong> Updating existing entry.
          </p>
        </div>
      )}

      {/* House Number - Compact */}
      <div>
        <label
          htmlFor="houseNumber"
          className="flex items-center text-xs font-medium text-text mb-1.5"
        >
          <Home className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
          <span>House <span className="text-red-500">*</span></span>
        </label>
        <select
          id="houseNumber"
          name="houseNumber"
          value={formData.houseNumber}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`flex h-9 w-full rounded-md border ${
            errors.houseNumber
              ? "border-red-500 ring-red-500"
              : "border-gray-300"
          } bg-white px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50`}
          aria-invalid={errors.houseNumber ? "true" : undefined}
          aria-describedby={
            errors.houseNumber ? "houseNumber-error" : undefined
          }
        >
          <option value="">Select</option>
          {HOUSE_NUMBERS.map((num) => (
            <option key={num} value={num}>
              C-{num}
            </option>
          ))}
        </select>
        {errors.houseNumber && (
          <p
            id="houseNumber-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.houseNumber}
          </p>
        )}
      </div>

      {/* Floor Number - Compact */}
      <div>
        <label
          htmlFor="floorNumber"
          className="flex items-center text-xs font-medium text-text mb-1.5"
        >
          <Layers className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
          <span>Floor <span className="text-red-500">*</span></span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {FLOOR_OPTIONS.map((floor) => {
            const Icon = floor.icon;
            const isSelected = formData.floorNumber === floor.value;
            return (
              <button
                key={floor.value}
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setFormData((prev) => ({ ...prev, floorNumber: floor.value }));
                    if (errors.floorNumber) {
                      setErrors((prev) => ({ ...prev, floorNumber: undefined }));
                    }
                  }
                }}
                disabled={isSubmitting}
                className={`
                  flex flex-col items-center justify-center gap-0.5 h-10 rounded-md border transition-all
                  ${isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50"
                  }
                  ${errors.floorNumber ? "border-red-500" : ""}
                  disabled:cursor-not-allowed disabled:opacity-50
                  touch-manipulation
                `}
                aria-pressed={isSelected}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-gray-600"}`} />
                <span className="text-[9px] font-medium">{floor.label}</span>
              </button>
            );
          })}
        </div>
        <input
          type="hidden"
          name="floorNumber"
          value={formData.floorNumber}
        />
        {errors.floorNumber && (
          <p
            id="floorNumber-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.floorNumber}
          </p>
        )}
      </div>

      {/* Members Count - Compact */}
      <div>
        <label
          htmlFor="attendeeCount"
          className="flex items-center text-xs font-medium text-text mb-1.5"
        >
          <Users className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
          <span>Members <span className="text-red-500">*</span></span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 9 }, (_, i) => {
            const count = i + 1;
            const isSelected = formData.attendeeCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setFormData((prev) => ({ ...prev, attendeeCount: count }));
                    if (errors.attendeeCount) {
                      setErrors((prev) => ({ ...prev, attendeeCount: undefined }));
                    }
                  }
                }}
                disabled={isSubmitting}
                className={`
                  flex items-center justify-center h-9 rounded-md border transition-all font-semibold text-sm
                  ${isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5"
                  }
                  ${errors.attendeeCount ? "border-red-500" : ""}
                  disabled:cursor-not-allowed disabled:opacity-50
                  touch-manipulation active:scale-95
                `}
                aria-pressed={isSelected}
              >
                {count}
              </button>
            );
          })}
        </div>
        <input
          type="hidden"
          name="attendeeCount"
          value={formData.attendeeCount}
        />
        {errors.attendeeCount && (
          <p
            id="attendeeCount-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.attendeeCount}
          </p>
        )}
      </div>

      {/* Resident Name and Contact Number - Compact */}
      <div className="grid grid-cols-2 gap-2">
        {/* Resident Name */}
        <div>
          <label
            htmlFor="residentName"
            className="flex items-center text-xs font-medium text-text mb-1"
          >
            <User className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
            <span className="text-gray-500">Name</span>
          </label>
          <Input
            type="text"
            id="residentName"
            name="residentName"
            placeholder="Your name"
            value={formData.residentName}
            onChange={handleChange}
            error={errors.residentName}
            disabled={isSubmitting}
            className="h-8 text-sm"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label
            htmlFor="contactNumber"
            className="flex items-center text-xs font-medium text-text mb-1"
          >
            <Phone className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
            <span className="text-gray-500">Phone</span>
          </label>
          <Input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            placeholder="9876543210"
            value={formData.contactNumber}
            onChange={handleChange}
            error={errors.contactNumber}
            disabled={isSubmitting}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Submit and Cancel Buttons - Compact */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button
          type="submit"
          disabled={isSubmitting || isChecking}
          className="flex-1"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              {existingInterestId ? "Updating..." : "Submitting..."}
            </>
          ) : (
            existingInterestId ? "Update" : "Submit"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

