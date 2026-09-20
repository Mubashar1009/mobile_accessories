"use client";

import { useCallback } from "react";
import { useProductStore } from "@/store/product/useProductStore";
import { productFrontendService } from "@/lib/frontend/ProductFrontendService";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
} from "@/lib/offlineCache";
import { validateProducts } from "@/lib/products/validateProducts";
import type { ProductInput } from "@/types/product";
import { isPlaceholderSupabase } from "@/config/env";

/** How long the storefront waits for the backend before falling back to cache. */
const FETCH_TIMEOUT_MS = 3000;

/** Debounce for the admin product search input. */
const SEARCH_DEBOUNCE_MS = 300;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Product fetch timed out")), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/**
 * The ONE way any component reaches product state — storefront reads and
 * admin mutations alike.
 *
 * There used to be two hooks with this name over two different stores:
 * this one (storefront: offline cache, demo fallback) and
 * `src/hooks/useProducts.ts` (admin: create/update/delete/search). Because
 * they wrote to different stores, an admin edit never reached the
 * storefront. They are merged here, over the root store's `product` slice.
 *
 * Components never import `useProductStore` or `ProductFrontendService`
 * directly — going through this hook lets either one change shape later
 * without touching a component.
 */
export function useProducts() {
  const {
    products,
    loading,
    refreshing,
    isOffline,
    isDemo,
    error,
    searchTerm,
    searchResults,
    isSearching,
    setProducts,
    seedProducts,
    setLoading,
    setRefreshing,
    setOffline,
    setIsDemo,
    setSearchTerm: setSearchTermRaw,
  } = useProductStore();

  // ── Storefront read path ────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (isBackgroundRefresh = false) => {
      if (isBackgroundRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const browserOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

      try {
        // ── Step 1: Skip the backend if config is placeholder ──
        if (isPlaceholderSupabase()) {
          const cached = await getIDBProducts();
          const validCached = validateProducts(cached);
          if (validCached.length > 0) {
            setProducts(validCached);
            setIsDemo(false);
          } else {
            setProducts(DEMO_PRODUCTS);
            setIsDemo(true);
          }
          setOffline(browserOffline);
          return;
        }

        // ── Step 2: Show cached data immediately while the backend loads ──
        const cached = await getIDBProducts();
        const validCached = validateProducts(cached);
        if (validCached.length > 0) {
          setProducts(validCached);
          setIsDemo(false);
          setLoading(false);
        }

        // ── Step 3: Fetch fresh data from the real backend ──
        // `fetchAll` already validates the rows and seeds the store, so
        // there is nothing to re-validate or re-seed here.
        const data = await withTimeout(productFrontendService.fetchAll(), FETCH_TIMEOUT_MS);

        // A successful response is authoritative even when it is empty — an
        // empty catalog is a real state, not a reason to fall back to demo
        // data (that fallback is reserved for when the fetch itself fails).
        saveProducts(data).catch(() => {});
        setOffline(browserOffline);
      } catch {
        // Timeout or backend error
        if (isDemo) {
          const cached = await getIDBProducts();
          const validCached = validateProducts(cached);
          setProducts(validCached.length > 0 ? validCached : DEMO_PRODUCTS);
          setIsDemo(validCached.length === 0);
        }
        setOffline(browserOffline);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      // `isDemo` (a boolean) replaces a previous `products === DEMO_PRODUCTS`
      // reference check — that depended on `products`, a fresh array on every
      // successful fetch, which gave this callback a new identity every time
      // it ran and re-triggered ProductProvider's `[fetchProducts]` effect,
      // causing an unbounded refetch loop. `isDemo` is always set alongside
      // `products` in every branch above, so it's an equivalent check that
      // only changes when the demo/real-data status actually flips.
    },
    [isDemo, setProducts, setLoading, setRefreshing, setOffline, setIsDemo]
  );

  const refetch = useCallback(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  // ── Admin mutation path ─────────────────────────────────────────────
  const create = useCallback(
    (input: ProductInput, formData: FormData) => productFrontendService.create(input, formData),
    []
  );
  const update = useCallback(
    (id: string, input: Partial<ProductInput>, formData?: FormData) =>
      productFrontendService.update(id, input, formData),
    []
  );
  const remove = useCallback((id: string) => productFrontendService.remove(id), []);
  const toggleOutOfStock = useCallback(
    (id: string, currentStatus: boolean) =>
      productFrontendService.toggleOutOfStock(id, currentStatus),
    []
  );

  // ── Search ──────────────────────────────────────────────────────────
  // The network request only fires after the user stops typing.
  const debouncedSearch = useDebouncedCallback((term: string) => {
    void productFrontendService.searchProducts(term);
  }, SEARCH_DEBOUNCE_MS);

  const setSearchTerm = useCallback(
    (term: string) => {
      // (a) the controlled <input> updates immediately, never lagging
      // behind keystrokes...
      setSearchTermRaw(term);
      // (b) ...while the actual search request is debounced.
      debouncedSearch(term);
    },
    [setSearchTermRaw, debouncedSearch]
  );

  return {
    // State
    products,
    loading,
    refreshing,
    isOffline,
    isDemo,
    error,
    // Reads
    fetchProducts,
    refetch,
    setOffline,
    // Seeds the store from server-fetched data (e.g. a page's
    // `initialProducts` prop) — not a mutation, so it bypasses
    // ProductFrontendService and writes straight to the store.
    seedProducts,
    // Mutations
    create,
    update,
    remove,
    toggleOutOfStock,
    // Search
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm,
  };
}
