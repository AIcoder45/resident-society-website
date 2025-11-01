# Quick Start: Strapi Setup for Greenwood City

## Step-by-Step Setup (15 minutes)

### 1. Install Strapi (5 min)

```bash
# Go to parent directory
cd ..

# Create Strapi project
npx create-strapi-app@latest greenwood-city-strapi --quickstart

# Wait for installation to complete
```

### 2. Start Strapi & Create Admin User (2 min)

```bash
cd greenwood-city-strapi
npm run develop
```

- Visit `http://localhost:1337/admin`
- Create your admin account
- Login to Strapi admin panel

### 3. Create Content Types (5 min)

Follow the detailed guide in `STRAPI_SETUP.md` OR use the Strapi CLI:

**For each content type:**
1. Go to **Content-Type Builder**
2. Click **Create new collection type**
3. Add fields as specified in `STRAPI_SETUP.md`

**Quick Field Reference:**

- **News**: title (Text), slug (UID), shortDescription (Text Long), content (Rich text), image (Media), category (Text), publishedAt (Date)
- **Event**: title, slug, description, eventDate (DateTime), location, coverImage (Media), gallery (Media Multiple)
- **Gallery**: title, description, images (Media Multiple), event (Relation)
- **Notification**: title, message, priority (Enum: normal/urgent), expiryDate (Date)
- **Policy**: title, description, file (Media Files), category

### 4. Configure Permissions (2 min)

1. Settings → Users & Permissions Plugin → Roles → Public
2. Enable `find` and `findOne` for all collection types
3. Save

### 5. Connect Next.js to Strapi (1 min)

```bash
# In your Next.js project root
echo "STRAPI_URL=http://localhost:1337" > .env.local
```

### 6. Test It! (1 min)

```bash
# Terminal 1: Keep Strapi running
# Terminal 2: Start Next.js
cd greenwood-city  # or your project folder
npm run dev
```

Visit `http://localhost:3000` - content should load from Strapi!

---

## Adding Your First Content

1. In Strapi admin, go to **Content Manager**
2. Select a collection (e.g., **News**)
3. Click **Create new entry**
4. Fill in the fields
5. Click **Save** then **Publish**

Your content will appear on the website automatically!

---

## Deploying Strapi

### Option 1: Render.com (Recommended)

1. Push Strapi code to GitHub
2. Go to [Render.com](https://render.com)
3. **New** → **Web Service**
4. Connect GitHub repo
5. Build: `npm install`
6. Start: `npm start`
7. Add PostgreSQL database
8. Deploy!

### Option 2: Railway

1. Push to GitHub
2. Go to [Railway.app](https://railway.app)
3. **New Project** → **Deploy from GitHub**
4. Add PostgreSQL service
5. Deploy!

---

## Update Production Environment

After deploying Strapi, update your Next.js environment:

**For Vercel/Netlify:**
- Settings → Environment Variables
- Add: `STRAPI_URL` = `https://your-strapi-url.com`

**For local `.env.local`:**
```
STRAPI_URL=https://your-strapi-instance.onrender.com
```

---

## Troubleshooting

**"Failed to fetch" error?**
- Check Strapi is running on port 1337
- Verify `STRAPI_URL` in `.env.local`
- Check API permissions in Strapi

**Content not showing?**
- Make sure entries are **Published** (not just saved)
- Check collection type name matches (news, event, etc.)
- Verify permissions are enabled for Public role

**Images not loading?**
- Images are automatically handled by the API
- Check image is uploaded in Strapi
- Verify media permissions

---

## Next Steps

✅ Content is now managed via Strapi!
✅ Non-technical users can update content
✅ No need to edit JSON files
✅ Images managed through Strapi media library

**See [STRAPI_SETUP.md](./STRAPI_SETUP.md) for detailed configuration.**
