import { env } from "@/config/env";

/**
 * Host allowlist for `/api/proxy-image`.
 *
 * The route performs a *server-side* fetch of a client-supplied URL, which
 * is textbook SSRF territory: without a check, any visitor could aim it at
 * `http://169.254.169.254/…` (cloud instance metadata), `http://localhost:*`
 * (anything bound on the app server) or a private-range address, and read
 * the response body straight out of the HTTP response.
 *
 * The mitigation is an exact-host allowlist rather than a
 * "block private IPs" denylist: denylists lose to DNS rebinding, redirects,
 * IPv6-mapped addresses and decimal/octal IP encodings, whereas the set of
 * hosts this app legitimately proxies is small, known and static — the
 * Supabase Storage bucket the product images live in, plus the demo image
 * host. It intentionally mirrors `next.config.ts`'s `images.remotePatterns`,
 * which is the same allowlist for Next's own image optimizer.
 */
function buildAllowedHosts(): ReadonlySet<string> {
  const hosts = new Set<string>();

  // The project's own Supabase host, derived from config rather than
  // hardcoded, so a project swap doesn't silently break image loading.
  try {
    if (env.supabase.url) {
      hosts.add(new URL(env.supabase.url).hostname.toLowerCase());
    }
  } catch {
    // A malformed SUPABASE_URL simply contributes no host; the route then
    // rejects every request rather than falling open.
  }

  // Matches the `images.unsplash.com` remotePattern in next.config.ts —
  // the source of DEMO_PRODUCTS' images.
  hosts.add("images.unsplash.com");

  return hosts;
}

const ALLOWED_HOSTS = buildAllowedHosts();

/** Only these are ever returned to the browser from the proxy. */
const ALLOWED_CONTENT_TYPE_PREFIX = "image/";

/** Product images are small; anything larger is not a product image. */
export const MAX_PROXY_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/** Upstream must answer promptly — bounds how long a request can pin a worker. */
export const PROXY_IMAGE_TIMEOUT_MS = 10_000;

export interface ValidatedImageUrl {
  ok: true;
  url: URL;
}

export interface RejectedImageUrl {
  ok: false;
  reason: string;
}

/**
 * Validates a caller-supplied image URL against the allowlist.
 *
 * Rejects anything that isn't `https:` — that rules out `http:` (no
 * transport security, and the usual scheme for internal services) along
 * with `file:`, `data:`, `gopher:` and every other scheme `fetch` might
 * otherwise be coaxed into. Credentials in the URL (`https://user:pass@host`)
 * are rejected too: they're never legitimate here, and `https://allowed.host@evil.com`
 * is the classic way to make a URL *look* allowlisted while resolving elsewhere.
 */
export function validateImageUrl(raw: string): ValidatedImageUrl | RejectedImageUrl {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "Malformed url parameter" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "Only https image URLs may be proxied" };
  }

  if (url.username || url.password) {
    return { ok: false, reason: "Credentials are not permitted in the image URL" };
  }

  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
    return { ok: false, reason: "Image host is not allowed" };
  }

  return { ok: true, url };
}

/**
 * Guards the *response* as well as the request: an allowlisted host can
 * still serve non-image bytes (e.g. an HTML file uploaded to the public
 * bucket). Echoing that back under this app's own origin would turn the
 * proxy into a stored-XSS vector, so only `image/*` is ever passed through.
 */
export function isAllowedContentType(contentType: string | null): boolean {
  return contentType !== null && contentType.toLowerCase().startsWith(ALLOWED_CONTENT_TYPE_PREFIX);
}
