import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ErrorSlice } from "@/types/store/error";

export function useErrorStore(): ErrorSlice;
export function useErrorStore<T>(selector: (state: ErrorSlice) => T): T;
export function useErrorStore<T>(selector?: (state: ErrorSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.error));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.error));
}
