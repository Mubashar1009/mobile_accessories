import type { AdminDashboardSlice, AdminDashboardState } from "@/types/store/adminDashboard";
import { defaultAdminDashboardState } from "./defaults";
import { createAdminDashboardActions } from "./actions";

export const createAdminDashboardSlice = (
  set: (partial: Partial<AdminDashboardState> | ((state: AdminDashboardState) => Partial<AdminDashboardState>)) => void,
  get: () => AdminDashboardState
): AdminDashboardSlice => ({
  ...defaultAdminDashboardState,
  ...createAdminDashboardActions(set, get),
});
