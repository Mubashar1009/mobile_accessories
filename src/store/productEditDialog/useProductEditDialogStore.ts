import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { ProductEditDialogSlice } from "@/types/store/productEditDialog";

export function useProductEditDialogStore(): ProductEditDialogSlice;
export function useProductEditDialogStore<T>(selector: (state: ProductEditDialogSlice) => T): T;
export function useProductEditDialogStore<T>(selector?: (state: ProductEditDialogSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.productEditDialog));
  }
  return useRootStore(useShallow((state) => state.productEditDialog));
}
