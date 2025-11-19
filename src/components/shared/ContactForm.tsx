"use client";

import * as React from "react";
import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  generalInquiryText?: string;
  urgentMattersText?: string;
}

export function ContactForm({ generalInquiryText, urgentMattersText }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage("Thank you! Your message has been sent successfully. We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        setSubmitStatus("error");
        setSubmitMessage(data.error || "Failed to send message. Please try again later.");
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Card className="w-full border border-gray-200/60 shadow-lg">
      <CardContent className="p-5 sm:p-6 md:p-8">
        <div className="space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text mb-3">
              Send us a Message
            </h2>
            {generalInquiryText && (
              <p className="text-sm sm:text-base text-text-light mb-2 leading-relaxed">
                {generalInquiryText}
              </p>
            )}
            {urgentMattersText && (
              <p className="text-xs sm:text-sm text-text-light/80 italic">
                {urgentMattersText}
              </p>
            )}
          </div>

          {/* Success/Error Messages */}
          {submitStatus === "success" && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-green-800">{submitMessage}</p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-red-800">{submitMessage}</p>
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Name Field */}
              <div className="sm:col-span-1">
                <Input
                  type="text"
                  name="name"
                  label="Your Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div className="sm:col-span-1">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <Input
                type="tel"
                name="phone"
                label="Phone Number (Optional)"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                disabled={isSubmitting}
              />
            </div>

            {/* Subject Field */}
            <div>
              <Input
                type="text"
                name="subject"
                label="Subject"
                placeholder="What is this regarding?"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Message Field */}
            <div>
              <Textarea
                name="message"
                label="Message"
                placeholder="Please provide details about your inquiry..."
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                required
                disabled={isSubmitting}
                rows={6}
                className="min-h-[120px] sm:min-h-[140px]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[140px]"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

