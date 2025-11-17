# Push Notifications - Keys & Tokens Guide

This document clarifies which keys need to be generated and where they come from.

---

## 🔑 **Keys Overview**

### Keys Generated ONCE (Using `web-push` command)
These are **NOT** generated in Next.js or Strapi - they're generated on your local machine and used by Next.js:

1. **VAPID_PUBLIC_KEY** ✅ Generated locally
2. **VAPID_PRIVATE_KEY** ✅ Generated locally  
3. **VAPID_EMAIL** ✅ You provide (your email)

### Keys/Tokens from Strapi
These come from your Strapi backend:

1. **STRAPI_API_TOKEN** ✅ Generated in Strapi Admin
2. **STRAPI_URL** ✅ Your Strapi backend URL (not a key)

---

## 📝 **Step-by-Step Guide**

### Step 1: Generate VAPID Keys (Do This ONCE)

**Where**: On your local machine (not in Next.js or Strapi)

**Command**:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Output Example**:
```
Public Key: BLx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**What You Get**:
- ✅ **Public Key** → Use for `VAPID_PUBLIC_KEY` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- ✅ **Private Key** → Use for `VAPID_PRIVATE_KEY`
- ✅ **Email** → You provide: `mailto:your-email@example.com`

**Important**: 
- Generate these keys **ONCE** on your local machine
- Keep them **secret** (especially private key)
- Use the **same keys** for all environments (dev, staging, production)

---

### Step 2: Get Strapi API Token

**Where**: Strapi Admin Panel

**Steps**:
1. Go to Strapi Admin → **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Configure:
   - **Name**: `Push Notifications Token` (or any name)
   - **Token duration**: `Unlimited` (or set expiry)
   - **Token type**: `Full access` (or customize permissions)
4. Click **Save**
5. **Copy the token** (you'll only see it once!)

**Token Format**:
```
Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
or just the token value:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Use for**: `STRAPI_API_TOKEN` in `.env.local`

---

### Step 3: Strapi URL

**Where**: Your Strapi backend URL

**Examples**:
- **Local**: `http://localhost:1337`
- **Production**: `https://your-strapi-domain.com`

**Use for**: `STRAPI_URL` in `.env.local`

---

## 📋 **Environment Variables Breakdown**

### `.env.local` File:

```env
# ============================================
# VAPID KEYS (Generated ONCE using web-push)
# ============================================
# These are generated on your local machine using:
# web-push generate-vapid-keys
VAPID_PUBLIC_KEY=BLx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# Your email (you provide this)
VAPID_EMAIL=mailto:your-email@example.com

# Public key for client-side (same as VAPID_PUBLIC_KEY)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# STRAPI CONFIGURATION (From Strapi Admin)
# ============================================
# Your Strapi backend URL
STRAPI_URL=http://localhost:1337

# API Token from Strapi Admin → Settings → API Tokens
STRAPI_API_TOKEN=your-strapi-api-token-here
```

---

## 🔍 **Key Sources Summary**

| Environment Variable | Where It Comes From | How to Get It |
|----------------------|---------------------|---------------|
| `VAPID_PUBLIC_KEY` | Generated locally | `web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Generated locally | `web-push generate-vapid-keys` |
| `VAPID_EMAIL` | You provide | Your email address |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Generated locally | Same as `VAPID_PUBLIC_KEY` |
| `STRAPI_URL` | Your Strapi backend | Your Strapi URL |
| `STRAPI_API_TOKEN` | Strapi Admin | Settings → API Tokens → Create |

---

## 🎯 **Quick Setup Checklist**

### ✅ Generate VAPID Keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```
**Copy**: Public Key and Private Key

### ✅ Get Strapi API Token:
1. Strapi Admin → Settings → API Tokens
2. Create new token
3. Copy token

### ✅ Configure `.env.local`:
```env
# VAPID Keys (from web-push command)
VAPID_PUBLIC_KEY=your-public-key-from-web-push
VAPID_PRIVATE_KEY=your-private-key-from-web-push
VAPID_EMAIL=mailto:your-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-from-web-push

# Strapi (from Strapi Admin)
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-from-strapi-admin
```

---

## 🔐 **Security Notes**

### VAPID Keys:
- ✅ **Public Key**: Can be exposed (used in client-side code)
- 🔒 **Private Key**: **KEEP SECRET** - Never commit to Git
- ✅ Use same keys for all environments (dev, staging, production)

### Strapi API Token:
- 🔒 **Keep Secret** - Never commit to Git
- ✅ Use `.env.local` (already in `.gitignore`)
- ✅ Create separate tokens for different environments if needed

---

## 📚 **Example Values**

### VAPID Keys (Example):
```env
VAPID_PUBLIC_KEY=BLx-8KzVZyF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5
VAPID_PRIVATE_KEY=8KzVZyF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGh
VAPID_EMAIL=mailto:notifications@greenwoodcity.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLx-8KzVZyF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5F3VxGhF5
```

### Strapi (Example):
```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=Bearer abc123def456ghi789jkl012mno345pqr678stu901vwx234yzab567cdef
```

---

## ❓ **FAQ**

### Q: Do I generate VAPID keys in Next.js or Strapi?
**A**: Neither! Generate them on your local machine using `web-push generate-vapid-keys` command.

### Q: Where do I get STRAPI_API_TOKEN?
**A**: From Strapi Admin → Settings → API Tokens → Create new token

### Q: Can I use the same VAPID keys for all environments?
**A**: Yes! Generate once and use everywhere.

### Q: Do I need different keys for development and production?
**A**: No, VAPID keys can be the same. But use different Strapi API tokens if needed.

### Q: What if I lose my VAPID keys?
**A**: Just generate new ones using `web-push generate-vapid-keys`. Users will need to re-subscribe.

### Q: Where do I put the VAPID keys?
**A**: In `.env.local` file in your Next.js project root.

---

## ✅ **Summary**

**Generate Locally (Once)**:
- ✅ VAPID Public Key
- ✅ VAPID Private Key
- ✅ VAPID Email (you provide)

**From Strapi Admin**:
- ✅ STRAPI_API_TOKEN (create in Settings → API Tokens)
- ✅ STRAPI_URL (your Strapi backend URL)

**All go in `.env.local`** in your Next.js project! 🎯

