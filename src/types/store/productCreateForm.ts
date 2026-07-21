export interface ProductCreateFormState {
  loading: boolean;
  error: string | null;
  imagePreview: string | null;
  title: string;
  description: string;
  price: string;
  isOutOfStock: boolean;
}

export interface ProductCreateFormActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setImagePreview: (preview: string | null) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setIsOutOfStock: (val: boolean) => void;
  resetForm: () => void;
}

export type ProductCreateFormSlice = ProductCreateFormState & ProductCreateFormActions;
