import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { AuthSlice } from "@/types/store/auth";

export function useAuthStore(): AuthSlice;
export function useAuthStore<T>(selector: (state: AuthSlice) => T): T;
export function useAuthStore<T>(selector?: (state: AuthSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.auth));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.auth));
}
