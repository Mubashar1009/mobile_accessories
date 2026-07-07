import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
  type Product,
} from "@/lib/db";
import { dbProductSchema } from "@/lib/types";

interface ProductState {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  isOffline: boolean;
  isDemo: boolean;
  setOffline: (offline: boolean) => void;
  fetchProducts: (isBackgroundRefresh?: boolean) => Promise<void>;
  refetch: () => void;
}

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

export const useProductStore = create<ProductState>((set, get) => ({
  products: DEMO_PRODUCTS,
  loading: false,
  refreshing: false,
  isOffline: false,
  isDemo: true,

  setOffline: (offline) => set({ isOffline: offline }),

  fetchProducts: async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      set({ refreshing: true });
    } else {
      set({ loading: true });
    }

    const browserOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;

    try {
      // ── Step 1: Skip Supabase if config is placeholder ──
      if (isPlaceholderSupabase()) {
        const cached = await getIDBProducts();
        const validCached = validateProducts(cached);
        if (validCached.length > 0) {
          set({ products: validCached, isDemo: false });
        } else {
          set({ products: DEMO_PRODUCTS, isDemo: true });
        }
        set({ isOffline: browserOffline });
        return;
      }

      // ── Step 2: Show cached data immediately while Supabase loads ──
      const cached = await getIDBProducts();
      const validCached = validateProducts(cached);
      if (validCached.length > 0) {
        set({ products: validCached, isDemo: false, loading: false });
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
          set({ products: validData, isDemo: false });
        } else {
          const idbFallback = await getIDBProducts();
          const validFallback = validateProducts(idbFallback);
          if (validFallback.length > 0) {
            set({ products: validFallback, isDemo: false });
          } else {
            set({ products: DEMO_PRODUCTS, isDemo: true });
          }
        }
        set({ isOffline: browserOffline });
        return;
      }

      // ── Step 4: Supabase returned error ──
      const currentProducts = get().products;
      if (currentProducts === DEMO_PRODUCTS) {
        const idbFallback = await getIDBProducts();
        const validFallback = validateProducts(idbFallback);
        set({
          products: validFallback.length > 0 ? validFallback : DEMO_PRODUCTS,
          isDemo: validFallback.length === 0,
        });
      }
      set({ isOffline: browserOffline });
    } catch {
      // Timeout or network error
      const currentProducts = get().products;
      if (currentProducts === DEMO_PRODUCTS) {
        const cached = await getIDBProducts();
        const validCached = validateProducts(cached);
        set({
          products: validCached.length > 0 ? validCached : DEMO_PRODUCTS,
          isDemo: validCached.length === 0,
        });
      }
      set({ isOffline: browserOffline });
    } finally {
      set({ loading: false, refreshing: false });
    }
  },

  refetch: () => {
    set({ products: DEMO_PRODUCTS, isDemo: true, isOffline: false });
    get().fetchProducts(false);
  },
}));
