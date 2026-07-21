import type { ProductCreateFormActions, ProductCreateFormState } from "@/types/store/productCreateForm";
import { defaultProductCreateFormState } from "./defaults";

export const createProductCreateFormActions = (
  set: (partial: Partial<ProductCreateFormState> | ((state: ProductCreateFormState) => Partial<ProductCreateFormState>)) => void,
  get: () => ProductCreateFormState
): ProductCreateFormActions => ({
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setPrice: (price) => set({ price }),
  setIsOutOfStock: (isOutOfStock) => set({ isOutOfStock }),
  resetForm: () => set(defaultProductCreateFormState),
});
