"use client";

import { useAuthStore } from "@/lib/store/authStore";
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

  const signIn = (email: string, password: string) => authFrontendService.signIn(email, password);
  const signUp = (name: string, email: string, password: string, confirmPassword?: string) =>
    authFrontendService.signUp(name, email, password, confirmPassword);

  return { currentUser, isLoading, error, signIn, signUp };
}
