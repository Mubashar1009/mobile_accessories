import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { findUserByEmail } from "@/lib/repositories/users";
import { logger } from "@/lib/logger";
import { BaseDomainService } from "./BaseDomainService";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface PasswordResetResult {
  success: boolean;
  error?: string;
}

/** Never disclose whether it was the email or the password that was wrong. */
const INVALID_CREDENTIALS = "Invalid email or credentials.";

/**
 * Backend domain service for signup/login. `auth` is a per-call parameter
 * (a fresh Supabase SSR client from `Core.createAuthClient()`), never
 * constructor-injected.
 *
 * ── On password storage ────────────────────────────────────────────────
 * Supabase Auth (GoTrue) is the ONLY store of password material: it holds
 * a bcrypt hash in `auth.users.encrypted_password`, and
 * `signInWithPassword` below is what actually authenticates a user.
 *
 * This service used to ALSO keep an HMAC-SHA256 copy in
 * `public.users.password` and check it before delegating to Supabase. That
 * copy was removed, because it could only ever subtract security:
 *
 *   * It gated nothing. A caller who passed the HMAC check still had to
 *     pass `signInWithPassword`, and one who failed it was rejected by
 *     `signInWithPassword` anyway — so the pre-check rejected exactly the
 *     requests Supabase was going to reject regardless.
 *   * It was a second, far weaker credential store. HMAC-SHA256 is a
 *     single-round hash, not a KDF, and it used one process-wide key with
 *     no per-user salt — so equal passwords produced equal hashes, and any
 *     read of that column exposed the whole user base to offline
 *     dictionary attack at GPU speed.
 *   * `public.users` is readable by its owner under the "Users can view own
 *     profile" RLS policy from migration 001, and the `password` column
 *     added later in 004 was never excluded from it — so a signed-in user
 *     could read their own hash from the browser with the anon key, handing
 *     an attacker a known plaintext/hash pair to attack the shared key with.
 *   * It introduced a lockout failure mode with no upside: whenever the
 *     shadow copy drifted from the real password, `login` refused a
 *     password Supabase would have accepted.
 *
 * Migration 008 drops the column. Nothing in this file may reintroduce it.
 */
export class AuthService extends BaseDomainService {
  async signup(auth: SupabaseClient, name: string, email: string, password: string): Promise<AuthActionResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const { data, error } = await auth.auth.signUp({
      email: normalizedEmail,
      password,
      // `on_auth_user_created` reads `full_name` out of this metadata to
      // populate public.users.name, so passing it here means the row is
      // correct the moment it's created rather than needing a backfill.
      options: { data: { full_name: trimmedName } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("user already registered")) {
        return { error: "An account with this email already exists. Please sign in instead." };
      }
      return { error: error.message };
    }

    if (data.user) {
      // Best-effort: the trigger above already wrote the name, so a failure
      // here is not fatal to the signup.
      try {
        await this.db.update("users", data.user.id, { name: trimmedName });
      } catch (err) {
        logger.warn("AuthService.signup: name backfill failed", err, { userId: data.user.id });
      }
    }

    return {
      success: true,
      user: data.user
        ? { id: data.user.id, email: data.user.email || normalizedEmail, name: trimmedName }
        : undefined,
    };
  }

  async login(auth: SupabaseClient, email: string, password: string): Promise<AuthActionResult> {
    const normalizedEmail = email.trim().toLowerCase();

    // Supabase Auth is the sole authority on the password.
    const { data, error } = await auth.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      return { error: INVALID_CREDENTIALS };
    }

    const user = data.user;

    // Profile lookup happens only AFTER authentication succeeds, so an
    // unauthenticated caller can't use response timing to probe which
    // addresses have accounts.
    const userRow = await findUserByEmail(normalizedEmail);

    return {
      success: true,
      user: { id: user.id, email: user.email || normalizedEmail, name: userRow?.name ?? undefined },
    };
  }

  /**
   * Fully delegated to Supabase Auth — it generates the token, sends the
   * email and enforces expiry. Nothing to implement or store on our side.
   */
  async requestPasswordReset(auth: SupabaseClient, email: string): Promise<PasswordResetResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await auth.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${env.site.url}/auth/confirm`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Sets the new password on the recovery session established by
   * `/auth/confirm`. With the shadow copy gone there is nothing left to
   * keep in sync afterwards — Supabase Auth accepting the update IS the
   * password change.
   */
  async updatePassword(auth: SupabaseClient, newPassword: string): Promise<PasswordResetResult> {
    const { error } = await auth.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
