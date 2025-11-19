import * as React from "react";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { ContactForm } from "@/components/shared/ContactForm";
import { getContactPageData, getContactInfo } from "@/lib/api";
import type { ContactInfo, ContactPageData } from "@/types";

export const metadata: Metadata = {
  title: "Contact - Greenwood City",
  description: "Get in touch with Greenwood City management and committee.",
};

// Icon mapping from Strapi icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  mail: Mail,
  email: Mail,
  map: MapPin,
  mappin: MapPin,
  address: MapPin,
  clock: Clock,
  time: Clock,
  hours: Clock,
};

// Default fallback contact info if Strapi is not available
const defaultContactInfo: Array<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  link: string | null;
}> = [
  {
    icon: Phone,
    title: "Phone",
    content: "+1 (555) 123-4567",
    link: "tel:+15551234567",
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@greenwoodcity.org",
    link: "mailto:info@greenwoodcity.org",
  },
  {
    icon: MapPin,
    title: "Address",
    content: "123 Community Lane, City, State 12345",
    link: null,
  },
  {
    icon: Clock,
    title: "Office Hours",
    content: "Monday - Friday: 9 AM - 5 PM",
    link: null,
  },
];

export default async function ContactPage() {
  const contactPageData = await getContactPageData();
  const strapiContactInfo = await getContactInfo();
  
  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Contact page - Strapi data:", {
      hasContactPageData: !!contactPageData,
      contactInfoCount: strapiContactInfo.length,
      items: strapiContactInfo,
    });
  }
  
  // Use Strapi data if available, otherwise use default
  const contactInfo = strapiContactInfo.length > 0
    ? strapiContactInfo.map((item) => {
        const iconName = item.icon?.toLowerCase().trim() || "";
        const IconComponent = iconMap[iconName] || Mail; // Default to Mail if icon not found
        
        if (process.env.NODE_ENV === "development") {
          console.log("Mapping contact item:", {
            title: item.title,
            iconName,
            foundIcon: !!iconMap[iconName],
          });
        }
        
        return {
          icon: IconComponent,
          title: item.title,
          content: item.content,
          link: item.link || null,
        };
      })
    : defaultContactInfo;

  // Use page title and subtitle from Strapi if available
  const pageTitle = contactPageData?.pageTitle || "Contact Us";
  const pageSubtitle = contactPageData?.pageSubtitle || "Get in touch with our management team or committee members";
  
  // Use custom inquiry text if available
  const generalInquiryText = contactPageData?.generalInquiryText || 
    "For general inquiries, suggestions, or feedback, please reach out to us using the contact information above or visit our office during business hours.";
  const urgentMattersText = contactPageData?.urgentMattersText ||
    "For urgent matters, please call our emergency hotline or contact the security office.";
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Contact" }]} />

      <Section
        title={pageTitle}
        subtitle={pageSubtitle}
        className="!pt-2 !pb-4 sm:!pt-4 sm:!pb-6"
      >
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full mb-8 sm:mb-10 md:mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const content = (
              <Card className="h-full w-full overflow-hidden border border-gray-200/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text mb-1.5 sm:mb-2 text-sm sm:text-base">
                        {info.title}
                      </h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-text-light hover:text-primary transition-colors text-sm sm:text-base break-words block touch-manipulation"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-text-light text-sm sm:text-base break-words">{info.content}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            return (
              <AnimatedCard key={info.title} index={index}>
                {content}
              </AnimatedCard>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="w-full">
          <ContactForm
            generalInquiryText={generalInquiryText}
            urgentMattersText={urgentMattersText}
          />
        </div>
      </Section>
    </div>
  );
}
