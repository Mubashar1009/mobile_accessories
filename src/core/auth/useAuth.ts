"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { authFrontendService } from "@/lib/frontend/AuthFrontendService";

/**
 * The only way a component reaches sign-in/sign-up state/actions.
 * Components never import `useAuthStore` or `AuthFrontendService`
 * directly — going through this hook lets either one change shape later
 * without touching any component. `useLogin`/`useLoginModal`/`useSignup`
 * keep their existing names/APIs (components already depend on them) but
 * delegate to this hook internally instead of calling a Server Action or
 * Supabase directly.
 */
export function useAuth() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  // Stable identities: `useLogin`/`useSignup` list these in the dependency
  // arrays of their `handleSubmit` callbacks, so recreating them on every
  // render would give those callbacks a new identity every render too.
  const signIn = useCallback(
    (email: string, password: string) => authFrontendService.signIn(email, password),
    []
  );
  const signUp = useCallback(
    (name: string, email: string, password: string, confirmPassword?: string) =>
      authFrontendService.signUp(name, email, password, confirmPassword),
    []
  );

  return { currentUser, isLoading, error, signIn, signUp };
}
