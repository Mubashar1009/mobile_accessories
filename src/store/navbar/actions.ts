import type { NavbarActions, NavbarState } from "@/types/store/navbar";

export const createNavbarActions = (
  set: (partial: Partial<NavbarState> | ((state: NavbarState) => Partial<NavbarState>)) => void,
  get: () => NavbarState
): NavbarActions => ({
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setAnnouncementIdx: (idx) =>
    set((state) => ({
      announcementIdx: typeof idx === "function" ? idx(state.announcementIdx) : idx,
    })),
  setScrolled: (scrolled) => set({ scrolled }),
  setUserMenuOpen: (userMenuOpen) => set({ userMenuOpen }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
});
