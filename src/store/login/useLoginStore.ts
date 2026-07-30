import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { LoginSlice } from "@/types/store/login";

export function useLoginStore(): LoginSlice;
export function useLoginStore<T>(selector: (state: LoginSlice) => T): T;
export function useLoginStore<T>(selector?: (state: LoginSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.login));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.login));
}
