import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ErrorSlice } from "@/types/store/error";

export function useErrorStore(): ErrorSlice;
export function useErrorStore<T>(selector: (state: ErrorSlice) => T): T;
export function useErrorStore<T>(selector?: (state: ErrorSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.error));
  }
  return useRootStore(useShallow((state) => state.error));
}
