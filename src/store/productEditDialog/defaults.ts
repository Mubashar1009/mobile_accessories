import type { ProductEditDialogState } from "@/types/store/productEditDialog";

export const defaultProductEditDialogState: ProductEditDialogState = {
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
