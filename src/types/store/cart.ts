import type { CartItem } from "../cart";

export interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  loading: boolean;
}

export interface CartActions {
  setCartItems: (items: CartItem[]) => void;
  setIsOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export type CartSlice = CartState & CartActions;
