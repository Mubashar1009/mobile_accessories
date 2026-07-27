import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductCreateFormSlice } from "@/types/store/productCreateForm";

export function useProductCreateFormStore(): ProductCreateFormSlice;
export function useProductCreateFormStore<T>(selector: (state: ProductCreateFormSlice) => T): T;
export function useProductCreateFormStore<T>(selector?: (state: ProductCreateFormSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.productCreateForm));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.productCreateForm));
}
