import type { AuthState } from "@/types/store/auth";

export const defaultAuthState: AuthState = {
  currentUser: null,
  isLoading: false,
  error: null,
};
