import type { ProductCreateFormState } from "@/types/store/productCreateForm";

export const defaultProductCreateFormState: ProductCreateFormState = {
  loading: false,
  error: null,
  imagePreview: null,
  title: "",
  description: "",
  price: "",
  isOutOfStock: false,
};
