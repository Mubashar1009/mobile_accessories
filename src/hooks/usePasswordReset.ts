"use client";

import { usePasswordResetStore } from "@/lib/store/passwordResetStore";
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

  const requestReset = () => passwordResetFrontendService.requestReset(usePasswordResetStore.getState().email);
  const updatePassword = () =>
    passwordResetFrontendService.updatePassword(usePasswordResetStore.getState().newPassword);

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
