"use server";

import { createClient } from "@/utils/supabase/server";
import { encryptPassword, verifyPassword } from "@/lib/auth-crypto";
import { signupSchema } from "@/types/signup/schema";
import { loginSchema } from "@/types/login/schema";

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

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
  // Validate input
  const validation = signupSchema.safeParse({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword || formData.password,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const { name, email, password } = validation.data;
  const encryptedPassword = encryptPassword(password);

  try {
    const supabase = await createClient();

    // 1. Sign up user via Supabase Auth, passing encrypted_password in user metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          encrypted_password: encryptedPassword,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("user already registered")) {
        return {
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
      return { error: authError.message };
    }

    // 2. Also ensure password column in public.users is directly updated/set if user exists
    if (authData.user) {
      await supabase
        .from("users")
        .update({
          password: encryptedPassword,
          name: name.trim(),
        })
        .eq("id", authData.user.id);
    }

    return {
      success: true,
      user: authData.user
        ? {
            id: authData.user.id,
            email: authData.user.email || email,
            name,
          }
        : undefined,
    };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during signup.",
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
  // Validate input
  const validation = loginSchema.safeParse(formData);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || "Invalid email or credentials",
    };
  }

  const email = formData.email.trim().toLowerCase();
  const rawPassword = formData.password;

  try {
    const supabase = await createClient();

    // 1. Check if user row exists in public.users
    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, name, password")
      .ilike("email", email)
      .maybeSingle();

    // 2. If password field is present in the database row, verify with secret key
    if (userRow?.password) {
      const isValid = verifyPassword(rawPassword, userRow.password);
      if (!isValid) {
        return { error: "Invalid email or credentials." };
      }
    }

    // 3. Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: rawPassword,
      });

    if (authError) {
      return { error: "Invalid email or credentials." };
    }

    // 4. Backfill encrypted password in public.users if it was previously null
    if (authData.user && userRow && !userRow.password) {
      const encryptedPassword = encryptPassword(rawPassword);
      await supabase
        .from("users")
        .update({ password: encryptedPassword })
        .eq("id", authData.user.id);
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: userRow?.name,
      },
    };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-in.",
    };
  }
}
