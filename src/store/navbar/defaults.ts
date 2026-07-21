import type { NavbarState } from "@/types/store/navbar";

export const defaultNavbarState: NavbarState = {
  mobileOpen: false,
  searchOpen: false,
  searchQuery: "",
  announcementIdx: 0,
  scrolled: false,
  userMenuOpen: false,
  userEmail: null,
  isAdmin: false,
};
