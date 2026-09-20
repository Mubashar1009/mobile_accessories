import type { AuthSlice, AuthState } from "@/types/store/auth";
import { defaultAuthState } from "./defaults";
import { createAuthActions } from "./actions";

export const createAuthSlice = (
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void,
  get: () => AuthState
): AuthSlice => ({
  ...defaultAuthState,
  ...createAuthActions(set, get),
});
