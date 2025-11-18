# Strapi CMS Setup Guide

This guide will help you set up Strapi CMS for the Greenwood City website.

## Prerequisites

- Node.js 18+ installed
- Basic terminal/command line knowledge
- A deployment account (Render, Railway, or DigitalOcean) for production

---

## Step 1: Install Strapi

Create a new directory for Strapi (outside your Next.js project):

```bash
# Navigate to your desired location (e.g., parent directory)
cd ..

# Create Strapi project
npx create-strapi-app@latest greenwood-city-strapi --quickstart

# Or for custom database setup:
npx create-strapi-app@latest greenwood-city-strapi
```

**Note:** The `--quickstart` flag uses SQLite (good for development). For production, use PostgreSQL.

---

## Step 2: Create Content Types in Strapi

After installation, start Strapi:
```bash
cd greenwood-city-strapi
npm run develop
```

Visit `http://localhost:1337/admin` and create your first admin user.

### 2.1 Create News Collection Type

1. Go to **Content-Type Builder** → **Create new collection type**
2. Name: `news` (display name: "News")
3. Add the following fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text (Short text) | Required |
| `slug` | UID | Required, Attached to: `title` |
| `shortDescription` | Text (Long text) | Required |
| `content` | Rich text | Required |
| `image` | Media | Single media, Type: Images only |
| `category` | Text (Short text) | Required, Default value: "Announcements" |
| `publishedAt` | Date | Required, Type: DateTime |

4. Click **Save**

### 2.2 Create Events Collection Type

1. **Content-Type Builder** → **Create new collection type**
2. Name: `event` (display name: "Event")
3. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text (Short text) | Required |
| `slug` | UID | Required, Attached to: `title` |
| `description` | Text (Long text) | Required |
| `eventDate` | Date | Required, Type: DateTime |
| `location` | Text (Short text) | Required |
| `coverImage` | Media | Single media, Type: Images only |
| `gallery` | Media | Multiple media, Type: Images only |

4. Click **Save**

### 2.3 Create Gallery Collection Type

1. **Content-Type Builder** → **Create new collection type**
2. Name: `gallery` (display name: "Gallery")
3. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text (Short text) | Required |
| `description` | Text (Long text) | Optional |
| `images` | Media | Multiple media, Type: Images only |
| `event` | Relation | Many-to-One relation with `event` | Optional |

4. Click **Save**

### 2.4 Create Notification Collection Type

1. **Content-Type Builder** → **Create new collection type**
2. Name: `notification` (display name: "Notification")
3. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text (Short text) | Required |
| `message` | Text (Long text) | Required |
| `priority` | Enumeration | Values: `normal`, `urgent` | Default: `normal` |
| `expiryDate` | Date | Optional, Type: DateTime |

4. Click **Save** (createdAt is automatic)

### 2.5 Create Policy Collection Type

1. **Content-Type Builder** → **Create new collection type**
2. Name: `policy` (display name: "Policy")
3. Add fields:

| Field Name | Type | Settings |
|------------|------|----------|
| `title` | Text (Short text) | Required |
| `description` | Text (Long text) | Required |
| `file` | Media | Single media, Type: Files only |
| `category` | Text (Short text) | Required |

4. Click **Save** (updatedAt is automatic)

---

## Step 3: Configure API Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click on **Public** role
3. Under **Permissions**, find each collection type:
   - **News**: Enable `find` and `findOne`
   - **Event**: Enable `find` and `findOne`
   - **Gallery**: Enable `find` and `findOne`
   - **Notification**: Enable `find` and `findOne`
   - **Policy**: Enable `find` and `findOne`
4. Click **Save**

---

## Step 4: Add Sample Content

1. Go to **Content Manager** → **News**
2. Click **Create new entry**
3. Fill in sample data:
   - Title: "Welcome to Greenwood City"
   - Slug: auto-generated
   - Short Description: "Sample news article"
   - Content: "Full article content..."
   - Category: "Announcements"
   - Published At: Current date
   - Image: Upload an image
4. Click **Save** then **Publish**

Repeat for Events, Gallery, Notifications, and Policies.

