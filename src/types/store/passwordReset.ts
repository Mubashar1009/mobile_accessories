export interface PasswordResetState {
  email: string;
  newPassword: string;
  isSubmitting: boolean;
  isEmailSent: boolean;
  isPasswordUpdated: boolean;
  error: string | null;
}

export interface PasswordResetActions {
  setEmail: (email: string) => void;
  setNewPassword: (newPassword: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsEmailSent: (isEmailSent: boolean) => void;
  setIsPasswordUpdated: (isPasswordUpdated: boolean) => void;
  setError: (error: string | null) => void;
}

export type PasswordResetSlice = PasswordResetState & PasswordResetActions;
