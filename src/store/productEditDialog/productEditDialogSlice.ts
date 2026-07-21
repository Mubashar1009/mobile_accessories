import type { ProductEditDialogSlice, ProductEditDialogState } from "@/types/store/productEditDialog";
import { defaultProductEditDialogState } from "./defaults";
import { createProductEditDialogActions } from "./actions";

export const createProductEditDialogSlice = (
  set: (partial: Partial<ProductEditDialogState> | ((state: ProductEditDialogState) => Partial<ProductEditDialogState>)) => void,
  get: () => ProductEditDialogState
): ProductEditDialogSlice => ({
  ...defaultProductEditDialogState,
  ...createProductEditDialogActions(set, get),
});
