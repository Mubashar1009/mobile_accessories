"use client";

import { useCallback, useTransition, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAdminDashboardStore } from "@/store/adminDashboard/useAdminDashboardStore";
import { toggleOutOfStock, deleteProduct } from "@/lib/actions";
import type { Product } from "@/types/product";

export function useAdminDashboard(initialProducts: Product[]) {
  const {
    products,
    editProduct,
    editOpen,
    deletingId,
    setProducts,
    setEditProduct,
    setEditOpen,
    setDeletingId,
    updateProduct,
    removeProduct,
  } = useAdminDashboardStore(
    useShallow((s) => ({
      products: s.products,
      editProduct: s.editProduct,
      editOpen: s.editOpen,
      deletingId: s.deletingId,
      setProducts: s.setProducts,
      setEditProduct: s.setEditProduct,
      setEditOpen: s.setEditOpen,
      setDeletingId: s.setDeletingId,
      updateProduct: s.updateProduct,
      removeProduct: s.removeProduct,
    }))
  );

  const [isPending, startTransition] = useTransition();

  // Seed store with server-provided initial products on mount
  useEffect(() => {
    setProducts(initialProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStock = useCallback(
    (product: Product) => {
      startTransition(async () => {
        const result = await toggleOutOfStock(product.id, product.is_out_of_stock);
        if (!result?.error) {
          updateProduct({ ...product, is_out_of_stock: !product.is_out_of_stock });
        }
      });
    },
    [updateProduct]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Delete this product? This will also remove its image.")) return;
      setDeletingId(id);
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (!result?.error) removeProduct(id);
        setDeletingId(null);
      });
    },
    [setDeletingId, removeProduct]
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
