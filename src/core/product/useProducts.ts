"use client";

import { useCallback } from "react";
import { useProductStore } from "@/store/product/useProductStore";
import { createClient } from "@/utils/supabase/client";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
} from "@/lib/db";
import { dbProductSchema, type Product } from "@/types/product";

function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return !url || url.includes("your-project-id") || url === "https://.supabase.co";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Supabase fetch timed out")), ms);
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
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const refreshing = useProductStore((state) => state.refreshing);
  const isOffline = useProductStore((state) => state.isOffline);
  const isDemo = useProductStore((state) => state.isDemo);
  
  const setProducts = useProductStore((state) => state.setProducts);
  const setLoading = useProductStore((state) => state.setLoading);
  const setRefreshing = useProductStore((state) => state.setRefreshing);
  const setOffline = useProductStore((state) => state.setOffline);
  const setIsDemo = useProductStore((state) => state.setIsDemo);

  const fetchProducts = useCallback(async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const browserOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

    try {
      // ── Step 1: Skip Supabase if config is placeholder ──
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

      // ── Step 2: Show cached data immediately while Supabase loads ──
      const cached = await getIDBProducts();
      const validCached = validateProducts(cached);
      if (validCached.length > 0) {
        setProducts(validCached);
        setIsDemo(false);
        setLoading(false);
      }

      // ── Step 3: Fetch fresh data from Supabase (with 3s timeout) ──
      const supabase = createClient();
      const supabasePromise = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await withTimeout(
        new Promise((resolve) => resolve(supabasePromise)) as Promise<Awaited<typeof supabasePromise>>,
        3000
      );

      if (!error && data) {
        const validData = validateProducts(data);
        if (validData.length > 0) {
          saveProducts(validData).catch(() => {});
          setProducts(validData);
          setIsDemo(false);
        } else {
          const idbFallback = await getIDBProducts();
          const validFallback = validateProducts(idbFallback);
          if (validFallback.length > 0) {
            setProducts(validFallback);
            setIsDemo(false);
          } else {
            setProducts(DEMO_PRODUCTS);
            setIsDemo(true);
          }
        }
        setOffline(browserOffline);
        return;
      }

      // ── Step 4: Supabase returned error ──
      if (products === DEMO_PRODUCTS) {
        const idbFallback = await getIDBProducts();
        const validFallback = validateProducts(idbFallback);
        setProducts(validFallback.length > 0 ? validFallback : DEMO_PRODUCTS);
        setIsDemo(validFallback.length === 0);
      }
      setOffline(browserOffline);
    } catch {
      // Timeout or network error
      if (products === DEMO_PRODUCTS) {
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
  }, [products, setProducts, setLoading, setRefreshing, setOffline, setIsDemo]);

  const refetch = useCallback(() => {
    setProducts(DEMO_PRODUCTS);
    setIsDemo(true);
    setOffline(false);
    fetchProducts(false);
  }, [setProducts, setIsDemo, setOffline, fetchProducts]);

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
