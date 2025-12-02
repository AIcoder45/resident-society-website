import * as React from "react";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { getContactPageData, getContactInfo } from "@/lib/api";
import type { ContactInfo, ContactPageData } from "@/types";

export const metadata: Metadata = {
  title: "Contact Us - Greenwood City",
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

// Default fallback contact info if Bemo CMS is not available
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
    console.log("Contact page - Bemo CMS data:", {
      hasContactPageData: !!contactPageData,
      contactInfoCount: strapiContactInfo.length,
      items: strapiContactInfo,
    });
  }
  
  // Use Bemo CMS data if available, otherwise use default
  const contactInfoSource = strapiContactInfo.length > 0
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

  // Remove phone number card(s) from the displayed contact info
  const contactInfo = contactInfoSource.filter((info) => {
    const title = info.title?.toLowerCase() ?? "";
    const link = info.link ?? "";

    const isPhoneTitle =
      title.includes("phone") || title.includes("mobile");
    const isPhoneLink = link.startsWith("tel:");

    return !isPhoneTitle && !isPhoneLink;
  });

  // Use page title and subtitle from Bemo CMS if available
  const pageTitle = contactPageData?.pageTitle || "Contact Us";
  const pageSubtitle = contactPageData?.pageSubtitle || "Get in touch with our management team or committee members";
  
  // Use custom inquiry text if available
  const generalInquiryText = contactPageData?.generalInquiryText || null;
  const urgentMattersText = contactPageData?.urgentMattersText || null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 md:py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Contact Us" }]} />

      <Section
        title={pageTitle}
        subtitle={pageSubtitle}
        className="!pt-2 !pb-4 sm:!pt-4 sm:!pb-6"
      >
        {/* Contact Information Cards - Improved Card View */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full mb-6 sm:mb-10 md:mb-12">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const content = (
              <Card className="h-full w-full overflow-hidden border border-gray-200/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group bg-white">
                <CardContent className="p-2 sm:p-5 md:p-7 flex flex-col items-center text-center">
                  {/* Icon Container */}
                  <div className="mb-2 sm:mb-4 p-2 sm:p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-text mb-1 sm:mb-3 text-xs sm:text-base md:text-lg leading-tight">
                    {info.title}
                  </h3>
                  
                  {/* Content */}
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-text-light hover:text-primary transition-colors text-xs sm:text-sm md:text-base break-words block touch-manipulation w-full leading-tight"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-text-light text-xs sm:text-sm md:text-base break-words leading-tight">{info.content}</p>
                  )}
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

        {/* Information Section */}
        {(generalInquiryText || urgentMattersText) && (
          <div className="w-full mt-8 sm:mt-10 md:mt-12">
            <Card className="w-full border border-gray-200/60 shadow-lg">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="space-y-4 sm:space-y-5">
                  {contactPageData?.messageSectionTitle && (
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text mb-3">
                      {contactPageData.messageSectionTitle}
                    </h2>
                  )}
                  {generalInquiryText && (
                    <p className="text-sm sm:text-base text-text-light leading-relaxed">
                      {generalInquiryText}
                    </p>
                  )}
                  {urgentMattersText && (
                    <p className="text-xs sm:text-sm text-text-light/80 italic">
                      {urgentMattersText}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Section>
    </div>
  );
}
