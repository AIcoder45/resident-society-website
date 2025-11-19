# Resolving Git Merge Conflict with .env.production

## Problem
Git is preventing a pull because local changes to `.env.production` would be overwritten.

## Solution

### Step 1: On Production Server - Stash Your Local Changes

Since `.env.production` contains your production configuration, you should stash it to preserve it:

```bash
cd /var/www/greenwood-city

# Stash the local changes (this saves them temporarily)
git stash push -m "Save production env config" .env.production

# Now pull the latest changes
git pull origin main

# Restore your stashed .env.production file
git stash pop
```

### Alternative: If You Want to Discard Local Changes

**⚠️ WARNING: Only do this if you're sure your local .env.production changes aren't needed!**

```bash
cd /var/www/greenwood-city

# Discard local changes to .env.production
git checkout -- .env.production

# Now pull the latest changes
git pull origin main
```

### Step 2: Remove .env.production from Git Tracking (One-Time Fix)

After pulling, you need to remove `.env.production` from Git tracking (but keep the local file):

```bash
cd /var/www/greenwood-city

# Remove from Git tracking but keep the local file
git rm --cached .env.production

# Commit this change
git commit -m "Remove .env.production from Git tracking"

# Push to remote
git push origin main
```

**Note:** The `.gitignore` file has been updated to ignore `.env.production` going forward, so this won't happen again.

### Step 3: Verify Your .env.production is Still Intact

After resolving the conflict, verify your production environment variables are still correct:

```bash
cd /var/www/greenwood-city

# Check that .env.production exists and has your values
cat .env.production | grep STRAPI_URL

# Restart PM2 to ensure environment variables are loaded
pm2 restart greenwood-city --update-env

# Verify PM2 has the environment variables
pm2 env 0 | grep STRAPI_URL
```

## Why This Happened

- `.env.production` was accidentally tracked in Git
- The file contains production-specific configuration that shouldn't be in version control
- `.gitignore` has now been updated to prevent this in the future

## Prevention

The `.gitignore` file has been updated to ignore:
- `.env.production`
- `.env.local`
- `.env*.local`
- All other environment files

This ensures environment files won't be accidentally committed in the future.

