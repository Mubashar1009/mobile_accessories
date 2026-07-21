import type { CartSlice, CartState } from "@/types/store/cart";
import { defaultCartState } from "./defaults";
import { createCartActions } from "./actions";

export const createCartSlice = (
  set: (partial: Partial<CartState> | ((state: CartState) => Partial<CartState>)) => void,
  get: () => CartState
): CartSlice => ({
  ...defaultCartState,
  ...createCartActions(set, get),
});
