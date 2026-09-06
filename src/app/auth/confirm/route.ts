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
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || AppRoutes.UPDATE_PASSWORD;

  const failed = (message: string) =>
    NextResponse.redirect(`${origin}${AppRoutes.FORGOT_PASSWORD}?error=${encodeURIComponent(message)}`);

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

  return NextResponse.redirect(`${origin}${next}`);
}
