"use client";

import { useEffect, type ReactNode } from "react";
import { useCart } from "@/core/cart/useCart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { loadCart } = useCart();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return <>{children}</>;
}

export { useCart };


