"use client";

import { useCallback } from "react";
import { useLoginModalStore } from "@/store/loginModal/useLoginModalStore";
import { useRouter } from "next/navigation";
import { env, isPlaceholderSupabase } from "@/config/env";
import { loginUserAction } from "@/lib/auth-actions";

export function useLoginModal(onOpenChange: (open: boolean) => void) {
  const router = useRouter();

  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    setError,
    setLoading,
    resetForm,
  } = useLoginModalStore();

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (isPlaceholderSupabase()) {
          const adminEmails = env.auth.adminEmails;
          if (adminEmails.includes(email.trim().toLowerCase())) {
            document.cookie = `mock-admin-session=${encodeURIComponent(
              email.trim()
            )}; path=/; max-age=86400`;
            resetForm();
            onOpenChange(false);
            router.refresh();
            return;
          } else {
            setError("Access denied: You are not authorized as an administrator.");
            setLoading(false);
            return;
          }
        }

        const actionResult = await loginUserAction({
          email: email.trim(),
          password,
        });

        if (actionResult.error) {
          setError(actionResult.error);
          return;
        }

        resetForm();
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, setError, setLoading, resetForm, onOpenChange, router]
  );

  return {
    // State
    email,
    password,
    error,
    loading,
    isPlaceholderSupabase: isPlaceholderSupabase(),
    // Setters
    setEmail,
    setPassword,
    // Actions
    handleLogin,
  };
}
