"use client";

import { useCallback, useEffect } from "react";
import { useNavbarStore } from "@/store/navbar/useNavbarStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AppRoutes } from "@/types/enums/routes";
import { UserRole } from "@/types/enums/roles";

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
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? null);
        const { data: userRow } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(userRow?.role === UserRole.ADMIN);
        return;
      }
    } catch {
      // ignore
    }

    setUserEmail(null);
    setIsAdmin(false);
  }, [setUserEmail, setIsAdmin]);

  const handleLogout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
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
        router.push(`${AppRoutes.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
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
