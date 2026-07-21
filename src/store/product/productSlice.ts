import type { ProductSlice, ProductState } from "@/types/store/product";
import { defaultProductState } from "./defaults";
import { createProductActions } from "./actions";

export const createProductSlice = (
  set: (partial: Partial<ProductState> | ((state: ProductState) => Partial<ProductState>)) => void,
  get: () => ProductState
): ProductSlice => ({
  ...defaultProductState,
  ...createProductActions(set, get),
});
