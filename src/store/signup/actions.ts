import type { SignupActions, SignupState } from "@/types/store/signup";
import { initialSignupState } from "./defaults";

export const createSignupActions = (
  set: (partial: Partial<SignupState> | ((state: SignupState) => Partial<SignupState>)) => void
): SignupActions => ({
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setServerError: (serverError) => set({ serverError }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
  setFieldErrors: (fieldErrors) => set({ fieldErrors }),
  setLoading: (loading) => set({ loading }),
  setShowPassword: (showPassword) => set({ showPassword }),
  resetForm: () => set(initialSignupState),
});
