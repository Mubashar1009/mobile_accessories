import { create } from "zustand";

export interface PasswordResetState {
  email: string;
  newPassword: string;
  isSubmitting: boolean;
  isEmailSent: boolean;
  isPasswordUpdated: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setNewPassword: (newPassword: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsEmailSent: (isEmailSent: boolean) => void;
  setIsPasswordUpdated: (isPasswordUpdated: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
  email: "",
  newPassword: "",
  isSubmitting: false,
  isEmailSent: false,
  isPasswordUpdated: false,
  error: null,
  setEmail: (email) => set({ email }),
  setNewPassword: (newPassword) => set({ newPassword }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setIsEmailSent: (isEmailSent) => set({ isEmailSent }),
  setIsPasswordUpdated: (isPasswordUpdated) => set({ isPasswordUpdated }),
  setError: (error) => set({ error }),
}));
