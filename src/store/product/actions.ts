import type { ProductActions, ProductState } from "@/types/store/product";

export const createProductActions = (
  set: (partial: Partial<ProductState> | ((state: ProductState) => Partial<ProductState>)) => void,
  get: () => ProductState
): ProductActions => ({
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setOffline: (offline) => set({ isOffline: offline }),
  setIsDemo: (isDemo) => set({ isDemo }),
});
