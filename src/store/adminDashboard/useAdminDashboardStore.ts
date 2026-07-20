import { create } from "zustand";
import type { Product } from "@/types/product";

interface AdminDashboardState {
  products: Product[];
  editProduct: Product | null;
  editOpen: boolean;
  deletingId: string | null;
  setProducts: (products: Product[]) => void;
  setEditProduct: (product: Product | null) => void;
  setEditOpen: (open: boolean) => void;
  setDeletingId: (id: string | null) => void;
  updateProduct: (updated: Product) => void;
  removeProduct: (id: string) => void;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  products: [],
  editProduct: null,
  editOpen: false,
  deletingId: null,
  setProducts: (products) => set({ products }),
  setEditProduct: (editProduct) => set({ editProduct }),
  setEditOpen: (editOpen) => set({ editOpen }),
  setDeletingId: (deletingId) => set({ deletingId }),
  updateProduct: (updated) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === updated.id ? updated : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));
