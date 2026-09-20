import type { AuthActions, AuthState } from "@/types/store/auth";

export const createAuthActions = (
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  _get: () => AuthState
): AuthActions => ({
  setCurrentUser: (currentUser) => set({ currentUser }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
});
