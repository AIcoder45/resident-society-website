# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Images** (Optional)
   Place your images in the following directories:
   - `public/images/news/` - News article images
   - `public/images/events/` - Event cover images
   - `public/images/gallery/` - Gallery photos

   For development, you can use placeholder images or update the image paths in the JSON files.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Content Management

### Current Setup (JSON Files)
Content is stored in JSON files in `src/data/`:
- `news.json` - News articles
- `events.json` - Community events
- `gallery.json` - Photo galleries
- `notifications.json` - Notifications/announcements
- `policies.json` - Policy documents

### Migrating to Strapi
To switch from JSON files to Strapi:

1. Set up your Strapi instance
2. Update `src/lib/api.ts` - Replace JSON imports with Strapi API calls
3. Update environment variables in `.env.local` (or `.env`):
   ```
   STRAPI_URL=https://your-strapi-instance.com
   ```
   
   **Note**: Both `.env` and `.env.local` work. `.env.local` is recommended (Next.js convention).

Example API call in `src/lib/api.ts`:
```typescript
export async function getNews(limit?: number): Promise<News[]> {
  const res = await fetch(`${process.env.STRAPI_URL}/api/news?populate=*`);
  const { data } = await res.json();
  let news = data.map((item: any) => ({
    id: item.id,
    ...item.attributes,
  }));
  
  if (limit) news = news.slice(0, limit);
  return news;
}
```

## Customization

### Colors
Update colors in `tailwind.config.ts`:
- Primary: `#0A3D62`
- Background: `#F5F6FA`
- Text: `#2F3640`

### Typography
Font is configured in `src/app/layout.tsx` using Inter from Google Fonts.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
│   ├── page.tsx      # Home page
│   ├── news/         # News pages
│   ├── events/       # Events pages
│   ├── gallery/      # Gallery page
│   ├── notifications/ # Notifications page
│   ├── policies/     # Policies page
│   └── contact/      # Contact page
├── components/       # React components
│   ├── ui/          # Shadcn UI components
│   ├── shared/      # Reusable components
│   └── layout/      # Layout components
├── lib/             # Utilities and API functions
├── data/            # JSON content files
├── types/           # TypeScript definitions
└── styles/          # Global styles
```

## Features

✅ Responsive design (mobile-first)
✅ SEO optimized (meta tags, structured data)
✅ Accessible (WCAG compliant)
✅ Framer Motion animations
✅ Breadcrumb navigation
✅ Image optimization (Next.js Image)
✅ Type-safe (TypeScript)
✅ Modular component structure

