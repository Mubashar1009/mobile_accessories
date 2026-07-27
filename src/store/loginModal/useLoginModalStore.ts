import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { LoginModalSlice } from "@/types/store/loginModal";

export function useLoginModalStore(): LoginModalSlice;
export function useLoginModalStore<T>(selector: (state: LoginModalSlice) => T): T;
export function useLoginModalStore<T>(selector?: (state: LoginModalSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.loginModal));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.loginModal));
}
