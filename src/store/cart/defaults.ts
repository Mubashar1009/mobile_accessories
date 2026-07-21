import type { CartState } from "@/types/store/cart";

export const defaultCartState: CartState = {
  cartItems: [],
  isOpen: false,
  loading: true,
};
