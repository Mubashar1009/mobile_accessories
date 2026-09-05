"use client";

import { useCallback, useTransition, useEffect } from "react";
import { useAdminDashboardStore } from "@/store/adminDashboard/useAdminDashboardStore";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

export function useAdminDashboard(initialProducts: Product[]) {
  const {
    editProduct,
    editOpen,
    deletingId,
    setEditProduct,
    setEditOpen,
    setDeletingId,
  } = useAdminDashboardStore();

  const { products, error, setProducts, toggleOutOfStock, remove } = useProducts();

  const [isPending, startTransition] = useTransition();

  // Seed the shared product store with server-provided initial products on mount
  useEffect(() => {
    setProducts(initialProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStock = useCallback(
    (product: Product) => {
      startTransition(async () => {
        await toggleOutOfStock(product.id, product.is_out_of_stock);
      });
    },
    [toggleOutOfStock]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Delete this product? This will also remove its image.")) return;
      setDeletingId(id);
      startTransition(async () => {
        await remove(id);
        setDeletingId(null);
      });
    },
    [setDeletingId, remove]
  );

  const handleEdit = useCallback(
    (product: Product) => {
      setEditProduct(product);
      setEditOpen(true);
    },
    [setEditProduct, setEditOpen]
  );

  return {
    // State
    products,
    error,
    editProduct,
    editOpen,
    deletingId,
    isPending,
    // Setters
    setEditOpen,
    // Actions
    handleToggleStock,
    handleDelete,
    handleEdit,
  };
}
