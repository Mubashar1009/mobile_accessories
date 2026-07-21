import type { Product } from "../product";

export interface AdminDashboardState {
  products: Product[];
  editProduct: Product | null;
  editOpen: boolean;
  deletingId: string | null;
}

export interface AdminDashboardActions {
  setProducts: (products: Product[]) => void;
  setEditProduct: (product: Product | null) => void;
  setEditOpen: (open: boolean) => void;
  setDeletingId: (id: string | null) => void;
  updateProduct: (updated: Product) => void;
  removeProduct: (id: string) => void;
}

export type AdminDashboardSlice = AdminDashboardState & AdminDashboardActions;
