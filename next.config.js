/** @type {import('next').NextConfig} */

// Security headers applied to every response.
// CSP allows the assets we actually use (Unsplash, Cloudinary, Shopify, Stripe,
// Google fonts) and locks everything else down.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Block the page from being framed (clickjacking).
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Stop browsers from MIME-sniffing.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Don't leak the full URL on outbound clicks.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Lock down most browser APIs we don't use.
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
  {
    // Isolate the browsing context so a compromised third-party window
    // opened via target=_blank (or a rogue popup) can't reach back into
    // ours via window.opener. Defense-in-depth on top of the per-link
    // rel="noopener" attributes we already apply.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    // Modern XSS protection. Adjust the connect-src / img-src list when you
    // add a new third-party service (analytics, etc.).
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js dev needs 'unsafe-eval' for fast refresh; in prod we still
      // need 'unsafe-inline' for the runtime chunks. This is the safe set
      // recommended by Next.js' own docs.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com https://cdn.shopify.com https://picsum.photos https://*.stripe.com",
      "connect-src 'self' https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't leak the Next.js version in the response headers.
  poweredByHeader: false,
  // Always serve trailing-slash-free URLs.
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
