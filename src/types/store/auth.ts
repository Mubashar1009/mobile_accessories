import type { AuthActionResult } from "@/lib/services/AuthService";

export type AuthUser = NonNullable<AuthActionResult["user"]>;

export interface AuthState {
  currentUser: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setCurrentUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type AuthSlice = AuthState & AuthActions;
