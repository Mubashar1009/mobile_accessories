"use client";

import { useCallback } from "react";
import { useLoginModalStore } from "@/store/loginModal/useLoginModalStore";
import { useRouter } from "next/navigation";

function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return !url || url.includes("your-project-id") || url === "https://.supabase.co";
}

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
        const adminEmails = (
          process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
        ).split(",");

        if (isPlaceholderSupabase()) {
          if (adminEmails.includes(email.trim())) {
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
    [email, setError, setLoading, resetForm, onOpenChange, router]
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
