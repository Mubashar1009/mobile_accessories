export interface SignupState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  /** Server-level error (auth failure, network) */
  serverError: string | null;
  /** Success message (e.g. account created, confirm email) */
  successMessage: string | null;
  /** Per-field Zod validation errors */
  fieldErrors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  loading: boolean;
  showPassword: boolean;
}

export interface SignupActions {
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setServerError: (error: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
  setFieldErrors: (errors: SignupState["fieldErrors"]) => void;
  setLoading: (loading: boolean) => void;
  setShowPassword: (show: boolean) => void;
  resetForm: () => void;
}

export type SignupSlice = SignupState & SignupActions;
