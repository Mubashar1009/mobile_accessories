import { create } from "zustand";
import type { Product } from "@/types/product";

export interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // Search — plain, synchronous state only. Debounce timing lives in the
  // orchestration hook (useProducts), never here.
  searchTerm: string;
  searchResults: Product[];
  isSearching: boolean;
  setSearchTerm: (searchTerm: string) => void;
  setSearchResults: (searchResults: Product[]) => void;
  setSearching: (isSearching: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  removeProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  searchTerm: "",
  searchResults: [],
  isSearching: false,
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearching: (isSearching) => set({ isSearching }),
}));
