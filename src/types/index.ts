/**
 * Type definitions for Resident Society website content
 */

export interface News {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  image?: string;
  category: string;
  publishedAt: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  location: string;
  coverImage?: string;
  gallery?: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  eventId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "normal" | "urgent";
  expiryDate?: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  title: string;
  slug: string;
  description: string;
  file?: string;
  category: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  title: string;
  content: string;
  link?: string | null;
  icon?: string;
  order?: number;
}

export interface ContactPageData {
  id: string;
  pageTitle: string;
  pageSubtitle?: string | null;
  phoneNumber?: string;
  emailAddress?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  officeHours?: string;
  generalInquiryText?: string | null;
  urgentMattersText?: string | null;
}

export interface RWAMember {
  id: string;
  name: string;
  position: string;
  photo?: string;
  message?: string;
  order?: number;
}

export interface Advertisement {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  businessName?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  discount?: string;
  offer?: string;
  image?: string;
  validUntil?: string;
  publishedAt: string;
  createdAt: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export interface Homepage {
  id: string;
  heroWelcomeText: string;
  heroTitleText: string;
  heroSubtitleText: string;
  heroDescription: string;
  heroDescriptionMobile?: string | null;
  newsSectionTitle: string;
  newsSectionSubtitle: string;
  eventsSectionTitle: string;
  eventsSectionSubtitle: string;
  gallerySectionTitle: string;
  gallerySectionSubtitle: string;
  advertisementsSectionTitle: string;
  advertisementsSectionSubtitle: string;
}

export interface Theme {
  id: string;
  siteName?: string;
  siteShortName?: string;
  siteDescription?: string;
  logo?: string | null;
  logoDark?: string | null;
  favicon?: string | null;
  primaryColor: string;
  primaryColorDark?: string;
  primaryColorLight?: string;
  secondaryColor?: string | null;
  backgroundColor: string;
  backgroundColorDark?: string;
  textColor: string;
  textColorLight?: string;
  themeColor: string;
  accentColor?: string | null;
  errorColor?: string;
  successColor?: string;
  warningColor?: string;
  infoColor?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: string; // e.g., "plumber", "electrician", "gardener"
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  rating?: number; // 1-5
  verified?: boolean; // Verified by RWA
  available?: boolean; // Currently available
  emergency?: boolean; // Available for emergencies
  order?: number; // Display order
  image?: string; // Service provider image URL
  createdAt: string;
}
