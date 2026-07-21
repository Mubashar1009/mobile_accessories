import type { AdminDashboardState } from "@/types/store/adminDashboard";

export const defaultAdminDashboardState: AdminDashboardState = {
  products: [],
  editProduct: null,
  editOpen: false,
  deletingId: null,
};
