# Strapi CMS Setup Documentation for Greenwood City Website

This document provides complete instructions for setting up Strapi CMS to manage all static content for the Greenwood City Block C website. This documentation should be provided to the Strapi developer/administrator for implementation.

---

## Table of Contents

1. [Overview](#overview)
2. [Content Types Required](#content-types-required)
3. [Detailed Content Type Schemas](#detailed-content-type-schemas)
4. [API Endpoints & Permissions](#api-endpoints--permissions)
5. [Setup Instructions](#setup-instructions)
6. [Content Entry Guidelines](#content-entry-guidelines)

---

## Overview

The Greenwood City website uses Strapi CMS v4 or v5 to manage all dynamic content. All content should be accessible via REST API with proper permissions. The frontend automatically detects and uses Strapi when `STRAPI_URL` environment variable is set.

**Base URL Pattern:** `{STRAPI_URL}/api/{collection-name}?populate=*`

**Example:** `http://localhost:1337/api/news?populate=*`

---

## Content Types Required

The following content types need to be created in Strapi:

1. **Homepage** (Single Type) - Homepage hero section and section headings
2. **News** (Collection Type) - News articles
3. **Event** (Collection Type) - Community events
4. **Gallery** (Collection Type) - Photo gallery items
5. **Notification** (Collection Type) - Announcements and notifications
6. **Policy** (Collection Type) - Policies and documents
7. **Contact** (Single Type) - Contact page main data
8. **Contact Info** (Collection Type) - Contact information cards
9. **RWA** (Collection Type) - RWA governing body members
10. **Advertisement** (Collection Type) - Resident advertisements

---

## Detailed Content Type Schemas

### 1. Homepage (Single Type)

**API Name:** `homepage`  
**Display Name:** "Homepage"

This manages all static text content on the homepage.

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `heroWelcomeText` | Text (Short text) | Required, Default: "Welcome to" | First line of hero heading |
| `heroTitleText` | Text (Short text) | Required, Default: "Greenwood City" | Main hero title |
| `heroSubtitleText` | Text (Short text) | Required, Default: "Block C" | Hero subtitle (smaller text) |
| `heroDescription` | Text (Long text) | Required | Hero section description text |
| `heroDescriptionMobile` | Text (Long text) | Optional | Shorter description for mobile (if different) |
| `newsSectionTitle` | Text (Short text) | Required, Default: "Latest News" | News section heading |
| `newsSectionSubtitle` | Text (Long text) | Required, Default: "Stay informed with the latest community updates" | News section subtitle |
| `eventsSectionTitle` | Text (Short text) | Required, Default: "Upcoming Events" | Events section heading |
| `eventsSectionSubtitle` | Text (Long text) | Required, Default: "Join us for exciting community events and activities" | Events section subtitle |
| `gallerySectionTitle` | Text (Short text) | Required, Default: "Photo Gallery" | Gallery section heading |
| `gallerySectionSubtitle` | Text (Long text) | Required, Default: "Memorable moments from our community events and activities" | Gallery section subtitle |
| `advertisementsSectionTitle` | Text (Short text) | Required, Default: "Local Advertisements" | Advertisements section heading |
| `advertisementsSectionSubtitle` | Text (Long text) | Required, Default: "Discover offers and services from local residents" | Advertisements section subtitle |

**API Endpoint:** `GET /api/homepage?populate=*`

---

### 2. News (Collection Type)

**API Name:** `news`  
**Display Name:** "News"

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | News article title |
| `slug` | UID | Required, Attached to: `title` | URL-friendly identifier |
| `shortDescription` | Text (Long text) | Required | Brief description for cards/listings |
| `content` | Rich text | Required | Full article content (HTML) |
| `image` | Media | Single media, Type: Images only | Featured image |
| `category` | Text (Short text) | Required, Default: "Announcements" | Article category |
| `publishedAt` | Date | Required, Type: DateTime | Publication date/time |

**API Endpoints:**
- `GET /api/news?populate=*` - List all news (sorted by publishedAt desc)
- `GET /api/news?populate=*&filters[slug][$eq]={slug}` - Get single news by slug

**Example Data:**
```json
{
  "title": "Community Meeting Scheduled",
  "slug": "community-meeting-scheduled",
  "shortDescription": "Join us for the monthly community meeting on December 15th.",
  "content": "<p>We are pleased to announce...</p>",
  "category": "Announcements",
  "publishedAt": "2024-12-01T10:00:00Z"
}
```

---

### 3. Event (Collection Type)

**API Name:** `event`  
**Display Name:** "Event"

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Event title |
| `slug` | UID | Required, Attached to: `title` | URL-friendly identifier |
| `description` | Rich text | Required | Event description (HTML) |
| `eventDate` | Date | Required, Type: DateTime | Event date and time |
| `location` | Text (Short text) | Required | Event location |
| `coverImage` | Media | Single media, Type: Images only | Event cover image |
| `gallery` | Media | Multiple media, Type: Images only | Event photo gallery |

**API Endpoints:**
- `GET /api/events?populate=*` - List all events
- `GET /api/events?populate=*&filters[slug][$eq]={slug}` - Get single event by slug
- `GET /api/events?populate=*&filters[eventDate][$gte]={date}` - Get upcoming events

**Example Data:**
```json
{
  "title": "Summer Festival 2024",
  "slug": "summer-festival-2024",
  "description": "<p>Join us for the annual Summer Festival...</p>",
  "eventDate": "2024-07-15T18:00:00Z",
  "location": "Community Park"
}
```

---

### 4. Gallery (Collection Type)

**API Name:** `gallery`  
**Display Name:** "Gallery"

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Gallery item title |
| `description` | Text (Long text) | Optional | Gallery description |
| `images` | Media | Multiple media, Type: Images only | Gallery images (at least 1 required) |
| `eventId` | Text (Short text) | Optional | Related event ID (if linked to event) |
| `createdAt` | Date | Auto-managed | Creation date |

**API Endpoints:**
- `GET /api/galleries?populate=*` - List all gallery items (sorted by createdAt desc)

**Note:** The frontend uses `/api/galleries` endpoint.

**Example Data:**
```json
{
  "title": "Community Gathering 2024",
  "description": "Photos from our community gathering event",
  "images": ["image1.jpg", "image2.jpg", "image3.jpg"]
}
```

---

### 5. Notification (Collection Type)

**API Name:** `notification`  
**Display Name:** "Notification"

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Notification title |
| `message` | Text (Long text) | Required | Notification message/content |
| `priority` | Enumeration | Required, Values: `normal`, `urgent` | Notification priority |
| `expiryDate` | Date | Optional, Type: DateTime | Expiry date (notifications after this date are filtered out) |
| `createdAt` | Date | Auto-managed | Creation date |

**API Endpoints:**
- `GET /api/notifications?populate=*` - List all active notifications

**Example Data:**
```json
{
  "title": "Parking Lot Maintenance",
  "message": "The parking lot will be under maintenance from Dec 10-12.",
  "priority": "urgent",
  "expiryDate": "2024-12-13T00:00:00Z"
}
```

---

### 6. Policy (Collection Type)

**API Name:** `policy`  
**Display Name:** "Policy"

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Policy title |
| `slug` | UID | Required, Attached to: `title` | URL-friendly identifier |
| `description` | Rich text | Required | Policy description/content (HTML) |
| `file` | Media | Single media, Type: Files | PDF/document file |
| `category` | Text (Short text) | Required | Policy category (e.g., "Resident Guidelines", "Parking Rules") |
| `updatedAt` | Date | Auto-managed | Last update date |

**API Endpoints:**
- `GET /api/policies?populate=*` - List all policies
- `GET /api/policies?populate=*&filters[slug][$eq]={slug}` - Get single policy by slug
- `GET /api/policies?populate=*&filters[category][$eq]={category}` - Get policies by category

**Example Data:**
```json
{
  "title": "Parking Regulations",
  "slug": "parking-regulations",
  "description": "<p>All residents must follow these parking rules...</p>",
  "category": "Resident Guidelines"
}
```

---

### 7. Contact (Single Type)

**API Name:** `contact`  
**Display Name:** "Contact"

This manages the main contact page data.

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `pageTitle` | Text (Short text) | Required, Default: "Contact Us" | Page heading |
| `pageSubtitle` | Text (Long text) | Optional | Page subtitle |
| `phoneNumber` | Text (Short text) | Optional | Main phone number |
| `emailAddress` | Email | Optional | Main email address |
| `streetAddress` | Text (Short text) | Optional | Street address |
| `city` | Text (Short text) | Optional | City |
| `state` | Text (Short text) | Optional | State |
| `zipCode` | Text (Short text) | Optional | ZIP/Postal code |
| `officeHours` | Text (Short text) | Optional | Office hours (e.g., "8AM-6PM") |
| `generalInquiryText` | Text (Long text) | Optional | General inquiry instructions |
| `urgentMattersText` | Text (Long text) | Optional | Urgent matters instructions |

**API Endpoint:** `GET /api/contact?populate=*`

**Example Data:**
```json
{
  "pageTitle": "Contact Us",
  "pageSubtitle": "Get in touch with our management team",
  "phoneNumber": "08985685555",
  "emailAddress": "info@greenwood.com",
  "streetAddress": "C40",
  "city": "gurgaon",
  "state": "Haryana",
  "zipCode": "122003",
  "officeHours": "8AM-6PM"
}
```

---

### 8. Contact Info (Collection Type)

**API Name:** `contact-info`  
**Display Name:** "Contact Info"

This manages contact information cards displayed on the contact page.

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Contact card title (e.g., "Phone", "Email") |
| `content` | Text (Short text) | Required | Contact information (phone number, email, etc.) |
| `link` | Text (Short text) | Optional | Clickable link (e.g., "tel:+1234567890", "mailto:email@example.com") |
| `icon` | Text (Short text) | Optional | Icon name (valid values: `phone`, `mail`, `email`, `map`, `mappin`, `address`, `clock`, `time`, `hours`) |
| `order` | Number (Integer) | Optional, Default: 0 | Display order (lower numbers appear first) |

**API Endpoints:**
- `GET /api/contact-infos?populate=*&sort[0]=order:asc` - List all contact info items (sorted by order)

**Note:** The frontend uses `/api/contact-infos` endpoint.

**Example Data:**
```json
{
  "title": "Phone",
  "content": "+1 (555) 123-4567",
  "link": "tel:+15551234567",
  "icon": "phone",
  "order": 1
}
```

---

### 9. RWA (Collection Type)

**API Name:** `rwa`  
**Display Name:** "RWA Member"

This manages RWA governing body members.

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `name` | Text (Short text) | Required | Member's full name |
| `position` | Text (Short text) | Required | Position/role (e.g., "President", "Secretary") |
| `photo` | Media | Single media, Type: Images only | Member's photo |
| `message` | Text (Long text) | Optional | Message from the member |
| `order` | Number (Integer) | Optional, Default: 0 | Display order (lower numbers appear first) |

**API Endpoints:**
- `GET /api/rwas?populate=*&sort[0]=order:asc` - List all RWA members (sorted by order)

**Example Data:**
```json
{
  "name": "John Doe",
  "position": "President",
  "message": "As President, I am committed to fostering a vibrant and inclusive community.",
  "order": 1
}
```

---

### 10. Advertisement (Collection Type)

**API Name:** `advertisement`  
**Display Name:** "Advertisement"

This manages resident advertisements and business listings.

#### Fields:

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `title` | Text (Short text) | Required | Advertisement title |
| `slug` | UID | Optional, Attached to: `title` | URL-friendly identifier |
| `description` | Rich text | Required | Advertisement description (HTML) |
| `category` | Text (Short text) | Required | Category (e.g., "Health & Fitness", "Food & Dining", "Home Services", "Education", "Pet Services") |
| `businessName` | Text (Short text) | Optional | Business or service name |
| `contactPhone` | Text (Short text) | Optional | Contact phone number |
| `contactEmail` | Email | Optional | Contact email |
| `website` | Text (Short text) | Optional | Website URL |
| `discount` | Text (Short text) | Optional | Discount offer text |
| `offer` | Text (Long text) | Optional | Special offer details |
| `image` | Media | Single media, Type: Images only | Advertisement image |
| `validUntil` | Date | Optional, Type: DateTime | Expiry date (advertisements after this date are filtered out) |
| `publishedAt` | Date | Required, Type: DateTime | Publication date |
| `createdAt` | Date | Auto-managed | Creation date |

**API Endpoints:**
- `GET /api/advertisements?populate=*` - List all advertisements
- `GET /api/advertisements?populate=*&filters[category][$eq]={category}` - Get advertisements by category
- `GET /api/advertisements?populate=*&filters[id][$eq]={id}` - Get single advertisement by ID

**Example Data:**
```json
{
  "title": "Morning Yoga & Meditation Classes",
  "description": "<p>Join peaceful morning sessions...</p>",
  "category": "Health & Fitness",
  "businessName": "Inner Peace Yoga",
  "contactPhone": "9810011122",
  "contactEmail": "yoga@example.com",
  "website": "https://innerpeaceyoga.com",
  "offer": "Bring your own mat. Classes Mon–Sat, 6:00–7:00 AM",
  "validUntil": "2025-12-31T23:59:59Z",
  "publishedAt": "2024-01-15T10:00:00Z"
}
```

---

## API Endpoints & Permissions

### Enable Public API Access

For each content type, you must enable public API access:

1. Go to **Settings → Users & Permissions Plugin → Roles → Public**
2. Enable the following permissions for each collection type:
   - ✅ **find** (List all items)
   - ✅ **findOne** (Get single item)
3. For single types (Homepage, Contact):
   - ✅ **find** (Get the single item)

### API Endpoint Summary

| Content Type | Endpoint | Method | Query Params |
|--------------|----------|--------|--------------|
| Homepage | `/api/homepage?populate=*` | GET | `populate=*` |
| News | `/api/news?populate=*` | GET | `populate=*`, `filters[slug][$eq]={slug}` |
| Events | `/api/events?populate=*` | GET | `populate=*`, `filters[slug][$eq]={slug}`, `filters[eventDate][$gte]={date}` |
| Gallery | `/api/galleries?populate=*` | GET | `populate=*` |
| Notifications | `/api/notifications?populate=*` | GET | `populate=*` |
| Policies | `/api/policies?populate=*` | GET | `populate=*`, `filters[slug][$eq]={slug}`, `filters[category][$eq]={category}` |
| Contact | `/api/contact?populate=*` | GET | `populate=*` |
| Contact Info | `/api/contact-infos?populate=*&sort[0]=order:asc` | GET | `populate=*`, `sort[0]=order:asc` |
| RWA | `/api/rwas?populate=*&sort[0]=order:asc` | GET | `populate=*`, `sort[0]=order:asc` |
| Advertisements | `/api/advertisements?populate=*` | GET | `populate=*`, `filters[category][$eq]={category}`, `filters[id][$eq]={id}` |

**Important Notes:**
- Always use `?populate=*` to include related media (images, files) in the response
- Sort parameters use Strapi v4/v5 syntax: `sort[0]=fieldName:asc` or `sort[0]=fieldName:desc`
- Filter parameters use Strapi v4/v5 syntax: `filters[fieldName][$eq]=value`

---

## Setup Instructions

### Step 1: Install Strapi

```bash
npx create-strapi-app@latest greenwood-city-strapi --quickstart
```

Or for production with PostgreSQL:

```bash
npx create-strapi-app@latest greenwood-city-strapi
# Select PostgreSQL during setup
```

### Step 2: Create Admin User

1. Start Strapi: `npm run develop`
2. Visit `http://localhost:1337/admin`
3. Create your first admin user

### Step 3: Create Content Types

Follow the schemas provided above. Use **Content-Type Builder** in Strapi admin:

1. Go to **Content-Type Builder**
2. Click **Create new collection type** or **Create new single type**
3. Enter the API name and display name
4. Add fields as specified in the schema tables above
5. Click **Save**

### Step 4: Configure Permissions

1. Go to **Settings → Users & Permissions Plugin → Roles → Public**
2. Enable **find** and **findOne** for all collection types
3. Enable **find** for single types (Homepage, Contact)
4. Click **Save**

### Step 5: Populate Initial Content

1. Go to **Content Manager**
2. For each content type, click **Create new entry**
3. Fill in the required fields
4. Click **Publish** (important: content must be published to be accessible via API)

### Step 6: Test API Endpoints

Test each endpoint to ensure data is accessible:

```bash
# Example: Test news endpoint
curl http://localhost:1337/api/news?populate=*

# Example: Test homepage endpoint
curl http://localhost:1337/api/homepage?populate=*
```

### Step 7: Configure Frontend

Add to `.env.local` in the Next.js project:

```env
STRAPI_URL=http://localhost:1337
# Or for production:
# STRAPI_URL=https://your-strapi-instance.com
```

---

## Content Entry Guidelines

### Image Guidelines

- **Supported formats:** JPG, PNG, WebP
- **Recommended sizes:**
  - News/Event cover images: 1200x630px (2:1 ratio)
  - Gallery images: 1920x1080px (16:9 ratio) or larger
  - Profile photos (RWA members): 800x800px (1:1 ratio)
  - Advertisement images: 1200x800px (3:2 ratio)
- **File size:** Keep under 2MB per image
- **Naming:** Use descriptive, lowercase filenames with hyphens (e.g., `summer-festival-2024.jpg`)

### Text Content Guidelines

- **Short text fields:** Keep under 200 characters
- **Long text fields:** Can be multiple paragraphs
- **Rich text fields:** Use HTML formatting (Strapi's rich text editor)
  - Use headings (`<h1>`, `<h2>`, `<h3>`)
  - Use paragraphs (`<p>`)
  - Use lists (`<ul>`, `<ol>`, `<li>`)
  - Use bold (`<strong>`) and italic (`<em>`)
  - Use links (`<a href="...">`)

### Date/Time Guidelines

- **Format:** ISO 8601 (e.g., `2024-12-15T18:00:00Z`)
- **Timezone:** Use UTC or local time as appropriate
- **Date fields:** Use full date-time even if only date is needed

### Slug Guidelines

- **Auto-generated:** Slugs are typically auto-generated from titles
- **Format:** Lowercase, hyphens instead of spaces
- **Example:** "Community Meeting" → `community-meeting`
- **Uniqueness:** Ensure slugs are unique within each collection

### Category Guidelines

For content types that use categories:

- **News Categories:** Announcements, Events, General, Urgent
- **Policy Categories:** Resident Guidelines, Parking Rules, Building Regulations, General
- **Advertisement Categories:** Health & Fitness, Food & Dining, Home Services, Education, Pet Services, Other

### Publishing

⚠️ **IMPORTANT:** Content must be **Published** to be accessible via the public API. Draft content will not appear on the website.

1. After creating/editing content, click **Save** or **Save draft**
2. Click **Publish** to make it live
3. For updates, click **Save** then **Publish** again

---

## Troubleshooting

### Content Not Appearing

1. **Check if content is published:** Draft content doesn't appear via API
2. **Check API permissions:** Ensure Public role has `find` and `findOne` enabled
3. **Check populate parameter:** Ensure `?populate=*` is included in API calls
4. **Check Strapi URL:** Verify `STRAPI_URL` environment variable is set correctly

### Images Not Loading

1. **Check media permissions:** Ensure Public role can access media
2. **Check image URLs:** Verify images are uploaded and have valid URLs
3. **Check populate parameter:** Media fields must be populated with `?populate=*`

### API Errors

1. **404 Not Found:** Check that content type API name matches exactly (case-sensitive)
2. **403 Forbidden:** Check Public role permissions
3. **500 Internal Server Error:** Check Strapi server logs

### Frontend Not Using Strapi

1. **Check environment variable:** Ensure `STRAPI_URL` is set in `.env.local`
2. **Restart development server:** After setting environment variables, restart the Next.js server
3. **Check console logs:** Look for API call errors in browser console or terminal

---

## Additional Notes

### Strapi Version Compatibility

The frontend supports both Strapi v4 and v5. The API functions automatically detect the response structure and handle both formats.

### Media URLs

Image URLs are automatically constructed:
- If URL starts with `http://` or `https://`, it's used as-is
- Otherwise, it's prefixed with `STRAPI_URL`

Example:
- Strapi returns: `/uploads/image.jpg`
- Frontend uses: `http://localhost:1337/uploads/image.jpg`

### Rich Text Content

Rich text fields from Strapi are rendered as HTML. The frontend component (`RichTextContent`) handles:
- Paragraphs
- Headings (h1-h6)
- Lists (ul, ol)
- Links
- Images
- Bold, italic, blockquotes

### Sorting and Filtering

The frontend handles sorting and filtering:
- News: Sorted by `publishedAt` descending
- Events: Sorted by `eventDate` ascending (upcoming first)
- Gallery: Sorted by `createdAt` descending
- Policies: Sorted by `updatedAt` descending
- RWA Members: Sorted by `order` ascending
- Contact Info: Sorted by `order` ascending
- Advertisements: Sorted by `publishedAt` descending

---

## Support

For issues or questions regarding Strapi setup, refer to:
- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Community](https://forum.strapi.io/)
- Project documentation in `README.md` and other `.md` files

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**For:** Greenwood City Block C Website

