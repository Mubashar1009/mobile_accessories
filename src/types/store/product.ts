import type { Product } from "../product";

export interface ProductState {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  isOffline: boolean;
  isDemo: boolean;
}

export interface ProductActions {
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setOffline: (offline: boolean) => void;
  setIsDemo: (isDemo: boolean) => void;
}

export type ProductSlice = ProductState & ProductActions;
