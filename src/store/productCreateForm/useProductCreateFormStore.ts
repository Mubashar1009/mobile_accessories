import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductCreateFormSlice } from "@/types/store/productCreateForm";

export function useProductCreateFormStore(): ProductCreateFormSlice;
export function useProductCreateFormStore<T>(selector: (state: ProductCreateFormSlice) => T): T;
export function useProductCreateFormStore<T>(selector?: (state: ProductCreateFormSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.productCreateForm));
  }
  return useRootStore(useShallow((state) => state.productCreateForm));
}
