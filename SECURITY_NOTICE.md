# 🚨 SECURITY NOTICE - Credentials Exposed

## Issue
The `.env.local` file containing sensitive credentials was accidentally committed to the repository in commits:
- `5c73dd3` (initial)
- `c7a5d5e` (fix)

## Exposed Credentials

The following sensitive keys were exposed:
- **VAPID_PRIVATE_KEY**: `TJfcNIiXGFraHL_iQlcTtmtC9UZQRdhJ6pwG9zIUmPk`
- **STRAPI_API_TOKEN**: `d3b1c47723bbfc0bfdf5c5b61e77af81d53a2c7b8619d3614b6f0c1cabc25b487aaf7ce0a07d0a0e0e7eac7ae7792fd4f23235df124728c64a50d433e96eb7426b369c611a6c9ff5d25c39d837b6e1466b8f2705153e495d230151b7f2e975f514eb4abae8d7b44a8096edbdaad6f0d258d5f5028b23cb6b998f3e256e6520d2`
- **NEXT_PUBLIC_VAPID_PUBLIC_KEY**: `BKgt0kNKFYZNn699HYu7qXUw8A05k54btnpBsJ0Pk8J2hUH4ksS-7PlsBDc0aqCWB6hnapxEXruHYt0qUYDHRC4`

## Immediate Actions Required

### 1. Revoke and Regenerate VAPID Keys

**VAPID keys are used for push notifications. These must be revoked immediately.**

Since VAPID keys are generated locally, you need to:
1. Generate new VAPID keys:
   ```bash
   npm install -g web-push
   web-push generate-vapid-keys
   ```
2. Update `.env.local` with new keys:
   ```env
   VAPID_PUBLIC_KEY=<new-public-key>
   VAPID_PRIVATE_KEY=<new-private-key>
   VAPID_EMAIL=mailto:info@greenwoodscity.in
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<new-public-key>
   ```
3. Update production environment variables on your VPS/server
4. **Important**: Users who have subscribed to push notifications will need to re-subscribe after keys are changed

### 2. Revoke and Regenerate Strapi API Token

**The Strapi API token provides full access to your CMS. This must be revoked immediately.**

1. Log into Strapi Admin: `https://admin.greenwoodscity.in/admin`
2. Go to Settings → API Tokens
3. Find the token ending in `...6520d2` and **DELETE IT**
4. Create a new API Token:
   - Name: `Production API Token`
   - Token type: `Full access` (or customize permissions)
   - Token duration: `Unlimited` (or set expiration)
5. Copy the new token and update `.env.local`:
   ```env
   STRAPI_API_TOKEN=<new-token>
   ```
6. Update production environment variables on your VPS/server:
   ```bash
   ssh root@31.97.232.51
   cd /var/www/greenwood-city
   nano .env.production  # Update STRAPI_API_TOKEN
   pm2 restart greenwood-city --update-env
   ```

### 3. Remove from Git History (Optional but Recommended)

**Warning**: This requires force push and should be coordinated with your team.

To completely remove `.env.local` from git history:

```bash
# Remove from git tracking (already done)
git rm --cached .env.local

# Remove from git history using BFG Repo-Cleaner (recommended)
# Or use git filter-branch (more complex)

# After cleaning history, force push (coordinate with team first!)
git push origin main --force
```

**Alternative**: If you can't rewrite history, at least ensure the file is removed from future commits:
- ✅ Already done: `git rm --cached .env.local`
- ✅ Already done: `.env.local` is in `.gitignore`

### 4. Verify Fix

```bash
# Verify .env.local is no longer tracked
git ls-files | grep .env.local
# Should return nothing

# Verify .gitignore includes .env.local
cat .gitignore | grep .env.local
# Should show .env.local
```

## Prevention

1. ✅ `.env.local` is now properly gitignored
2. ✅ File has been removed from git tracking
3. ⚠️ **Always verify** `.gitignore` includes environment files before committing
4. ⚠️ **Never commit** files containing secrets, even if they're in `.gitignore`
5. Consider using a pre-commit hook to prevent committing sensitive files

## Status

- [x] `.env.local` removed from git tracking
- [x] `.gitignore` verified to exclude `.env.local`
- [ ] VAPID keys revoked and regenerated
- [ ] Strapi API token revoked and regenerated
- [ ] Production environment variables updated
- [ ] Git history cleaned (optional)

---

**Created**: $(date)
**Severity**: 🔴 CRITICAL
**Action Required**: Immediate

