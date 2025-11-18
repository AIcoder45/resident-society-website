# Greenwood City Website

A modern, responsive website for Greenwood City built with Next.js 14, Tailwind CSS, and Shadcn UI.

## Features

- 🏠 Home page with latest news, events, and gallery highlights
- 📰 News section with detailed articles
- 📅 Events calendar and listings
- 🖼️ Gallery with image galleries
- 🔔 Notifications and announcements
- 📄 Policies and documents
- 📞 Contact page

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Typography**: Inter font
- **Content**: JSON/Markdown files (easily switchable to Strapi)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── lib/             # Utility functions and helpers
├── data/            # JSON content files
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Content Management

📖 **See [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) for content management options.**

🚀 **Strapi CMS Setup**: See [STRAPI_SETUP.md](./STRAPI_SETUP.md) for complete Strapi integration guide.

**Current Setup:**
- **Strapi Mode**: If `STRAPI_URL` is set in `.env.local` or `.env`, the app uses Strapi CMS
- **JSON Mode**: If `STRAPI_URL` is not set, the app uses JSON files from `src/data/`
- The app automatically detects which mode to use

**Quick Start (JSON Mode):**
- Content is stored in JSON files under `src/data/`
- Edit JSON files to add/update content
- Use the helper script: `node scripts/generate-content.js news "Your Title"`

**Quick Start (Strapi Mode):**
1. Set up Strapi (see STRAPI_SETUP.md)
2. Add `STRAPI_URL=http://localhost:1337` to `.env.local` (or `.env`)
3. Start Strapi and Next.js - content will load from Strapi automatically

**Note**: You can use either `.env` or `.env.local` - both work! `.env.local` is the Next.js convention and has higher priority if both exist.

## Build

```bash
npm run build
```

## License

MIT
