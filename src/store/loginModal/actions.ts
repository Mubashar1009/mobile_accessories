import type { LoginModalActions, LoginModalState } from "@/types/store/loginModal";
import { defaultLoginModalState } from "./defaults";

export const createLoginModalActions = (
  set: (partial: Partial<LoginModalState> | ((state: LoginModalState) => Partial<LoginModalState>)) => void,
  get: () => LoginModalState
): LoginModalActions => ({
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  resetForm: () => set(defaultLoginModalState),
});
