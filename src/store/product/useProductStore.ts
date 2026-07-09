import { create } from "zustand";
import type { Product } from "@/types/product";
import { DEMO_PRODUCTS } from "@/lib/db";

interface ProductState {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  isOffline: boolean;
  isDemo: boolean;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setOffline: (offline: boolean) => void;
  setIsDemo: (isDemo: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: DEMO_PRODUCTS,
  loading: false,
  refreshing: false,
  isOffline: false,
  isDemo: true,
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setOffline: (offline) => set({ isOffline: offline }),
  setIsDemo: (isDemo) => set({ isDemo }),
}));
