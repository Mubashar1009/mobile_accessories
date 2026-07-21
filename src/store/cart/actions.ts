import type { CartActions, CartState } from "@/types/store/cart";

export const createCartActions = (
  set: (partial: Partial<CartState> | ((state: CartState) => Partial<CartState>)) => void,
  get: () => CartState
): CartActions => ({
  setCartItems: (cartItems) => set({ cartItems }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setLoading: (loading) => set({ loading }),
});
