export interface LoginModalState {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

export interface LoginModalActions {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
}

export type LoginModalSlice = LoginModalState & LoginModalActions;
