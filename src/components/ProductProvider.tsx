"use client";

import { useEffect, type ReactNode } from "react";
import { useProductStore } from "@/store/useProductStore";

export function ProductProvider({ children }: { children: ReactNode }) {
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const setOffline = useProductStore((state) => state.setOffline);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      fetchProducts(true);
    };
    const handleOffline = () => {
      setOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Set initial offline state if needed
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchProducts, setOffline]);

  return <>{children}</>;
}

export function useProducts() {
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const refreshing = useProductStore((state) => state.refreshing);
  const isOffline = useProductStore((state) => state.isOffline);
  const isDemo = useProductStore((state) => state.isDemo);
  const refetch = useProductStore((state) => state.refetch);

  return {
    products,
    loading,
    refreshing,
    isOffline,
    isDemo,
    refetch,
  };
}

