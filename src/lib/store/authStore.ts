import { create } from "zustand";
import type { AuthActionResult } from "@/lib/services/AuthService";

export type AuthUser = NonNullable<AuthActionResult["user"]>;

export interface AuthState {
  currentUser: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isLoading: false,
  error: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
