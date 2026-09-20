"use client";

import { toast } from "sonner";
import { useRootStore } from "@/store/useRootStore";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleOutOfStock as toggleOutOfStockAction,
  searchProductsAction,
} from "@/app/actions/product.actions";
import type { ProductActionResult } from "@/lib/services/ProductService";
import type { Product, ProductInput } from "@/types/product";
import { validateProducts } from "@/lib/products/validateProducts";
import type { ProductSlice } from "@/types/store/product";

/**
 * Client-side counterpart to the backend's `ProductService`: the one place
 * that calls the product Server Actions and syncs the result into the
 * product slice of the root store. Only `src/core/product/useProducts.ts`
 * calls this; components never do.
 *
 * It writes to `useRootStore`'s `product` slice — the same slice the
 * storefront reads. It previously wrote to a separate standalone store,
 * which is why admin mutations never showed up on the storefront.
 *
 * `create`/`update`/`toggleOutOfStock`/`remove` don't get the mutated row
 * back from their Server Actions (they return `{ success? , error? }`), so
 * — no optimistic reconstruction — a successful mutation re-fetches the
 * authoritative list via `fetchAll`, except `remove` and
 * `toggleOutOfStock`, where the correct post-mutation state (drop the row /
 * flip one flag) is unambiguous from what the caller already has.
 */
export class ProductFrontendService {
  // Guards against out-of-order responses when overlapping searches fire
  // (e.g. the debounced call from an earlier keystroke resolves after a
  // later one) — no HTTP abort/cancellation needed for a project this size,
  // just discard a response that's no longer the latest request.
  private latestRequestId = 0;

  private get store(): ProductSlice {
    return useRootStore.getState().product;
  }

  async fetchAll(): Promise<Product[]> {
    const { setLoading, setError, seedProducts } = this.store;
    setLoading(true);
    setError(null);
    try {
      // Validated here, at the single point every caller gets rows from,
      // so no consumer ever sees a malformed row.
      const products = validateProducts(await getProducts());
      // `seedProducts`, not `setProducts`: a successful Server Action
      // response is real backend data, so the demo flag has to clear with it
      // — otherwise the storefront keeps showing "showing demo products"
      // over rows that came from the database.
      seedProducts(products);
      return products;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load products.";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async create(input: ProductInput, formData: FormData): Promise<ProductActionResult> {
    const { setLoading, setError } = this.store;
    setLoading(true);
    setError(null);
    try {
      const result = await createProduct(input, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        await this.fetchAll();
        toast.success("Product created successfully.");
      }
      return result;
    } finally {
      setLoading(false);
    }
  }

  async update(id: string, input: Partial<ProductInput>, formData?: FormData): Promise<ProductActionResult> {
    const { setLoading, setError } = this.store;
    setLoading(true);
    setError(null);
    try {
      const result = await updateProduct(id, input, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        await this.fetchAll();
        toast.success("Product updated successfully.");
      }
      return result;
    } finally {
      setLoading(false);
    }
  }

  async remove(id: string): Promise<ProductActionResult> {
    const { setLoading, setError, removeProduct } = this.store;
    setLoading(true);
    setError(null);
    try {
      const result = await deleteProduct(id);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        removeProduct(id);
        toast.success("Product deleted successfully.");
      }
      return result;
    } finally {
      setLoading(false);
    }
  }

  async toggleOutOfStock(id: string, currentStatus: boolean): Promise<ProductActionResult> {
    const { setLoading, setError } = this.store;
    setLoading(true);
    setError(null);
    try {
      const result = await toggleOutOfStockAction(id, currentStatus);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        // Re-read the slice rather than closing over `products` from the
        // top of the method: the awaited Server Action above gives other
        // updates a chance to land first, and a stale array would undo them.
        const { products, updateProduct: setProductInStore } = this.store;
        const existing = products.find((p) => p.id === id);
        if (existing) {
          setProductInStore({ ...existing, is_out_of_stock: !currentStatus });
        }
        toast.success(currentStatus ? "Product marked in stock." : "Product marked out of stock.");
      }
      return result;
    } finally {
      setLoading(false);
    }
  }

  async searchProducts(term: string): Promise<void> {
    const { setSearching, setSearchResults } = this.store;
    const requestId = ++this.latestRequestId;
    setSearching(true);
    try {
      const results = await searchProductsAction(term);
      // A newer search may have started (and possibly already resolved)
      // while this one was in flight — only the latest request is allowed
      // to write to the store.
      if (requestId === this.latestRequestId) {
        setSearchResults(results);
      }
    } catch (err) {
      if (requestId === this.latestRequestId) {
        toast.error(err instanceof Error ? err.message : "Search failed.");
      }
    } finally {
      if (requestId === this.latestRequestId) {
        setSearching(false);
      }
    }
  }
}

export const productFrontendService = new ProductFrontendService();
