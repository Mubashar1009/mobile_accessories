import { create } from "zustand";

interface NavbarState {
  mobileOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  announcementIdx: number;
  scrolled: boolean;
  userMenuOpen: boolean;
  userEmail: string | null;
  isAdmin: boolean;
  setMobileOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setAnnouncementIdx: (idx: number | ((prev: number) => number)) => void;
  setScrolled: (scrolled: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  setUserEmail: (email: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useNavbarStore = create<NavbarState>((set) => ({
  mobileOpen: false,
  searchOpen: false,
  searchQuery: "",
  announcementIdx: 0,
  scrolled: false,
  userMenuOpen: false,
  userEmail: null,
  isAdmin: false,
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
}));
