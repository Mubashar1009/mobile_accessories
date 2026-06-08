"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/supabase/client";
import {
  saveProducts,
  getProducts as getIDBProducts,
  DEMO_PRODUCTS,
  type Product,
} from "@/lib/db";

interface UseProductSyncResult {
  products: Product[];
  loading: boolean;
  isOffline: boolean;
  isDemo: boolean;
  refetch: () => void;
}

export function useProductSync(): UseProductSyncResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setIsOffline(false);
    setIsDemo(false);

    // Only show offline banner when the browser itself is offline
    const browserOffline = typeof navigator !== "undefined" && !navigator.onLine;

    try {
      // Try fetching from Supabase first
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          // Sync to IndexedDB for offline access
          await saveProducts(data as Product[]);
          setProducts(data as Product[]);
        } else {
          // Supabase connected but table is empty — check IDB, then demo
          const cached = await getIDBProducts();
          if (cached.length > 0) {
            setProducts(cached);
          } else {
            setProducts(DEMO_PRODUCTS);
            setIsDemo(true);
          }
        }
        setIsOffline(browserOffline);
        return;
      }

      // Supabase fetch failed — fall back to IndexedDB
      const cached = await getIDBProducts();
      if (cached.length > 0) {
        setProducts(cached);
        setIsOffline(browserOffline);
      } else {
        // No Supabase, no cached data — show demo products
        setProducts(DEMO_PRODUCTS);
        setIsDemo(true);
        setIsOffline(browserOffline);
      }
    } catch {
      // Network/API error — serve from IndexedDB or demo
      const cached = await getIDBProducts();
      if (cached.length > 0) {
        setProducts(cached);
      } else {
        setProducts(DEMO_PRODUCTS);
        setIsDemo(true);
      }
      setIsOffline(browserOffline);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDemo(false);
      fetchProducts(); // Re-sync when back online
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

  return { products, loading, isOffline, isDemo, refetch: fetchProducts };
}
