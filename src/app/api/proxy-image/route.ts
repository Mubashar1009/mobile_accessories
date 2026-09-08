import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  isAllowedContentType,
  MAX_PROXY_IMAGE_BYTES,
  PROXY_IMAGE_TIMEOUT_MS,
  validateImageUrl,
} from "@/lib/security/imageProxy";

/**
 * Same-origin image proxy, used only by `PDFOrderPreview` so html2canvas can
 * rasterize product images without tainting the canvas.
 *
 * Every request is validated against a host allowlist before any fetch is
 * issued — see `@/lib/security/imageProxy` for why this is an allowlist and
 * not a private-IP denylist.
 */
export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const validation = validateImageUrl(imageUrl);
  if (!validation.ok) {
    // Deliberately terse and non-echoing: repeating the rejected URL back
    // would reflect attacker-controlled text, and naming the exact rule that
    // failed helps map the allowlist.
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const response = await fetch(validation.url, {
      // `manual` stops the runtime from transparently following a 3xx to a
      // host that is NOT on the allowlist — the redirect hop is the standard
      // way to slip past a URL check that only inspects the first request.
      redirect: "manual",
      signal: AbortSignal.timeout(PROXY_IMAGE_TIMEOUT_MS),
      headers: { Accept: "image/*" },
    });

    if (response.status >= 300 && response.status < 400) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = response.headers.get("content-type");
    if (!isAllowedContentType(contentType)) {
      return new NextResponse("Unsupported media type", { status: 415 });
    }

    // Trust the declared length when present, but re-check the real byte
    // count below — `Content-Length` is upstream-controlled and may lie.
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_PROXY_IMAGE_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_PROXY_IMAGE_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        // `contentType` is non-null here: isAllowedContentType rejected null.
        "Content-Type": contentType as string,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        // Stops a browser from re-interpreting the bytes as anything but the
        // image/* type declared above.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    // No `Access-Control-Allow-Origin: *` anywhere in this route: the only
    // caller is same-origin, and opening it up would let any site on the web
    // read responses through this app's origin.
    logger.error("proxy-image: upstream fetch failed", error, { host: validation.url.hostname });
    return new NextResponse("Error fetching image", { status: 502 });
  }
}
