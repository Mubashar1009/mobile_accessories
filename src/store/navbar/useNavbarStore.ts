import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { NavbarSlice } from "@/types/store/navbar";

export function useNavbarStore(): NavbarSlice;
export function useNavbarStore<T>(selector: (state: NavbarSlice) => T): T;
export function useNavbarStore<T>(selector?: (state: NavbarSlice) => T) {
  if (selector) {
    return useRootStore((state) => selector(state.navbar));
  }
  return useRootStore(useShallow((state) => state.navbar));
}
