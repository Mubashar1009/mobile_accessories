import type { ProductState } from "@/types/store/product";
import { DEMO_PRODUCTS } from "@/lib/offlineCache";

export const defaultProductState: ProductState = {
  // Seeded with sample data so the storefront renders something on the very
  // first paint; `fetchProducts` replaces it (and clears `isDemo`) as soon
  // as the backend answers.
  products: DEMO_PRODUCTS,
  loading: false,
  refreshing: false,
  isOffline: false,
  isDemo: true,
  error: null,
  searchTerm: "",
  searchResults: [],
  isSearching: false,
};
