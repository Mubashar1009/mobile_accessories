import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { AdminProductFormSlice } from "@/types/store/adminProductForm";

export function useAdminProductFormStore(): AdminProductFormSlice;
export function useAdminProductFormStore<T>(selector: (state: AdminProductFormSlice) => T): T;
export function useAdminProductFormStore<T>(selector?: (state: AdminProductFormSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.adminProductForm));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.adminProductForm));
}
