"use client";

import { useCallback } from "react";
import { useCartStore } from "@/store/cart/useCartStore";
import {
  getCartItems as getIDBCartItems,
  saveCartItem as saveIDBCartItem,
  deleteCartItem as deleteIDBCartItem,
  clearCart as clearIDBCart,
} from "@/lib/db";
import { cartItemSchema, type CartItem } from "@/types/cart";
import { dbProductSchema, type Product } from "@/types/product";
import { z } from "zod";

export function useCart() {
  const {
    cartItems,
    isOpen,
    loading,
    setCartItems,
    setIsOpen,
    setLoading,
  } = useCartStore();

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getIDBCartItems();
      
      // Validate loaded items using Zod to ensure state safety
      const validItems: CartItem[] = [];
      for (const item of items) {
        const validation = cartItemSchema.safeParse(item);
        if (validation.success) {
          validItems.push(validation.data as CartItem);
        } else {
          console.warn("Invalid cart item detected in IndexedDB, skipping:", validation.error.format());
        }
      }
      
      setCartItems(validItems);
    } catch (err) {
      console.error("Failed to load cart items from IndexedDB", err);
    } finally {
      setLoading(false);
    }
  }, [setCartItems, setLoading]);

  const addToCart = useCallback((product: Product) => {
    // Validate product structure using Zod
    const productValidation = dbProductSchema.safeParse(product);
    if (!productValidation.success) {
      console.error("Cannot add invalid product to cart:", productValidation.error.format());
      return;
    }

    const existing = cartItems.find((item) => item.id === product.id);
    let updated: CartItem[];

    if (existing) {
      updated = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...cartItems, { id: product.id, product, quantity: 1 }];
    }

    // Validate the updated item
    const targetItem = updated.find((item) => item.id === product.id)!;
    const itemValidation = cartItemSchema.safeParse(targetItem);
    if (!itemValidation.success) {
      console.error("Validation failed for added cart item:", itemValidation.error.format());
      return;
    }

    setCartItems(updated);
    saveIDBCartItem(targetItem).catch(console.error);
  }, [cartItems, setCartItems]);

  const removeFromCart = useCallback((productId: string) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    setCartItems(updated);
    deleteIDBCartItem(productId).catch(console.error);
  }, [cartItems, setCartItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    // Validate quantity with Zod
    const quantityValidation = z.number().int().safeParse(quantity);
    if (!quantityValidation.success) {
      console.error("Invalid quantity updated:", quantityValidation.error.format());
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );

    const targetItem = updated.find((item) => item.id === productId);
    if (targetItem) {
      const itemValidation = cartItemSchema.safeParse(targetItem);
      if (!itemValidation.success) {
        console.error("Validation failed for updated cart item:", itemValidation.error.format());
        return;
      }
      setCartItems(updated);
      saveIDBCartItem(targetItem).catch(console.error);
    }
  }, [cartItems, setCartItems, removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    clearIDBCart().catch(console.error);
  }, [setCartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  return {
    cartItems,
    isOpen,
    loading,
    setIsOpen,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemQuantity,
  };
}
