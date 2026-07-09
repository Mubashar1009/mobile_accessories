import { create } from "zustand";
import type { CartItem } from "@/types/cart";

interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  loading: boolean;
  setCartItems: (items: CartItem[]) => void;
  setIsOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  isOpen: false,
  loading: true,
  setCartItems: (cartItems) => set({ cartItems }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setLoading: (loading) => set({ loading }),
}));
