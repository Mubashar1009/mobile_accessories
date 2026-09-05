"use server";

import { Core } from "@/lib/core";
import { authService } from "@/lib/registry";
import type { AuthActionResult, PasswordResetResult } from "@/lib/services/AuthService";
import { loginSchema } from "@/types/login/schema";
import { signupSchema } from "@/types/signup/schema";
import { requestPasswordResetSchema, updatePasswordSchema } from "@/types/passwordReset/schema";

export type { AuthActionResult, PasswordResetResult };

/**
 * Server action to register a new user.
 * Encrypts the password with the secret key and stores it in the database.
 */
export async function signupUserAction(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthActionResult> {
  const validation = signupSchema.safeParse({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword || formData.password,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Validation failed" };
  }

  const { name, email, password } = validation.data;

  try {
    const auth = await Core.createAuthClient();
    return await authService.signup(auth, name, email, password);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred during signup.",
    };
  }
}

/**
 * Server action to sign in a user.
 * Encrypts the entered password with the secret key, matches against public.users table,
 * and signs in with Supabase session.
 */
export async function loginUserAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(formData);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid email or credentials" };
  }

  try {
    const auth = await Core.createAuthClient();
    return await authService.login(auth, validation.data.email, validation.data.password);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred during sign-in.",
    };
  }
}

/**
 * Server action to request a password reset email.
 * Delegates entirely to Supabase Auth's `resetPasswordForEmail` — no custom
 * token generation, hashing, or expiry logic lives here or ever should.
 */
export async function requestPasswordResetAction(email: string): Promise<PasswordResetResult> {
  const validation = requestPasswordResetSchema.safeParse({ email });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Please enter a valid email address." };
  }

  try {
    const auth = await Core.createAuthClient();
    return await authService.requestPasswordReset(auth, validation.data.email);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while requesting a password reset.",
    };
  }
}

/**
 * Server action to set a new password. Relies on the recovery session
 * cookie already established by `src/app/auth/confirm/route.ts` — Supabase's
 * `updateUser` call needs no separate token/code passed in manually.
 */
export async function updatePasswordAction(newPassword: string): Promise<PasswordResetResult> {
  const validation = updatePasswordSchema.safeParse({ newPassword });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Please enter a valid password." };
  }

  try {
    const auth = await Core.createAuthClient();
    return await authService.updatePassword(auth, validation.data.newPassword);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while updating your password.",
    };
  }
}
