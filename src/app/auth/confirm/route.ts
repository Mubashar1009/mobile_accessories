import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Core } from "@/lib/core";
import { AppRoutes } from "@/types/enums/routes";

/**
 * Landing point for the link in Supabase's password-recovery email.
 * Establishing the recovery session here (cookies are set by
 * `Core.createAuthClient()`'s SSR client) is what lets
 * `updatePasswordAction` call `updateUser` with no token of its own.
 *
 * Supabase hands the link back in one of two shapes depending on the
 * project's email template, so both are handled:
 *   - `?code=...`                 → PKCE, the default for @supabase/ssr
 *   - `?token_hash=...&type=...`  → templates built on {{ .TokenHash }}
 * Nothing here validates or expires anything itself — Supabase already
 * did that before issuing the code.
 */

/**
 * `next` arrives from the query string, so it is attacker-controlled and
 * must never be concatenated onto the origin unchecked.
 *
 * `${origin}${next}` looks same-origin but isn't: `?next=@evil.com` yields
 * `https://site.example@evil.com`, where `site.example` is parsed as URL
 * *userinfo* and the browser navigates to **evil.com**. A recovery email
 * that lands the user on an attacker's page is a ready-made phishing
 * chain, so only a known in-app route is accepted here.
 */
const ALLOWED_NEXT_ROUTES: ReadonlySet<string> = new Set<string>(Object.values(AppRoutes));

function resolveNext(raw: string | null): string {
  if (raw && ALLOWED_NEXT_ROUTES.has(raw)) {
    return raw;
  }
  return AppRoutes.UPDATE_PASSWORD;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = resolveNext(searchParams.get("next"));

  // `request.nextUrl.origin` reflects the Host header, which a client can
  // set freely. Redirect targets are built from URL objects rooted at that
  // origin — safe because the path component is now allowlisted above, so
  // the worst a spoofed Host achieves is redirecting the attacker to
  // themselves.
  const origin = request.nextUrl.origin;

  const failed = (message: string) => {
    const url = new URL(AppRoutes.FORGOT_PASSWORD, origin);
    url.searchParams.set("error", message);
    return NextResponse.redirect(url);
  };

  if (code) {
    const auth = await Core.createAuthClient();
    const { error } = await auth.auth.exchangeCodeForSession(code);
    if (error) {
      return failed(error.message);
    }
  } else if (tokenHash && type) {
    const auth = await Core.createAuthClient();
    const { error } = await auth.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      return failed(error.message);
    }
  } else {
    return failed("This password reset link is invalid or has expired. Please request a new one.");
  }

  return NextResponse.redirect(new URL(next, origin));
}
