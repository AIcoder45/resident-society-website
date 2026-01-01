import { getNews, getEvents, getAdvertisements } from "@/lib/api";

export default async function DebugOGPage() {
  // Fetch sample data
  const news = await getNews(3);
  const events = await getEvents(3);
  const advertisements = await getAdvertisements(undefined, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://greenwoodscity.in';

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Open Graph Debug Tool</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">📝 Configuration</h2>
        <p><strong>Site URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{siteUrl}</code></p>
        <p className="mt-2 text-sm text-gray-600">
          This is the base URL used for Open Graph tags. Make sure it&apos;s set correctly in production!
        </p>
      </div>

      {/* News Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📰 News Articles</h2>
        {news.length === 0 ? (
          <p className="text-gray-500">No news articles found</p>
        ) : (
          <div className="space-y-4">
            {news.map((item) => {
              const pageUrl = `${siteUrl}/news/${item.slug}`;
              const imageUrl = item.image 
                ? item.image.startsWith('http') 
                  ? item.image 
                  : `${siteUrl}${item.image}`
                : `${siteUrl}/logo.png`;

              return (
                <div key={item.id} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    <div>
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      {item.image ? (
                        <div>
                          <img 
                            src={imageUrl} 
                            alt={item.title}
                            className="w-full h-40 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <p className="text-xs mt-1 break-all">
                            <strong>Original:</strong> <code className="bg-gray-100 px-1">{item.image}</code>
                          </p>
                          <p className="text-xs mt-1 break-all">
                            <strong>Absolute:</strong> <code className="bg-gray-100 px-1">{imageUrl}</code>
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500">❌ No image available</p>
                      )}
                    </div>

                    {/* OG Tags */}
                    <div>
                      <p className="text-sm font-medium mb-2">Open Graph Tags:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
{`<meta property="og:title" content="${item.title}" />
<meta property="og:description" content="${item.shortDescription}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:type" content="article" />`}
                      </pre>
                      <a 
                        href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(pageUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        🔍 Test on Facebook Debugger →
                      </a>
                    </div>
                  </div>

                  {/* Image Accessibility Test */}
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium mb-1">🌐 Image Accessibility Test:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Can social media platforms access this image?</span>
                      <a 
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open in new tab to test →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Events Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📅 Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No events found</p>
        ) : (
          <div className="space-y-4">
            {events.map((item) => {
              const pageUrl = `${siteUrl}/events/${item.slug}`;
              const imageUrl = item.coverImage 
                ? item.coverImage.startsWith('http') 
                  ? item.coverImage 
                  : `${siteUrl}${item.coverImage}`
                : `${siteUrl}/logo.png`;

              return (
                <div key={item.id} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      {item.coverImage ? (
                        <div>
                          <img 
                            src={imageUrl} 
                            alt={item.title}
                            className="w-full h-40 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <p className="text-xs mt-1 break-all">
                            <strong>Original:</strong> <code className="bg-gray-100 px-1">{item.coverImage}</code>
                          </p>
                          <p className="text-xs mt-1 break-all">
                            <strong>Absolute:</strong> <code className="bg-gray-100 px-1">{imageUrl}</code>
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500">❌ No image available</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Open Graph Tags:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
{`<meta property="og:title" content="${item.title}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:type" content="article" />`}
                      </pre>
                      <a 
                        href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(pageUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        🔍 Test on Facebook Debugger →
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium mb-1">🌐 Image Accessibility Test:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <a 
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open in new tab to test →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Advertisements Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📢 Advertisements</h2>
        {advertisements.length === 0 ? (
          <p className="text-gray-500">No advertisements found</p>
        ) : (
          <div className="space-y-4">
            {advertisements.map((item) => {
              const pageUrl = `${siteUrl}/advertisements/${item.id}`;
              const imageUrl = item.image 
                ? item.image.startsWith('http') 
                  ? item.image 
                  : `${siteUrl}${item.image}`
                : `${siteUrl}/logo.png`;

              return (
                <div key={item.id} className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      {item.image ? (
                        <div>
                          <img 
                            src={imageUrl} 
                            alt={item.title}
                            className="w-full h-40 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <p className="text-xs mt-1 break-all">
                            <strong>Original:</strong> <code className="bg-gray-100 px-1">{item.image}</code>
                          </p>
                          <p className="text-xs mt-1 break-all">
                            <strong>Absolute:</strong> <code className="bg-gray-100 px-1">{imageUrl}</code>
                          </p>
                        </div>
                      ) : (
                        <p className="text-red-500">❌ No image available</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Open Graph Tags:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
{`<meta property="og:title" content="${item.title}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:type" content="website" />`}
                      </pre>
                      <a 
                        href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(pageUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        🔍 Test on Facebook Debugger →
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium mb-1">🌐 Image Accessibility Test:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <a 
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open in new tab to test →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Troubleshooting Guide */}
      <section className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">🔧 Troubleshooting Guide</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <h3 className="font-semibold mb-2">❌ Common Issue #1: Images from admin.greenwoodscity.in not accessible</h3>
            <p className="text-sm mb-2">Social media platforms cannot access images from your Strapi admin subdomain.</p>
            <p className="text-sm font-semibold">Solution:</p>
            <ul className="text-sm list-disc list-inside ml-2 space-y-1">
              <li>Configure Strapi to use a public CDN (Cloudinary, S3, etc.)</li>
              <li>Or set up a public URL for Strapi uploads</li>
              <li>Make sure images are accessible without authentication</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h3 className="font-semibold mb-2">⚠️ Common Issue #2: Social media cache</h3>
            <p className="text-sm mb-2">Social platforms cache OG tags for several hours/days.</p>
            <p className="text-sm font-semibold">Solution:</p>
            <ul className="text-sm list-disc list-inside ml-2 space-y-1">
              <li>Use Facebook Debugger to clear cache: <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Tool</a></li>
              <li>Click &quot;Scrape Again&quot; button</li>
              <li>Wait 5-10 minutes and test again</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-semibold mb-2">ℹ️ Common Issue #3: Wrong site URL in production</h3>
            <p className="text-sm mb-2">NEXT_PUBLIC_SITE_URL might not be set correctly.</p>
            <p className="text-sm font-semibold">Solution:</p>
            <ul className="text-sm list-disc list-inside ml-2 space-y-1">
              <li>Set environment variable: NEXT_PUBLIC_SITE_URL=https://greenwoodscity.in</li>
              <li>Rebuild and redeploy your app</li>
              <li>Verify the URL at the top of this page</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h3 className="font-semibold mb-2">✅ How to test properly</h3>
            <ol className="text-sm list-decimal list-inside ml-2 space-y-1">
              <li>Click any &quot;Open in new tab&quot; link above to verify image loads</li>
              <li>If image loads in browser, click &quot;Test on Facebook Debugger&quot;</li>
              <li>In Facebook Debugger, check for errors</li>
              <li>If errors appear, image is not publicly accessible</li>
              <li>If no errors, click &quot;Scrape Again&quot; to clear cache</li>
              <li>Wait 5 minutes, then test sharing on WhatsApp</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

