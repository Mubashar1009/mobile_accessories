"use client";

import { useCallback } from "react";
import { useProductStore } from "@/lib/store/productStore";
import { productFrontendService } from "@/lib/frontend/ProductFrontendService";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import type { ProductInput } from "@/types/product";

/**
 * The only way a component reaches the product list and its mutations.
 * Components never import `useProductStore` or `ProductFrontendService`
 * directly — going through this hook lets either one change shape later
 * without touching any component.
 */
export function useProducts() {
  const products = useProductStore((s) => s.products);
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const setProducts = useProductStore((s) => s.setProducts);

  const searchTerm = useProductStore((s) => s.searchTerm);
  const searchResults = useProductStore((s) => s.searchResults);
  const isSearching = useProductStore((s) => s.isSearching);
  const setSearchTermRaw = useProductStore((s) => s.setSearchTerm);

  const fetchAll = () => productFrontendService.fetchAll();
  const create = (input: ProductInput, formData: FormData) => productFrontendService.create(input, formData);
  const update = (id: string, input: Partial<ProductInput>, formData?: FormData) =>
    productFrontendService.update(id, input, formData);
  const remove = (id: string) => productFrontendService.remove(id);
  const toggleOutOfStock = (id: string, currentStatus: boolean) =>
    productFrontendService.toggleOutOfStock(id, currentStatus);

  // The network request only fires 300ms after the user stops typing —
  // matching this project's other debounced inputs.
  const debouncedSearch = useDebouncedCallback(
    (term: string) => {
      void productFrontendService.searchProducts(term);
    },
    300
  );

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
    products,
    isLoading,
    error,
    // Seeds the store from server-fetched data (e.g. a page's
    // `initialProducts` prop) — not a mutation, so it bypasses
    // ProductFrontendService and writes straight to the store.
    setProducts,
    fetchAll,
    create,
    update,
    remove,
    toggleOutOfStock,
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm,
  };
}
