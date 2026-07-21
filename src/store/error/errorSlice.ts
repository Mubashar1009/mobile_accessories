import type { ErrorSlice, ErrorState } from "@/types/store/error";
import { defaultErrorState } from "./defaults";
import { createErrorActions } from "./actions";

export const createErrorSlice = (
  set: (partial: Partial<ErrorState> | ((state: ErrorState) => Partial<ErrorState>)) => void,
  get: () => ErrorState
): ErrorSlice => ({
  ...defaultErrorState,
  ...createErrorActions(set, get),
});
