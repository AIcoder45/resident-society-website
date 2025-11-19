/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "admin.greenwoodscity.in"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "https",
        hostname: "admin.greenwoodscity.in",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimize images for mobile
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Security headers and PWA configuration
  async headers() {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // Build CSP directives
    const cspDirectives = [
      "default-src 'self'",
      // Next.js requires unsafe-inline for hydration scripts
      // unsafe-eval is only needed in development for React Fast Refresh
      isDevelopment
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind inline styles + Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:", // Google Fonts + data URIs for font loading
      "img-src 'self' data: blob: http://admin.greenwoodscity.in https://admin.greenwoodscity.in http://localhost:1337 https:", // Images from Strapi (HTTP/HTTPS) and HTTPS sources
      "connect-src 'self' http://admin.greenwoodscity.in https://admin.greenwoodscity.in http://localhost:1337 https:", // API connections to Strapi (HTTP/HTTPS)
      "worker-src 'self' blob:", // Service worker
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Cache static chunks with versioning
        source: "/_next/static/chunks/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Don't cache HTML
        source: "/:path*.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
