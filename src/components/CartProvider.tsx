"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  type Product,
  type CartItem,
  getCartItems as getIDBCartItems,
  saveCartItem as saveIDBCartItem,
  deleteCartItem as deleteIDBCartItem,
  clearCart as clearIDBCart,
} from "@/lib/db";

interface CartContextValue {
  cartItems: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemQuantity: (productId: string) => number;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cart from IndexedDB on mount
  useEffect(() => {
    async function loadCart() {
      try {
        const items = await getIDBCartItems();
        setCartItems(items);
      } catch (err) {
        console.error("Failed to load cart items from IndexedDB", err);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { id: product.id, product, quantity: 1 }];
      }
      
      // Persist to IndexedDB
      const targetItem = updated.find((item) => item.id === product.id)!;
      saveIDBCartItem(targetItem).catch(console.error);
      
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      
      // Persist to IndexedDB
      deleteIDBCartItem(productId).catch(console.error);
      
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      const targetItem = updated.find((item) => item.id === productId);
      if (targetItem) {
        saveIDBCartItem(targetItem).catch(console.error);
      }
      
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    clearIDBCart().catch(console.error);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const getItemQuantity = useCallback((productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemQuantity,
      loading,
    }),
    [
      cartItems,
      isOpen,
      setIsOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemQuantity,
      loading,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
