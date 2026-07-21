export interface AdminProductFormState {
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
}

export interface AdminProductFormActions {
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

export type AdminProductFormSlice = AdminProductFormState & AdminProductFormActions;
