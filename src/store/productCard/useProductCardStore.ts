import { create } from "zustand";

interface ProductCardState {
  imgErrors: Record<string, boolean>;
  liked: Record<string, boolean>;
  setImgError: (productId: string, error: boolean) => void;
  setLiked: (productId: string, liked: boolean) => void;
}

export const useProductCardStore = create<ProductCardState>((set) => ({
  imgErrors: {},
  liked: {},
  setImgError: (productId, error) =>
    set((state) => ({ imgErrors: { ...state.imgErrors, [productId]: error } })),
  setLiked: (productId, liked) =>
    set((state) => ({ liked: { ...state.liked, [productId]: liked } })),
}));
