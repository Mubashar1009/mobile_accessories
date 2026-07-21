import type { AdminProductFormActions, AdminProductFormState } from "@/types/store/adminProductForm";
import { defaultAdminProductFormState } from "./defaults";

export const createAdminProductFormActions = (
  set: (partial: Partial<AdminProductFormState> | ((state: AdminProductFormState) => Partial<AdminProductFormState>)) => void,
  get: () => AdminProductFormState
): AdminProductFormActions => ({
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setErrors: (errors) => set({ errors }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setTitle: (title) => set({ title }),
  setCategory: (category) => set({ category }),
  setPrice: (price) => set({ price }),
  setOriginalPrice: (originalPrice) => set({ originalPrice }),
  setColors: (colors) => set({ colors }),
  setTag: (tag) => set({ tag }),
  setIsOutOfStock: (isOutOfStock) => set({ isOutOfStock }),
  setDescription: (description) => set({ description }),
  resetForm: () => set(defaultAdminProductFormState),
});
