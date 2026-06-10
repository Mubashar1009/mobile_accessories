"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
  type Product,
} from "@/lib/db";

// ── Context shape ──────────────────────────────────────────────────────
interface ProductContextValue {
  products: Product[];
  loading: boolean;    // true only on first load (before any data is available)
  refreshing: boolean; // true while background refresh is happening
  isOffline: boolean;
  isDemo: boolean;
  refetch: () => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

// ── Detect placeholder Supabase config ──────────────────────────────────
function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return !url || url.includes("your-project-id") || url === "https://.supabase.co";
}

// ── Timeout wrapper for Supabase fetch ─────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Supabase fetch timed out")), ms);
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((e) => { clearTimeout(timer); reject(e); });
  });
}

// ── Singleton: ensure only one fetch happens app-wide ──────────────────
let globalProducts: Product[] | null = null;
let globalFetchPromise: Promise<void> | null = null;
let globalIsDemo = false;
let globalIsOffline = false;

export function ProductProvider({ children }: { children: ReactNode }) {
  // Initialize with cached global data or DEMO_PRODUCTS — NEVER show empty + spinner
  const [products, setProducts] = useState<Product[]>(globalProducts ?? DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false); // start false: data is already available
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(globalIsOffline);
  const [isDemo, setIsDemo] = useState(globalIsDemo || globalProducts === null);
  const mountedRef = useRef(true);

  const fetchProducts = useCallback(async (isBackgroundRefresh = false) => {
    // Dedupe: if a fetch is already in-flight, piggyback on it
    if (globalFetchPromise) {
      await globalFetchPromise;
      if (mountedRef.current && globalProducts !== null) {
        setProducts(globalProducts);
        setIsDemo(globalIsDemo);
        setIsOffline(globalIsOffline);
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    if (!isBackgroundRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    const browserOffline =
      typeof navigator !== "undefined" && !navigator.onLine;

    globalFetchPromise = (async () => {
      try {
        // ── Step 1: Instant display from IndexedDB (parallel with Supabase) ──
        const idbPromise = globalProducts === null ? getIDBProducts() : Promise.resolve(null);

        // ── Step 2: Skip Supabase entirely if config is placeholder ──
        if (isPlaceholderSupabase()) {
          const cached = await idbPromise;
          if (cached && cached.length > 0) {
            globalProducts = cached;
            globalIsDemo = false;
          } else {
            globalProducts = DEMO_PRODUCTS;
            globalIsDemo = true;
          }
          globalIsOffline = browserOffline;
          if (mountedRef.current) {
            setProducts(globalProducts);
            setIsDemo(globalIsDemo);
            setIsOffline(globalIsOffline);
            setLoading(false);
            setRefreshing(false);
          }
          return;
        }

        // ── Step 3: Show cached data immediately while Supabase loads ──
        const cached = await idbPromise;
        if (cached && cached.length > 0 && mountedRef.current) {
          globalProducts = cached;
          globalIsDemo = false;
          setProducts(cached);
          setIsDemo(false);
          setLoading(false); // data visible, no more spinner
        }

        // ── Step 4: Fetch fresh data from Supabase (with 3s timeout) ──
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
          if (data.length > 0) {
            saveProducts(data as Product[]).catch(() => {});
            globalProducts = data as Product[];
            globalIsDemo = false;
            if (mountedRef.current) {
              setProducts(globalProducts);
              setIsDemo(false);
            }
          } else {
            const idbFallback = await getIDBProducts();
            if (idbFallback.length > 0) {
              globalProducts = idbFallback;
              globalIsDemo = false;
              if (mountedRef.current) {
                setProducts(idbFallback);
                setIsDemo(false);
              }
            } else {
              globalProducts = DEMO_PRODUCTS;
              globalIsDemo = true;
              if (mountedRef.current) {
                setProducts(DEMO_PRODUCTS);
                setIsDemo(true);
              }
            }
          }
          globalIsOffline = browserOffline;
          if (mountedRef.current) setIsOffline(browserOffline);
          return;
        }

        // ── Step 5: Supabase returned error — keep IDB/demo data ──
        if (globalProducts === null) {
          const idbFallback = await getIDBProducts();
          globalProducts = idbFallback.length > 0 ? idbFallback : DEMO_PRODUCTS;
          globalIsDemo = idbFallback.length === 0;
        }
        globalIsOffline = browserOffline;
        if (mountedRef.current) {
          setProducts(globalProducts);
          setIsDemo(globalIsDemo);
          setIsOffline(browserOffline);
        }
      } catch {
        // Network/API error or timeout — keep whatever data we have
        if (globalProducts === null) {
          const cached = await getIDBProducts();
          globalProducts = cached.length > 0 ? cached : DEMO_PRODUCTS;
          globalIsDemo = cached.length === 0;
        }
        globalIsOffline = browserOffline;
        if (mountedRef.current) {
          setProducts(globalProducts);
          setIsDemo(globalIsDemo);
          setIsOffline(browserOffline);
        }
      } finally {
        globalFetchPromise = null;
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    await globalFetchPromise;
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true;
    fetchProducts(false);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProducts]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDemo(false);
      fetchProducts(true);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    globalProducts = null;
    globalFetchPromise = null;
    globalIsDemo = false;
    globalIsOffline = false;
    fetchProducts(false);
  }, [fetchProducts]);

  const value = useMemo<ProductContextValue>(
    () => ({ products, loading, refreshing, isOffline, isDemo, refetch }),
    [products, loading, refreshing, isOffline, isDemo, refetch]
  );

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

// ── Hook: consume the global product context ───────────────────────────
export function useProducts(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error("useProducts must be used within a <ProductProvider>");
  }
  return ctx;
}
