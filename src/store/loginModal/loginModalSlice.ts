import type { LoginModalSlice, LoginModalState } from "@/types/store/loginModal";
import { defaultLoginModalState } from "./defaults";
import { createLoginModalActions } from "./actions";

export const createLoginModalSlice = (
  set: (partial: Partial<LoginModalState> | ((state: LoginModalState) => Partial<LoginModalState>)) => void,
  get: () => LoginModalState
): LoginModalSlice => ({
  ...defaultLoginModalState,
  ...createLoginModalActions(set, get),
});
