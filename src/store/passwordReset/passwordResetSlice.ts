import type { PasswordResetSlice, PasswordResetState } from "@/types/store/passwordReset";
import { defaultPasswordResetState } from "./defaults";
import { createPasswordResetActions } from "./actions";

export const createPasswordResetSlice = (
  set: (
    partial: Partial<PasswordResetState> | ((state: PasswordResetState) => Partial<PasswordResetState>)
  ) => void,
  get: () => PasswordResetState
): PasswordResetSlice => ({
  ...defaultPasswordResetState,
  ...createPasswordResetActions(set, get),
});
