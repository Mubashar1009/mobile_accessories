import type { ProductCreateFormSlice, ProductCreateFormState } from "@/types/store/productCreateForm";
import { defaultProductCreateFormState } from "./defaults";
import { createProductCreateFormActions } from "./actions";

export const createProductCreateFormSlice = (
  set: (partial: Partial<ProductCreateFormState> | ((state: ProductCreateFormState) => Partial<ProductCreateFormState>)) => void,
  get: () => ProductCreateFormState
): ProductCreateFormSlice => ({
  ...defaultProductCreateFormState,
  ...createProductCreateFormActions(set, get),
});
