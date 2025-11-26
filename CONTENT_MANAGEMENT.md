# Content Management Guide

This guide explains how to manage content for the Greenwood City website. You have two options:

## Option 1: JSON Files (Current Setup) ✅

The website currently uses JSON files stored in `src/data/` for content management. This is simple and works well for smaller sites.

### Adding New Content

#### 📰 Adding News Articles

Edit `src/data/news.json`:

```json
{
  "id": "6",
  "title": "Your News Title",
  "slug": "your-news-slug",
  "shortDescription": "Brief description shown in cards",
  "content": "Full article content here. Use \\n for line breaks.",
  "image": "/images/news/your-image.jpg",
  "category": "Announcements",
  "publishedAt": "2024-03-01T10:00:00Z"
}
```

**Important:**
- `id` must be unique
- `slug` should be URL-friendly (lowercase, hyphens)
- `publishedAt` format: `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601)
- Image path: Place images in `public/images/news/`

#### 📅 Adding Events

Edit `src/data/events.json`:

```json
{
  "id": "6",
  "title": "Community BBQ",
  "slug": "community-bbq",
  "description": "Join us for a fun-filled community barbecue!",
  "eventDate": "2024-04-15T18:00:00Z",
  "location": "Community Park",
  "coverImage": "/images/events/bbq.jpg",
  "gallery": []
}
```

#### 🖼️ Adding Gallery Items

Edit `src/data/gallery.json`:

```json
{
  "id": "5",
  "title": "Spring Festival 2024",
  "description": "Celebrating spring with our community",
  "images": [
    "/images/gallery/spring-1.jpg",
    "/images/gallery/spring-2.jpg",
    "/images/gallery/spring-3.jpg"
  ],
  "eventId": null,
  "createdAt": "2024-03-20T14:00:00Z"
}
```

#### 🔔 Adding Notifications

Edit `src/data/notifications.json`:

```json
{
  "id": "5",
  "title": "Parking Lot Maintenance",
  "message": "Parking lot will be repaved next week. Please use alternative parking.",
  "priority": "normal",
  "expiryDate": "2024-04-01T00:00:00Z",
  "createdAt": "2024-03-25T09:00:00Z"
}
```

**Priority options:** `"normal"` or `"urgent"`
- Urgent notifications are highlighted in red
- Notifications automatically hide after `expiryDate`

#### 📄 Adding Policies

Edit `src/data/policies.json`:

```json
{
  "id": "7",
  "title": "New Waste Management Policy",
  "description": "Updated guidelines for waste segregation and disposal.",
  "file": "/documents/waste-management-policy.pdf",
  "category": "Rules & Regulations",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

### Managing Images

1. **Upload Images** to `public/images/`:
   ```
   public/
   ├── images/
   │   ├── news/
   │   ├── events/
   │   └── gallery/
   ```

2. **Update JSON** with the image path:
   ```json
   "image": "/images/news/my-image.jpg"
   ```

3. **Optimize Images**: Use tools like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/) to compress images for faster loading.

### Managing PDFs (Policies)

1. Upload PDFs to `public/documents/`
2. Reference in JSON:
   ```json
   "file": "/documents/policy-name.pdf"
   ```

### Best Practices

✅ **Do:**
- Keep JSON files valid (use a JSON validator)
- Use descriptive slugs
- Add images before publishing
- Set appropriate expiry dates for notifications
- Use ISO 8601 date format

❌ **Don't:**
- Use special characters in slugs
- Forget trailing commas in JSON
- Use very large images (optimize first)
- Leave expired notifications (they auto-hide but still in JSON)

---

## Option 2: Strapi CMS (Recommended for Production) 🚀

For better content management with a visual admin panel, migrate to Strapi.

### Setting Up Strapi

1. **Install Strapi** (in a separate directory):
   ```bash
   npx create-strapi-app@latest my-strapi-backend
   ```

2. **Create Content Types** in Strapi Admin:

   **News Collection Type:**
   - `title` (Text, Short text)
   - `slug` (UID, based on title)
   - `shortDescription` (Text, Long text)
   - `content` (Rich text)
   - `image` (Media, Single media)
   - `category` (Text, Short text)
   - `publishedAt` (Date, Date)

   **Events Collection Type:**
   - `title` (Text)
   - `slug` (UID)
   - `description` (Text, Long text)
   - `eventDate` (Date, DateTime)
   - `location` (Text)
   - `coverImage` (Media)
   - `gallery` (Media, Multiple media)

   **Gallery Collection Type:**
   - `title` (Text)
   - `description` (Text, Long text)
   - `images` (Media, Multiple media)
   - `createdAt` (Date, automatically managed)

   **Notifications Collection Type:**
   - `title` (Text)
   - `message` (Text, Long text)
   - `priority` (Enumeration: normal, urgent)
   - `expiryDate` (Date)
   - `createdAt` (Date, automatically managed)

   **Policies Collection Type:**
   - `title` (Text)
   - `description` (Text, Long text)
   - `file` (Media)
   - `category` (Text)
   - `updatedAt` (Date, automatically managed)

