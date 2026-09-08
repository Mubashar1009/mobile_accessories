import type { NextConfig } from "next";

/**
 * Baseline security headers, applied to every route.
 *
 * No Content-Security-Policy is set here on purpose: a correct CSP for this
 * app needs a per-request nonce (Next injects inline bootstrap scripts, and
 * `app/layout.tsx` renders an inline `<Script>` for service-worker
 * registration), which a static header cannot express. Adding a
 * `'unsafe-inline'` CSP instead would read as protection while providing
 * approximately none. That belongs in `src/proxy.ts` with a nonce, and is
 * called out in the review notes rather than half-done here.
 */
const securityHeaders = [
  // Stop the browser from MIME-sniffing a response into a different type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking: nothing in this app is meant to be framed.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak the full URL (search terms, reset paths) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No feature of this app needs these; deny them by default.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HSTS. `preload` is intentionally omitted — submitting to the preload
  // list is effectively irreversible and is the site owner's call.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
