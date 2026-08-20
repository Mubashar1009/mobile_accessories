import type { SignupSlice, SignupState } from "@/types/store/signup";
import { initialSignupState } from "./defaults";
import { createSignupActions } from "./actions";

export const createSignupSlice = (
  set: (partial: Partial<SignupState> | ((state: SignupState) => Partial<SignupState>)) => void,
  _get: () => SignupSlice
): SignupSlice => ({
  ...initialSignupState,
  ...createSignupActions(set),
});
