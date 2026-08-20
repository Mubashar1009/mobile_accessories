import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { SignupSlice } from "@/types/store/signup";

export function useSignupStore(): SignupSlice;
export function useSignupStore<T>(selector: (state: SignupSlice) => T): T;
export function useSignupStore<T>(selector?: (state: SignupSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.signup));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.signup));
}
