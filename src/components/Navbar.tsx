"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, ChevronRight, Settings, LogOut } from "lucide-react";
import { createClient } from "@/supabase/client";
import { LoginModal } from "@/components/LoginModal";

const announcements = [
  "365 Days Warranty on All Products",
  "New Arrivals — Shop the Latest Collection Now",
];

const navLinks = [
  { label: "Earbuds", href: "/earbuds" },
  { label: "Headphones", href: "/headphones" },
  { label: "Speakers", href: "/speakers" },
  { label: "Power Banks", href: "/power-banks" },
  { label: "Smart Trackers", href: "/smart-trackers" },
];

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Authentication State
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = useCallback(async () => {
    const adminEmails = (
      process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
    ).split(",");

    // Check mock cookie first
    const mockEmail = typeof document !== "undefined"
      ? document.cookie.match(/(^|;)\s*mock-admin-session\s*=\s*([^;]+)/)?.[2]
      : null;

    if (mockEmail) {
      const decoded = decodeURIComponent(mockEmail);
      setUserEmail(decoded);
      setIsAdmin(adminEmails.includes(decoded));
      return;
    }

    // Otherwise, check Supabase
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isPlaceholder = !url || url.includes("your-project-id") || url === "https://.supabase.co";
      if (isPlaceholder) {
        setUserEmail(null);
        setIsAdmin(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setIsAdmin(adminEmails.includes(user.email));
      } else {
        setUserEmail(null);
        setIsAdmin(false);
      }
    } catch {
      setUserEmail(null);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = async () => {
    // Clear mock cookie
    if (typeof document !== "undefined") {
      document.cookie = "mock-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isPlaceholder = !url || url.includes("your-project-id") || url === "https://.supabase.co";
      if (!isPlaceholder) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Supabase signout failed:", err);
    }

    setUserEmail(null);
    setIsAdmin(false);
    setUserMenuOpen(false);
    router.refresh();
  };

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = () => setUserMenuOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [userMenuOpen]);

  // Rotate announcements
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((i) => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Track scroll for sticky shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession, loginOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-background transition-shadow ${scrolled ? "shadow-md" : ""}`}>
      {/* Announcement strip */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-xs font-medium sm:text-sm">
          <span className="transition-all duration-500">{announcements[announcementIdx]}</span>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Mobile menu toggle */}
          <button
            className="p-1.5 sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-black text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Ronin
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User / Admin Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {userEmail ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="User Menu"
                  >
                    <User className={`h-5 w-5 ${isAdmin ? "text-primary animate-pulse" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1.5 shadow-md z-50 animate-in fade-in-50 slide-in-from-top-1">
                      <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1 truncate font-medium">
                        {userEmail}
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-foreground"
                        >
                          <Settings className="h-4 w-4 text-primary" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 text-left font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Admin Login"
                >
                  <User className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <div className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search earbuds, headphones, speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="border-b bg-background sm:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
            <div className="my-2 border-t" />
            {userEmail ? (
              <div className="space-y-1.5 py-1.5">
                <div className="px-2 text-xs text-muted-foreground truncate">
                  Signed in: {userEmail}
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 text-left"
                >
                  Sign Out
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLoginOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-left"
              >
                Admin Login
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </nav>
        </div>
      )}

      <LoginModal open={loginOpen} onOpenChange={(val) => { setLoginOpen(val); checkSession(); }} />
    </header>
  );
}
