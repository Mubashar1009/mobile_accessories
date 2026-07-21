export interface ProductCardState {
  imgErrors: Record<string, boolean>;
  liked: Record<string, boolean>;
}

export interface ProductCardActions {
  setImgError: (productId: string, error: boolean) => void;
  setLiked: (productId: string, liked: boolean) => void;
}

export type ProductCardSlice = ProductCardState & ProductCardActions;
