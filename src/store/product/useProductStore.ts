import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductSlice } from "@/types/store/product";

export function useProductStore(): ProductSlice;
export function useProductStore<T>(selector: (state: ProductSlice) => T): T;
export function useProductStore<T>(selector?: (state: ProductSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.product));
  }
  return useRootStore(useShallow((state) => state.product));
}
