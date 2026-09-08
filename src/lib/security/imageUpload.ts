import "server-only";

/**
 * Validation for admin-supplied product image uploads.
 *
 * These uploads land in a PUBLIC Supabase Storage bucket
 * (`product-images`, created public in migration 002), so whatever is
 * stored is world-readable and served under the Supabase origin with the
 * `Content-Type` derived from the object. Two consequences drive the rules
 * below:
 *
 *   * The uploaded type must be a real raster image. `image/svg+xml` is
 *     deliberately EXCLUDED even though it is an image type: an SVG is an
 *     XML document that can carry `<script>`, and serving one from a public
 *     bucket is a standing stored-XSS primitive against that origin.
 *   * The extension must be derived from the validated MIME type, never
 *     from `file.name`. The client controls the filename completely, so
 *     taking `.pop()` of it let a caller choose the stored object's
 *     extension (`.html`, `.svg`, `.js`) independently of its contents.
 *
 * This is enforced server-side, inside the domain service, rather than in
 * the form component — a Server Action is a public HTTP endpoint and the
 * client-side `accept=` attribute is advisory only.
 */
const ALLOWED_IMAGE_TYPES: ReadonlyMap<string, string> = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export type ImageValidationResult =
  | { ok: true; extension: string; contentType: string }
  | { ok: false; error: string };

export function validateImageUpload(file: File): ImageValidationResult {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    const limitMb = Math.floor(MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024));
    return { ok: false, error: `Image must be ${limitMb} MB or smaller.` };
  }

  // `file.type` comes from the browser and is not proof of content, but it
  // IS what Supabase Storage will serve the object back as — so pinning it
  // to an allowlisted value is what actually constrains the response.
  const contentType = file.type.toLowerCase();
  const extension = ALLOWED_IMAGE_TYPES.get(contentType);

  if (!extension) {
    return {
      ok: false,
      error: "Unsupported image type. Use JPEG, PNG, WebP, GIF or AVIF.",
    };
  }

  return { ok: true, extension, contentType };
}
