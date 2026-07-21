import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { CartSlice } from "@/types/store/cart";

export function useCartStore(): CartSlice;
export function useCartStore<T>(selector: (state: CartSlice) => T): T;
export function useCartStore<T>(selector?: (state: CartSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.cart));
  }
  return useRootStore(useShallow((state) => state.cart));
}
