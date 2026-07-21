export interface NavbarState {
  mobileOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  announcementIdx: number;
  scrolled: boolean;
  userMenuOpen: boolean;
  userEmail: string | null;
  isAdmin: boolean;
}

export interface NavbarActions {
  setMobileOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setAnnouncementIdx: (idx: number | ((prev: number) => number)) => void;
  setScrolled: (scrolled: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  setUserEmail: (email: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export type NavbarSlice = NavbarState & NavbarActions;
