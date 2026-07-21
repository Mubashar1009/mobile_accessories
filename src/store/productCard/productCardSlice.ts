import type { ProductCardSlice, ProductCardState } from "@/types/store/productCard";
import { defaultProductCardState } from "./defaults";
import { createProductCardActions } from "./actions";

export const createProductCardSlice = (
  set: (partial: Partial<ProductCardState> | ((state: ProductCardState) => Partial<ProductCardState>)) => void,
  get: () => ProductCardState
): ProductCardSlice => ({
  ...defaultProductCardState,
  ...createProductCardActions(set, get),
});
