import type { Product } from "../product";

/**
 * The single source of truth for product state.
 *
 * This slice used to have a rival: a standalone `create()` store at
 * `src/lib/store/productStore.ts`, read through `src/hooks/useProducts.ts`.
 * The storefront (Storefront, CategoryPageLayout, /search, ProductProvider)
 * read THIS slice, while every admin mutation (create/update/delete/toggle)
 * wrote the OTHER one — so an admin's change never reached the storefront
 * that was supposed to display it. Both stacks are merged here; nothing may
 * reintroduce a second product store.
 */
export interface ProductState {
  products: Product[];
  /** First load — the storefront shows a full-page spinner for this. */
  loading: boolean;
  /** Background refresh — deliberately non-blocking, no spinner. */
  refreshing: boolean;
  isOffline: boolean;
  /** True while showing bundled sample data because no backend answered. */
  isDemo: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: Product[];
  isSearching: boolean;
}

export interface ProductActions {
  setProducts: (products: Product[]) => void;
  /**
   * Seeds the store from server-rendered data (a page's `initialProducts`).
   * Distinct from `setProducts` because it also settles the flags that
   * describe *where* the data came from: real, server-fetched rows are by
   * definition neither demo data nor still loading.
   */
  seedProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setOffline: (offline: boolean) => void;
  setIsDemo: (isDemo: boolean) => void;
  setError: (error: string | null) => void;
  // Search — plain, synchronous state only. Debounce timing lives in the
  // orchestration hook (useProducts), never here.
  setSearchTerm: (searchTerm: string) => void;
  setSearchResults: (searchResults: Product[]) => void;
  setSearching: (isSearching: boolean) => void;
}

export type ProductSlice = ProductState & ProductActions;
