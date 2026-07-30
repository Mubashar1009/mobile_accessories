import type { LoginSlice, LoginState } from "@/types/store/login";
import { defaultLoginState } from "./defaults";
import { createLoginActions } from "./actions";

export const createLoginSlice = (
  set: (partial: Partial<LoginState> | ((state: LoginState) => Partial<LoginState>)) => void,
  get: () => LoginState
): LoginSlice => ({
  ...defaultLoginState,
  ...createLoginActions(set, get),
});
