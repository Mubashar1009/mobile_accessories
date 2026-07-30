import type { LoginActions, LoginState } from "@/types/store/login";
import { defaultLoginState } from "./defaults";

export const createLoginActions = (
  set: (partial: Partial<LoginState> | ((state: LoginState) => Partial<LoginState>)) => void,
  _get: () => LoginState
): LoginActions => ({
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setServerError: (serverError) => set({ serverError }),
  setFieldErrors: (fieldErrors) => set({ fieldErrors }),
  setLoading: (loading) => set({ loading }),
  setShowPassword: (showPassword) => set({ showPassword }),
  resetForm: () => set(defaultLoginState),
});
