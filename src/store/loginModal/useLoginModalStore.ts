import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { LoginModalSlice } from "@/types/store/loginModal";

export function useLoginModalStore(): LoginModalSlice;
export function useLoginModalStore<T>(selector: (state: LoginModalSlice) => T): T;
export function useLoginModalStore<T>(selector?: (state: LoginModalSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.loginModal));
  }
  return useRootStore(useShallow((state) => state.loginModal));
}
