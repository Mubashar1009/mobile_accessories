import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductCardSlice } from "@/types/store/productCard";

export function useProductCardStore(): ProductCardSlice;
export function useProductCardStore<T>(selector: (state: ProductCardSlice) => T): T;
export function useProductCardStore<T>(selector?: (state: ProductCardSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.productCard));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.productCard));
}
