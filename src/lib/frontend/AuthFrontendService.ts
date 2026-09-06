"use client";

import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/lib/store/authStore";
import { loginUserAction, signupUserAction, type AuthActionResult } from "@/app/actions/auth.actions";

/**
 * Client-side counterpart to the backend's `AuthService`: the one place
 * that calls the auth Server Actions and syncs the result into
 * `authStore`. Only `src/hooks/useAuth.ts` calls this; components never do.
 *
 * `signIn`/`signUp` also establish the *browser* Supabase client's own
 * session (used by `useNavbar`, `useProducts`, etc. for client-side
 * `supabase.auth.*` calls) — the Server Action's cookies cover SSR, but the
 * browser client needs its own sign-in call to pick one up. This used to
 * live inline in `useLogin`/`useSignup`; it's a `'use client'`-only
 * concern, so it belongs here rather than duplicated across every hook
 * that logs a user in.
 */
export class AuthFrontendService {
  async signIn(email: string, password: string): Promise<AuthActionResult> {
    const { setLoading, setError, setCurrentUser } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    try {
      const result = await loginUserAction({ email, password });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return result;
      }

      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });
      } catch {
        // Session already handled by the server action's cookies.
      }

      setCurrentUser(result.user ?? null);
      toast.success("Signed in successfully.");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }

  async signUp(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<AuthActionResult> {
    const { setLoading, setError, setCurrentUser } = useAuthStore.getState();
    setLoading(true);
    setError(null);
    try {
      const result = await signupUserAction({ name, email, password, confirmPassword });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return result;
      }

      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email, password });
      } catch {
        // Ignored — e.g. email confirmation is required before a session exists.
      }

      setCurrentUser(result.user ?? null);
      toast.success("Account created successfully.");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }
}

export const authFrontendService = new AuthFrontendService();
