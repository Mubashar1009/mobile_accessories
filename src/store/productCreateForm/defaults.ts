import type { ProductCreateFormState } from "@/types/store/productCreateForm";

export const defaultProductCreateFormState: ProductCreateFormState = {
  loading: false,
  error: null,
  imagePreview: null,
  title: "",
  category: "earbuds",
  description: "",
  price: "",
  isOutOfStock: false,
};
