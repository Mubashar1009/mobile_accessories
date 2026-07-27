import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { AdminDashboardSlice } from "@/types/store/adminDashboard";

export function useAdminDashboardStore(): AdminDashboardSlice;
export function useAdminDashboardStore<T>(selector: (state: AdminDashboardSlice) => T): T;
export function useAdminDashboardStore<T>(selector?: (state: AdminDashboardSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.adminDashboard));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.adminDashboard));
}
