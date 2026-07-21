import type { ErrorState } from "@/types/store/error";

export const defaultErrorState: ErrorState = {
  errors: {
    adminDashboard: null,
    adminProductForm: null,
    cart: null,
    loginModal: null,
    navbar: null,
    product: null,
    productCard: null,
    productCreateForm: null,
    productEditDialog: null,
  },
};
