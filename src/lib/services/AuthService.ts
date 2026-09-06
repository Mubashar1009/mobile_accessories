import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { encryptPassword, verifyPassword } from "@/lib/auth-crypto";
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

/**
 * Backend domain service for signup/login. `auth` is a per-call parameter
 * (a fresh Supabase SSR client from `Core.createAuthClient()`), never
 * constructor-injected.
 */
export class AuthService extends BaseDomainService {
  async signup(auth: SupabaseClient, name: string, email: string, password: string): Promise<AuthActionResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const encryptedPassword = encryptPassword(password);

    const { data, error } = await auth.auth.signUp({ email: normalizedEmail, password });

    if (error) {
      if (error.message.toLowerCase().includes("user already registered")) {
        return { error: "An account with this email already exists. Please sign in instead." };
      }
      return { error: error.message };
    }

    if (data.user) {
      // Best-effort backfill: on_auth_user_created already wrote name/password
      // from the auth metadata above, so a failure here isn't fatal.
      try {
        await this.db.update("users", data.user.id, {
          password: encryptedPassword,
          name: name.trim(),
        });
      } catch (err) {
        logger.warn("AuthService.signup: password/name backfill failed", err, { userId: data.user.id });
      }
    }

    return {
      success: true,
      user: data.user
        ? { id: data.user.id, email: data.user.email || normalizedEmail, name }
        : undefined,
    };
  }

  async login(auth: SupabaseClient, email: string, password: string): Promise<AuthActionResult> {
    const normalizedEmail = email.trim().toLowerCase();

    // Repository handles the case-insensitive lookup.
    const userRow = await findUserByEmail(normalizedEmail);

    if (userRow?.password) {
      const isValid = verifyPassword(password, userRow.password);
      if (!isValid) {
        return { error: "Invalid email or credentials." };
      }
    }

    const { data, error } = await auth.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) {
      return { error: "Invalid email or credentials." };
    }
    const user = data.user;

    // Backfill encrypted password in public.users if it was previously null.
    if (userRow && !userRow.password) {
      const encryptedPassword = encryptPassword(password);
      try {
        await this.db.update("users", user.id, { password: encryptedPassword });
      } catch (err) {
        // Best-effort backfill — a failure here doesn't block sign-in.
        logger.warn("AuthService.login: password backfill failed", err, { userId: user.id });
      }
    }

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
   * `/auth/confirm`, then re-syncs the encrypted copy in public.users.
   *
   * That second step is not optional: `login()` above verifies the stored
   * copy BEFORE delegating to Supabase, so leaving it on the old password
   * would reject the user's new one and lock them out entirely.
   */
  async updatePassword(auth: SupabaseClient, newPassword: string): Promise<PasswordResetResult> {
    const { data, error } = await auth.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      try {
        await this.db.update("users", data.user.id, { password: encryptPassword(newPassword) });
      } catch (err) {
        // Supabase already accepted the new password, so this can't be
        // rolled back — but public.users now holds a stale hash that
        // login() would reject. Requesting a fresh reset link retries
        // both halves, so that's the remedy we point the user at.
        logger.error("AuthService.updatePassword: password sync failed", err, { userId: data.user.id });
        return {
          success: false,
          error: "Your password was changed but your profile could not be updated. Please request a new reset link.",
        };
      }
    }

    return { success: true };
  }
}
