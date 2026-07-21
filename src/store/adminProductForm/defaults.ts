import type { AdminProductFormState } from "@/types/store/adminProductForm";

export const defaultAdminProductFormState: AdminProductFormState = {
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
