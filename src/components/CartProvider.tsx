"use client";

import { useEffect, type ReactNode } from "react";
import { useCartStore } from "@/store/useCartStore";

export function CartProvider({ children }: { children: ReactNode }) {
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return <>{children}</>;
}

export function useCart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const isOpen = useCartStore((state) => state.isOpen);
  const loading = useCartStore((state) => state.loading);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const getItemQuantity = useCartStore((state) => state.getItemQuantity);

  return {
    cartItems,
    isOpen,
    loading,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemQuantity,
  };
}

