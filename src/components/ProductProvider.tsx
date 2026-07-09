"use client";

import { useEffect, type ReactNode } from "react";
import { useProducts } from "@/core/product/useProducts";

export function ProductProvider({ children }: { children: ReactNode }) {
  const { fetchProducts, setOffline } = useProducts();

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

export { useProducts };


