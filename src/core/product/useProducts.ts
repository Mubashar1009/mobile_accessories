"use client";

import { useCallback } from "react";
import { useProductStore } from "@/store/product/useProductStore";
import { getProducts as getBackendProducts } from "@/app/actions/product.actions";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
} from "@/lib/offlineCache";
import { dbProductSchema, type Product } from "@/types/product";

import { isPlaceholderSupabase } from "@/config/env";

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

// Helper to validate products array with Zod
function validateProducts(products: unknown[]): Product[] {
  const validProducts: Product[] = [];
  for (const item of products) {
    const validation = dbProductSchema.safeParse(item);
    if (validation.success) {
      validProducts.push(validation.data as Product);
    } else {
      console.warn("Invalid product item detected, skipping:", validation.error.format());
    }
  }
  return validProducts;
}

export function useProducts() {
  const {
    products,
    loading,
    refreshing,
    isOffline,
    isDemo,
    setProducts,
    setLoading,
    setRefreshing,
    setOffline,
    setIsDemo,
  } = useProductStore();

  const fetchProducts = useCallback(async (isBackgroundRefresh = false) => {
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

      // ── Step 3: Fetch fresh data from the real backend (Core/ProductService,
      // same path as the admin dashboard), with a 3s timeout ──
      const data = await withTimeout(getBackendProducts(), 3000);

      // A successful response is authoritative even when it's empty — an
      // empty catalog is a real state, not a reason to fall back to demo
      // data (that fallback is reserved for when the fetch itself fails).
      const validData = validateProducts(data);
      saveProducts(validData).catch(() => {});
      setProducts(validData);
      setIsDemo(false);
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
  }, [isDemo, setProducts, setLoading, setRefreshing, setOffline, setIsDemo]);

  const refetch = useCallback(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  return {
    products,
    loading,
    refreshing,
    isOffline,
    isDemo,
    fetchProducts,
    refetch,
    setOffline,
  };
}
