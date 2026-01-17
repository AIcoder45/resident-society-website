#!/usr/bin/env node

/**
 * Script to diagnose Open Graph image issues
 */

console.log('\n🔍 DIAGNOSING OPEN GRAPH IMAGE ISSUES\n');
console.log('='.repeat(70));

// Check 1: Site URL Configuration
console.log('\n📝 Check #1: Site URL Configuration');
console.log('-----------------------------------');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in';
console.log('Site URL:', siteUrl);
console.log('✅ This URL will be used for absolute image paths');

// Check 2: Strapi Configuration  
console.log('\n📝 Check #2: Strapi Configuration');
console.log('-----------------------------------');
const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
console.log('Strapi URL:', strapiUrl);

if (strapiUrl.includes('admin.greenwoodscity.in')) {
  console.log('⚠️  WARNING: Using admin subdomain');
  console.log('   Social media platforms may not be able to access images from admin subdomain!');
  console.log('   Images need to be publicly accessible without authentication.');
} else {
  console.log('✅ Strapi URL looks good');
}

// Check 3: Common Issues
console.log('\n📝 Check #3: Common Image Issues');
console.log('-----------------------------------');

console.log('\n❌ ISSUE #1: Images from admin.greenwoodscity.in');
console.log('   Problem: Social platforms cannot access admin subdomains');
console.log('   Example: https://admin.greenwoodscity.in/uploads/image.jpg');
console.log('   Solution:');
console.log('   • Configure Strapi to use a public CDN (Cloudinary, AWS S3, etc.)');
console.log('   • Or make uploads folder publicly accessible');
console.log('   • Or use a different subdomain for uploads (e.g., cdn.greenwoodscity.in)');

console.log('\n❌ ISSUE #2: Relative Image Paths');
console.log('   Problem: /uploads/image.jpg becomes https://greenwoodscity.in/uploads/image.jpg');
console.log('   Solution: Already handled in code - converts to absolute URLs');

console.log('\n❌ ISSUE #3: Social Media Cache');
console.log('   Problem: Platforms cache OG tags for hours/days');
console.log('   Solution: Use Facebook Debugger to clear cache');
console.log('   URL: https://developers.facebook.com/tools/debug/');

console.log('\n❌ ISSUE #4: Missing NEXT_PUBLIC_SITE_URL in Production');
console.log('   Problem: Wrong base URL used for images');
console.log('   Solution: Set environment variable in production');
console.log('   Example: NEXT_PUBLIC_SITE_URL=https://greenwoodscity.in');

// Check 4: Testing Steps
console.log('\n📝 Check #4: How to Test');
console.log('-----------------------------------');
console.log('1. Visit: http://localhost:3000/debug-og');
console.log('2. Check if images load in the preview');
console.log('3. Click "Open in new tab" for each image');
console.log('4. If image loads in browser, it should work for social media');
console.log('5. If image does NOT load, that\'s your problem!');

// Check 5: Most Likely Issue
console.log('\n🎯 MOST LIKELY ISSUE:');
console.log('-----------------------------------');
console.log('Your images are hosted at: https://admin.greenwoodscity.in/uploads/...');
console.log('');
console.log('Social media platforms (Facebook, WhatsApp, Twitter) CANNOT access');
console.log('images from admin subdomains because:');
console.log('  • They may require authentication');
console.log('  • They may have CORS restrictions');
console.log('  • They may be blocked by robots.txt');
console.log('  • Admin subdomains are typically not public-facing');
console.log('');
console.log('SOLUTION:');
console.log('  1. Configure Strapi to use Cloudinary or AWS S3 for uploads');
console.log('  2. Or set up a public CDN subdomain (cdn.greenwoodscity.in)');
console.log('  3. Or make the /uploads folder publicly accessible');
console.log('');
console.log('Quick Test:');
console.log('  Open this URL in incognito browser:');
console.log('  https://admin.greenwoodscity.in/uploads/[any-image-path]');
console.log('  If it asks for login or shows 403/404, social media can\'t access it!');

// Check 6: Immediate Fix
console.log('\n🚀 IMMEDIATE FIX (Temporary):');
console.log('-----------------------------------');
console.log('While you configure proper CDN, you can:');
console.log('1. Upload images directly to /public/images/ folder in Next.js');
console.log('2. Update Strapi to reference: https://greenwoodscity.in/images/...');
console.log('3. This makes images publicly accessible immediately');
console.log('');
console.log('Example:');
console.log('  • Put image in: /public/images/news/my-image.jpg');
console.log('  • Strapi image URL: /images/news/my-image.jpg');
console.log('  • Final URL: https://greenwoodscity.in/images/news/my-image.jpg');
console.log('  • ✅ Social media can access this!');

console.log('\n' + '='.repeat(70));
console.log('\n📚 Next Steps:');
console.log('1. Run: npm run dev');
console.log('2. Visit: http://localhost:3000/debug-og');
console.log('3. Test if images load in the debug page');
console.log('4. Fix image accessibility issues');
console.log('5. Clear social media cache');
console.log('6. Test sharing again');
console.log('\n' + '='.repeat(70) + '\n');



