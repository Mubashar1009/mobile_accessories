import { create } from "zustand";

interface ProductEditDialogState {
  loading: boolean;
  error: string | null;
  errors: Record<string, string>;
  imagePreview: string | null;
  title: string;
  description: string;
  price: string;
  category: string;
  colors: string;
  isOutOfStock: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setErrors: (errors: Record<string, string>) => void;
  setImagePreview: (preview: string | null) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setCategory: (category: string) => void;
  setColors: (colors: string) => void;
  setIsOutOfStock: (val: boolean) => void;
  resetForm: () => void;
}

const defaultState = {
  loading: false,
  error: null,
  errors: {},
  imagePreview: null,
  title: "",
  description: "",
  price: "",
  category: "earbuds",
  colors: "",
  isOutOfStock: false,
};

export const useProductEditDialogStore = create<ProductEditDialogState>((set) => ({
  ...defaultState,
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
  resetForm: () => set(defaultState),
}));
