import type { AdminProductFormSlice, AdminProductFormState } from "@/types/store/adminProductForm";
import { defaultAdminProductFormState } from "./defaults";
import { createAdminProductFormActions } from "./actions";

export const createAdminProductFormSlice = (
  set: (partial: Partial<AdminProductFormState> | ((state: AdminProductFormState) => Partial<AdminProductFormState>)) => void,
  get: () => AdminProductFormState
): AdminProductFormSlice => ({
  ...defaultAdminProductFormState,
  ...createAdminProductFormActions(set, get),
});
