import type { PasswordResetState } from "@/types/store/passwordReset";

export const defaultPasswordResetState: PasswordResetState = {
  email: "",
  newPassword: "",
  isSubmitting: false,
  isEmailSent: false,
  isPasswordUpdated: false,
  error: null,
};
