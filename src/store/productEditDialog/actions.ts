import type { ProductEditDialogActions, ProductEditDialogState } from "@/types/store/productEditDialog";
import { defaultProductEditDialogState } from "./defaults";

export const createProductEditDialogActions = (
  set: (partial: Partial<ProductEditDialogState> | ((state: ProductEditDialogState) => Partial<ProductEditDialogState>)) => void,
  get: () => ProductEditDialogState
): ProductEditDialogActions => ({
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setErrors: (errors) => set({ errors }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setPrice: (price) => set({ price }),
  setCategory: (category) => set({ category }),
  setColors: (colors) => set({ colors }),
  setIsOutOfStock: (isOutOfStock) => set({ isOutOfStock }),
  resetForm: () => set(defaultProductEditDialogState),
});
