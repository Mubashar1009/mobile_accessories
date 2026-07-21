import type { ProductCardActions, ProductCardState } from "@/types/store/productCard";

export const createProductCardActions = (
  set: (partial: Partial<ProductCardState> | ((state: ProductCardState) => Partial<ProductCardState>)) => void,
  get: () => ProductCardState
): ProductCardActions => ({
  setImgError: (productId, error) =>
    set((state) => ({ imgErrors: { ...state.imgErrors, [productId]: error } })),
  setLiked: (productId, liked) =>
    set((state) => ({ liked: { ...state.liked, [productId]: liked } })),
});
