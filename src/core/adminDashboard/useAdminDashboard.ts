"use client";

import { useCallback, useTransition, useEffect } from "react";
import { useAdminDashboardStore } from "@/store/adminDashboard/useAdminDashboardStore";
import { useProducts } from "@/core/product/useProducts";
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

  const { products, error, seedProducts, toggleOutOfStock, remove } = useProducts();

  const [isPending, startTransition] = useTransition();

  // Seed the shared product store from the server-rendered list.
  //
  // `seedProducts` (not `setProducts`) so the demo/loading flags settle with
  // the data -- the storefront reads this same slice and would otherwise keep
  // showing its "demo products" banner over real rows.
  //
  // The dependency array is honest rather than eslint-disabled: re-running
  // when the server sends a new list is exactly the wanted behaviour (e.g.
  // after `revalidatePath` + `router.refresh()`). Writing the same rows again
  // is a no-op for rendering, so there is no loop to guard against.
  useEffect(() => {
    seedProducts(initialProducts);
  }, [initialProducts, seedProducts]);

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