---

## Step 5: Configure Environment Variables

### Local Development

**Option 1: Using `.env.local` (Recommended)**

In your Next.js project root, create `.env.local`:

```env
# Strapi Local Development
STRAPI_URL=http://localhost:1337

# For production, use:
# STRAPI_URL=https://your-strapi-instance.com
```

**Option 2: Using `.env` (Also works)**

You can also use `.env` instead of `.env.local`:

```env
# Strapi Local Development
STRAPI_URL=http://localhost:1337
```

**Difference between `.env` and `.env.local`:**
- **`.env.local`**: Next.js convention, has higher priority, automatically gitignored
- **`.env`**: Works fine, but `.env.local` takes precedence if both exist
- **Both are gitignored** in this project, so either is safe for secrets
- **Recommendation**: Use `.env.local` for local development (Next.js best practice)

### Strapi Environment Variables

In your Strapi project, create `.env`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# For production with PostgreSQL:
# DATABASE_CLIENT=postgres
# DATABASE_HOST=your-db-host
# DATABASE_PORT=5432
# DATABASE_NAME=strapi
# DATABASE_USERNAME=your-username
# DATABASE_PASSWORD=your-password
```

**Generate secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 6: Update Next.js API Functions

The API functions have been updated in `src/lib/api.ts` to support Strapi. Make sure your `.env.local` has the `STRAPI_URL` set.

### Enable Strapi Mode

The API will automatically use Strapi if `STRAPI_URL` is set in environment variables.

---

## Step 7: Test Locally

1. **Start Strapi:**
   ```bash
   cd greenwood-city-strapi
   npm run develop
   ```

2. **Start Next.js:**
   ```bash
   cd greenwood-city
   npm run dev
   ```

3. Visit `http://localhost:3000` and verify content loads from Strapi

---

## Step 8: Deploy Strapi

### Option A: Render.com

1. Push Strapi code to GitHub
2. In Render dashboard:
   - **New** → **Web Service**
   - Connect your GitHub repository
   - Settings:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment: `Node`
   - Add environment variables (database, secrets)
   - Deploy

### Option B: Railway

1. Push to GitHub
2. In Railway:
   - **New Project** → **Deploy from GitHub**
   - Select repository
   - Add PostgreSQL service (if needed)
   - Add environment variables
   - Deploy

### Option C: DigitalOcean App Platform

1. Connect GitHub repository
2. Configure:
   - Build command: `npm install`
   - Run command: `npm start`
   - Add PostgreSQL database
   - Set environment variables

---

## Step 9: Update Production Environment

After deploying Strapi, update your Next.js `.env.local` (or Vercel/Netlify environment variables):

```env
STRAPI_URL=https://your-strapi-instance.onrender.com
```

Or for Vercel/Netlify:
- Go to **Settings** → **Environment Variables**
- Add: `STRAPI_URL` = `https://your-strapi-url.com`

---

## Step 10: Migrate Existing JSON Data (Optional)

If you have existing JSON data, you can import it:

1. Export your JSON files
2. Use Strapi's API or admin panel to import:
   - Manually create entries matching JSON structure
   - Or use Strapi's import plugin/migration scripts

**Quick migration script example** (`scripts/migrate-to-strapi.js`):

```javascript
// This would read JSON files and create Strapi entries via API
// See scripts/migrate-to-strapi.js for implementation
```

---

## Troubleshooting

### CORS Issues

If you see CORS errors, update Strapi's `config/middlewares.js`:

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'your-nextjs-domain.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'your-nextjs-domain.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### Image URLs

Strapi returns relative URLs. The API functions handle this automatically by prepending `STRAPI_URL` when needed.

### API Not Found

- Ensure collection types are **published** in Strapi
- Check API permissions are enabled for Public role
- Verify `STRAPI_URL` environment variable is set correctly

---

## Next Steps

- ✅ Content is now managed via Strapi admin panel
- ✅ Non-technical users can add/edit content easily
- ✅ Images are managed through Strapi's media library
- ✅ Content updates reflect immediately (with ISR)

## Support

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Discord](https://discord.strapi.io/)

