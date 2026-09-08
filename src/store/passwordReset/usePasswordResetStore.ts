import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { PasswordResetSlice } from "@/types/store/passwordReset";

export function usePasswordResetStore(): PasswordResetSlice;
export function usePasswordResetStore<T>(selector: (state: PasswordResetSlice) => T): T;
export function usePasswordResetStore<T>(selector?: (state: PasswordResetSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.passwordReset));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.passwordReset));
}
