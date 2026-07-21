export interface ErrorState {
  errors: {
    adminDashboard: string | null;
    adminProductForm: string | null;
    cart: string | null;
    loginModal: string | null;
    navbar: string | null;
    product: string | null;
    productCard: string | null;
    productCreateForm: string | null;
    productEditDialog: string | null;
  };
}

export interface ErrorActions {
  setError: (feature: keyof ErrorState["errors"], error: string | null) => void;
  clearError: (feature: keyof ErrorState["errors"]) => void;
  clearAllErrors: () => void;
}

export type ErrorSlice = ErrorState & ErrorActions;
