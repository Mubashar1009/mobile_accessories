"use client";

import { useCallback } from "react";
import { useRootStore } from "@/store/useRootStore";
import { usePasswordResetStore } from "@/store/passwordReset/usePasswordResetStore";
import { passwordResetFrontendService } from "@/lib/frontend/PasswordResetFrontendService";

/**
 * The only way a component reaches password-reset state/actions.
 * Components never import `usePasswordResetStore` or
 * `PasswordResetFrontendService` directly.
 */
export function usePasswordReset() {
  const email = usePasswordResetStore((s) => s.email);
  const newPassword = usePasswordResetStore((s) => s.newPassword);
  const isSubmitting = usePasswordResetStore((s) => s.isSubmitting);
  const isEmailSent = usePasswordResetStore((s) => s.isEmailSent);
  const isPasswordUpdated = usePasswordResetStore((s) => s.isPasswordUpdated);
  const error = usePasswordResetStore((s) => s.error);
  const setEmail = usePasswordResetStore((s) => s.setEmail);
  const setNewPassword = usePasswordResetStore((s) => s.setNewPassword);

  // Read the value at call time rather than closing over the rendered one,
  // so a submit fired in the same tick as the last keystroke still sends
  // what the user actually typed.
  const requestReset = useCallback(
    () => passwordResetFrontendService.requestReset(useRootStore.getState().passwordReset.email),
    []
  );
  const updatePassword = useCallback(
    () =>
      passwordResetFrontendService.updatePassword(
        useRootStore.getState().passwordReset.newPassword
      ),
    []
  );

  return {
    email,
    newPassword,
    isSubmitting,
    isEmailSent,
    isPasswordUpdated,
    error,
    setEmail,
    setNewPassword,
    requestReset,
    updatePassword,
  };
}
