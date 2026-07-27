import { useRootStore } from "../useRootStore";
import { useShallow } from "zustand/react/shallow";
import type { NavbarSlice } from "@/types/store/navbar";

export function useNavbarStore(): NavbarSlice;
export function useNavbarStore<T>(selector: (state: NavbarSlice) => T): T;
export function useNavbarStore<T>(selector?: (state: NavbarSlice) => T) {
  if (selector) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRootStore((state) => selector(state.navbar));
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useRootStore(useShallow((state) => state.navbar));
}
