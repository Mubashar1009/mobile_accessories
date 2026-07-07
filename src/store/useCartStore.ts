import { create } from "zustand";
import {
  type Product,
  type CartItem,
  getCartItems as getIDBCartItems,
  saveCartItem as saveIDBCartItem,
  deleteCartItem as deleteIDBCartItem,
  clearCart as clearIDBCart,
} from "@/lib/db";
import { dbProductSchema, cartItemSchema } from "@/lib/types";
import { z } from "zod";

interface CartState {
  cartItems: CartItem[];
  isOpen: boolean;
  loading: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemQuantity: (productId: string) => number;
  loadCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  isOpen: false,
  loading: true,

  setIsOpen: (open) => set({ isOpen: open }),

  loadCart: async () => {
    set({ loading: true });
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
      
      set({ cartItems: validItems });
    } catch (err) {
      console.error("Failed to load cart items from IndexedDB", err);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: (product) => {
    // Validate product structure using Zod
    const productValidation = dbProductSchema.safeParse(product);
    if (!productValidation.success) {
      console.error("Cannot add invalid product to cart:", productValidation.error.format());
      return;
    }

    const { cartItems } = get();
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

    set({ cartItems: updated });
    saveIDBCartItem(targetItem).catch(console.error);
  },

  removeFromCart: (productId) => {
    const { cartItems } = get();
    const updated = cartItems.filter((item) => item.id !== productId);
    set({ cartItems: updated });
    deleteIDBCartItem(productId).catch(console.error);
  },

  updateQuantity: (productId, quantity) => {
    // Validate quantity with Zod
    const quantityValidation = z.number().int().safeParse(quantity);
    if (!quantityValidation.success) {
      console.error("Invalid quantity updated:", quantityValidation.error.format());
      return;
    }

    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const { cartItems } = get();
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
      set({ cartItems: updated });
      saveIDBCartItem(targetItem).catch(console.error);
    }
  },

  clearCart: () => {
    set({ cartItems: [] });
    clearIDBCart().catch(console.error);
  },

  getCartTotal: () => {
    return get().cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getItemQuantity: (productId) => {
    const item = get().cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  },
}));
