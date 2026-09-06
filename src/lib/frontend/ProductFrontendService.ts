"use client";

import { toast } from "sonner";
import { useProductStore } from "@/lib/store/productStore";
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

/**
 * Client-side counterpart to the backend's `ProductService`: the one place
 * that calls the product Server Actions and syncs the result into
 * `productStore`. Only `src/hooks/useProducts.ts` calls this; components
 * never do.
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

  async fetchAll(): Promise<Product[]> {
    const { setLoading, setError, setProducts } = useProductStore.getState();
    setLoading(true);
    setError(null);
    try {
      const products = await getProducts();
      setProducts(products);
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
    const { setLoading, setError } = useProductStore.getState();
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
    const { setLoading, setError } = useProductStore.getState();
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
    const { setLoading, setError, removeProduct } = useProductStore.getState();
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
    const { setLoading, setError, products, updateProduct: setProductInStore } = useProductStore.getState();
    setLoading(true);
    setError(null);
    try {
      const result = await toggleOutOfStockAction(id, currentStatus);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
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
    const { setSearching, setSearchResults } = useProductStore.getState();
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
