"use client";

import { useCallback, useEffect } from "react";
import { useNavbarStore } from "@/store/navbar/useNavbarStore";
import { useRouter } from "next/navigation";

const announcements = ["New Arrivals — Shop the Latest Collection Now"];

export function useNavbar() {
  const router = useRouter();

  const {
    mobileOpen,
    searchOpen,
    searchQuery,
    announcementIdx,
    scrolled,
    userMenuOpen,
    userEmail,
    isAdmin,
    setMobileOpen,
    setSearchOpen,
    setSearchQuery,
    setAnnouncementIdx,
    setScrolled,
    setUserMenuOpen,
    setUserEmail,
    setIsAdmin,
  } = useNavbarStore();

  const checkSession = useCallback(async () => {
    const adminEmails = (
      process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
    ).split(",");

    const mockEmail =
      typeof document !== "undefined"
        ? document.cookie.match(/(^|;)\s*mock-admin-session\s*=\s*([^;]+)/)?.[2]
        : null;

    if (mockEmail) {
      const decoded = decodeURIComponent(mockEmail);
      setUserEmail(decoded);
      setIsAdmin(adminEmails.includes(decoded));
      return;
    }

    setUserEmail(null);
    setIsAdmin(false);
  }, [setUserEmail, setIsAdmin]);

  const handleLogout = useCallback(async () => {
    if (typeof document !== "undefined") {
      document.cookie = "mock-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    setUserEmail(null);
    setIsAdmin(false);
    setUserMenuOpen(false);
    router.refresh();
  }, [setUserEmail, setIsAdmin, setUserMenuOpen, router]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery, router, setSearchOpen, setSearchQuery]
  );

  const toggleMobileOpen = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen, setMobileOpen]);

  const toggleSearchOpen = useCallback(() => {
    setSearchOpen(!searchOpen);
  }, [searchOpen, setSearchOpen]);

  const toggleUserMenuOpen = useCallback(() => {
    setUserMenuOpen(!userMenuOpen);
  }, [userMenuOpen, setUserMenuOpen]);

  // Announcement ticker
  useEffect(() => {
    const timer = setInterval(
      () => setAnnouncementIdx((i) => (i + 1) % announcements.length),
      4000
    );
    return () => clearInterval(timer);
  }, [setAnnouncementIdx]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScrolled]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = () => setUserMenuOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [userMenuOpen, setUserMenuOpen]);

  return {
    // State
    mobileOpen,
    searchOpen,
    searchQuery,
    announcementIdx,
    scrolled,
    userMenuOpen,
    userEmail,
    isAdmin,
    announcements,
    // Setters
    setMobileOpen,
    setSearchOpen,
    setSearchQuery,
    setUserMenuOpen,
    // Actions
    checkSession,
    handleLogout,
    handleSearch,
    toggleMobileOpen,
    toggleSearchOpen,
    toggleUserMenuOpen,
  };
}
