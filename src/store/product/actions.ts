import type { ProductActions, ProductState } from "@/types/store/product";

export const createProductActions = (
  set: (partial: Partial<ProductState> | ((state: ProductState) => Partial<ProductState>)) => void,
  _get: () => ProductState
): ProductActions => ({
  setProducts: (products) => set({ products }),
  seedProducts: (products) => set({ products, isDemo: false, loading: false, error: null }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  removeProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setOffline: (offline) => set({ isOffline: offline }),
  setIsDemo: (isDemo) => set({ isDemo }),
  setError: (error) => set({ error }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearching: (isSearching) => set({ isSearching }),
});
