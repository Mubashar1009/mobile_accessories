import type { PasswordResetActions, PasswordResetState } from "@/types/store/passwordReset";

export const createPasswordResetActions = (
  set: (
    partial: Partial<PasswordResetState> | ((state: PasswordResetState) => Partial<PasswordResetState>)
  ) => void,
  _get: () => PasswordResetState
): PasswordResetActions => ({
  setEmail: (email) => set({ email }),
  setNewPassword: (newPassword) => set({ newPassword }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setIsEmailSent: (isEmailSent) => set({ isEmailSent }),
  setIsPasswordUpdated: (isPasswordUpdated) => set({ isPasswordUpdated }),
  setError: (error) => set({ error }),
});
