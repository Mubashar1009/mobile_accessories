export interface ProductEditDialogState {
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
}

export interface ProductEditDialogActions {
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

export type ProductEditDialogSlice = ProductEditDialogState & ProductEditDialogActions;
