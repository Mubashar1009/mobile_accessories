import { create } from "zustand";

interface AdminProductFormState {
  loading: boolean;
  error: string | null;
  errors: Record<string, string>;
  imagePreview: string | null;
  title: string;
  category: string;
  price: string;
  originalPrice: string;
  colors: string;
  tag: string;
  isOutOfStock: boolean;
  description: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setErrors: (errors: Record<string, string>) => void;
  setImagePreview: (preview: string | null) => void;
  setTitle: (title: string) => void;
  setCategory: (category: string) => void;
  setPrice: (price: string) => void;
  setOriginalPrice: (price: string) => void;
  setColors: (colors: string) => void;
  setTag: (tag: string) => void;
  setIsOutOfStock: (val: boolean) => void;
  setDescription: (description: string) => void;
  resetForm: () => void;
}

const defaultState = {
  loading: false,
  error: null,
  errors: {},
  imagePreview: null,
  title: "",
  category: "earbuds",
  price: "",
  originalPrice: "",
  colors: "",
  tag: "",
  isOutOfStock: false,
  description: "",
};

export const useAdminProductFormStore = create<AdminProductFormState>((set) => ({
  ...defaultState,
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
  resetForm: () => set(defaultState),
}));
