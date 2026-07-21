import type { AdminDashboardActions, AdminDashboardState } from "@/types/store/adminDashboard";

export const createAdminDashboardActions = (
  set: (partial: Partial<AdminDashboardState> | ((state: AdminDashboardState) => Partial<AdminDashboardState>)) => void,
  get: () => AdminDashboardState
): AdminDashboardActions => ({
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
});
