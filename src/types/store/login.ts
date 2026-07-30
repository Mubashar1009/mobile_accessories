export interface LoginState {
  email: string;
  password: string;
  /** Server-level error (auth failure, network) */
  serverError: string | null;
  /** Per-field Zod validation errors */
  fieldErrors: {
    email?: string;
    password?: string;
  };
  loading: boolean;
  showPassword: boolean;
}

export interface LoginActions {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setServerError: (error: string | null) => void;
  setFieldErrors: (errors: LoginState["fieldErrors"]) => void;
  setLoading: (loading: boolean) => void;
  setShowPassword: (show: boolean) => void;
  resetForm: () => void;
}

export type LoginSlice = LoginState & LoginActions;
