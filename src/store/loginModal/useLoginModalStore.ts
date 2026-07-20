import { create } from "zustand";

interface LoginModalState {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
}

const defaultState = {
  email: "",
  password: "",
  error: null,
  loading: false,
};

export const useLoginModalStore = create<LoginModalState>((set) => ({
  ...defaultState,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  resetForm: () => set(defaultState),
}));
