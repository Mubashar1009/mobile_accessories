import type { ErrorActions, ErrorState } from "@/types/store/error";
import { defaultErrorState } from "./defaults";

export const createErrorActions = (
  set: (partial: Partial<ErrorState> | ((state: ErrorState) => Partial<ErrorState>)) => void,
  get: () => ErrorState
): ErrorActions => ({
  setError: (feature, error) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [feature]: error,
      },
    })),
  clearError: (feature) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [feature]: null,
      },
    })),
  clearAllErrors: () => set({ errors: defaultErrorState.errors }),
});
