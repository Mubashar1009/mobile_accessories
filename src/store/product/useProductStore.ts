import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductSlice } from "@/types/store/product";

export function useProductStore(): ProductSlice;
export function useProductStore<T>(selector: (state: ProductSlice) => T): T;
export function useProductStore<T>(selector?: (state: ProductSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.product));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.product));
}