3. **Configure API Permissions:**
   - Go to Settings → Users & Permissions Plugin → Roles → Public
   - Enable `find` and `findOne` for all content types

4. **Deploy Strapi:**
   - Deploy to Render, Railway, or DigitalOcean
   - Set `STRAPI_URL` environment variable

### Migrating Frontend to Strapi

1. **Update Environment Variables** (`.env.local`):
   ```env
   STRAPI_URL=https://your-strapi-instance.com
   ```

2. **Update API Functions** (`src/lib/api.ts`):

   Replace this:
   ```typescript
   export async function getNews(limit?: number): Promise<News[]> {
     const newsData = await import("@/data/news.json");
     return newsData.default as News[];
   }
   ```

   With this:
   ```typescript
   export async function getNews(limit?: number): Promise<News[]> {
     const res = await fetch(
       `${process.env.STRAPI_URL}/api/news?populate=*&sort=publishedAt:desc`,
       { next: { revalidate: 60 } } // ISR: revalidate every 60 seconds
     );
     
     if (!res.ok) {
       throw new Error('Failed to fetch news');
     }
     
     const { data } = await res.json();
     
     // Transform Strapi data format to our format
     let news = data.map((item: any) => ({
       id: item.id.toString(),
       title: item.attributes.title,
       slug: item.attributes.slug,
       shortDescription: item.attributes.shortDescription,
       content: item.attributes.content,
       image: item.attributes.image?.data?.attributes?.url || null,
       category: item.attributes.category,
       publishedAt: item.attributes.publishedAt,
     }));

     // Handle image URL (if Strapi returns relative paths)
     if (process.env.STRAPI_URL) {
       news = news.map(item => ({
         ...item,
         image: item.image ? `${process.env.STRAPI_URL}${item.image}` : null,
       }));
     }

     return limit ? news.slice(0, limit) : news;
   }
   ```

3. **Repeat for other content types** (Events, Gallery, Notifications, Policies)

### Strapi API Examples

**Get All News:**
```
GET /api/news?populate=*
```

**Get Single News:**
```
GET /api/news?filters[slug][$eq]=your-slug&populate=*
```

**Get Upcoming Events:**
```
GET /api/events?filters[eventDate][$gte]=2024-03-01&populate=*&sort=eventDate:asc
```

---

## Quick Reference

### Date Format
Always use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `"2024-03-15T18:00:00Z"`
- Current time generator: `new Date().toISOString()`

### Slug Format
- Use lowercase
- Replace spaces with hyphens
- No special characters
- Example: `"annual-general-meeting-2024"`

### Image Requirements
- Recommended size: 1200x800px for news/events
- File format: JPG or PNG
- Max file size: 500KB (optimized)
- Aspect ratio: 3:2 for consistency

### Category Options

**News Categories:**
- Announcements
- Infrastructure
- Community
- Security
- Sustainability
- General

**Policy Categories:**
- Rules & Regulations
- Policies
- Security
- Maintenance

---

## Content Workflow

### Publishing a News Article:

1. Write content
2. Create/edit JSON entry in `src/data/news.json`
3. Add/optimize image → `public/images/news/`
4. Update slug and dates
5. Test locally: `npm run dev`
6. Build and deploy: `npm run build`

### Publishing an Event:

1. Create event entry in `src/data/events.json`
2. Add cover image
3. Set event date (future dates = upcoming)
4. Update event description
5. Deploy

### Adding Notification:

1. Edit `src/data/notifications.json`
2. Set priority (urgent or normal)
3. Set expiry date (optional)
4. Save - notifications auto-hide when expired

---

## Troubleshooting

**Images not showing?**
- Check path starts with `/` (e.g., `/images/...`)
- Verify file exists in `public/images/`
- Clear browser cache

**JSON errors?**
- Validate JSON syntax (use [JSONLint](https://jsonlint.com/))
- Check for trailing commas
- Ensure all strings are in quotes

**Strapi not returning data?**
- Check API permissions in Strapi admin
- Verify `STRAPI_URL` environment variable
- Check network tab for API errors
- Ensure `populate=*` is in the query

---

## Need Help?

- **JSON Setup**: Edit files in `src/data/`
- **Strapi Setup**: Follow migration guide above
- **Images**: Use `public/images/` directory
- **Questions**: Check component types in `src/types/index.ts`



