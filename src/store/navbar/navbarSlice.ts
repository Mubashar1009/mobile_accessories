import type { NavbarSlice, NavbarState } from "@/types/store/navbar";
import { defaultNavbarState } from "./defaults";
import { createNavbarActions } from "./actions";

export const createNavbarSlice = (
  set: (partial: Partial<NavbarState> | ((state: NavbarState) => Partial<NavbarState>)) => void,
  get: () => NavbarState
): NavbarSlice => ({
  ...defaultNavbarState,
  ...createNavbarActions(set, get),
});
