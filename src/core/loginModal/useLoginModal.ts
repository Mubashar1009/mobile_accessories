"use client";

import { useCallback } from "react";
import { useLoginModalStore } from "@/store/loginModal/useLoginModalStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useLoginModal(onOpenChange: (open: boolean) => void) {
  const router = useRouter();
  const { signIn } = useAuth();

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
        const actionResult = await signIn(email.trim(), password);

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
    [email, password, setError, setLoading, resetForm, onOpenChange, router, signIn]
  );

  return {
    // State
    email,
    password,
    error,
    loading,
    // Setters
    setEmail,
    setPassword,
    // Actions
    handleLogin,
  };
}
