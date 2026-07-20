import { create } from "zustand";

interface ProductCreateFormState {
  loading: boolean;
  error: string | null;
  imagePreview: string | null;
  title: string;
  description: string;
  price: string;
  isOutOfStock: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setImagePreview: (preview: string | null) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setIsOutOfStock: (val: boolean) => void;
  resetForm: () => void;
}

const defaultState = {
  loading: false,
  error: null,
  imagePreview: null,
  title: "",
  description: "",
  price: "",
  isOutOfStock: false,
};

export const useProductCreateFormStore = create<ProductCreateFormState>((set) => ({
  ...defaultState,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setPrice: (price) => set({ price }),
  setIsOutOfStock: (isOutOfStock) => set({ isOutOfStock }),
  resetForm: () => set(defaultState),
}));
