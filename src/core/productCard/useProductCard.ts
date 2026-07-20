"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useProductCardStore } from "@/store/productCard/useProductCardStore";
import { useCart } from "@/core/cart/useCart";
import type { Product } from "@/types/product";

export function useProductCard(productId: string) {
  const { imgErrors, liked, setImgError, setLiked } = useProductCardStore(
    useShallow((s) => ({
      imgErrors: s.imgErrors,
      liked: s.liked,
      setImgError: s.setImgError,
      setLiked: s.setLiked,
    }))
  );

  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const imgError = imgErrors[productId] ?? false;
  const isLiked = liked[productId] ?? false;
  const quantity = getItemQuantity(productId);

  const handleImgError = useCallback(() => {
    setImgError(productId, true);
  }, [productId, setImgError]);

  const toggleLiked = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setLiked(productId, !isLiked);
    },
    [productId, isLiked, setLiked]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
    },
    [addToCart]
  );

  const handleUpdateQuantity = useCallback(
    (qty: number) => {
      updateQuantity(productId, qty);
    },
    [productId, updateQuantity]
  );

  return {
    // State
    imgError,
    isLiked,
    quantity,
    // Actions
    handleImgError,
    toggleLiked,
    handleAddToCart,
    handleUpdateQuantity,
  };
}
