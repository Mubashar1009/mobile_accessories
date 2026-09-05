"use client";

import { toast } from "sonner";
import { usePasswordResetStore } from "@/lib/store/passwordResetStore";
import { requestPasswordResetAction, updatePasswordAction } from "@/app/actions/auth.actions";

/**
 * Client-side counterpart to the request/confirm Server Actions: the one
 * place that calls them and syncs the result into `passwordResetStore`.
 * Only `src/hooks/usePasswordReset.ts` calls this; components never do.
 */
export class PasswordResetFrontendService {
  async requestReset(email: string): Promise<void> {
    const { setIsSubmitting, setError, setIsEmailSent } = usePasswordResetStore.getState();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await requestPasswordResetAction(email);
      if (!result.success) {
        const message = result.error || "Failed to send reset email.";
        setError(message);
        toast.error(message);
        return;
      }

      setIsEmailSent(true);
      toast.success("Check your email for a password reset link.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { setIsSubmitting, setError, setIsPasswordUpdated } = usePasswordResetStore.getState();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await updatePasswordAction(newPassword);
      if (!result.success) {
        const message = result.error || "Failed to update password.";
        setError(message);
        toast.error(message);
        return;
      }

      setIsPasswordUpdated(true);
      toast.success("Password updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }
}

export const passwordResetFrontendService = new PasswordResetFrontendService();
