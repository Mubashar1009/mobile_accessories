"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, ChevronRight, Settings, LogOut, ShoppingBag } from "lucide-react";
// import { createClient } from "@/utils/supabase/client"; // commented for local dev
import { LoginModal } from "@/components/LoginModal";
import { useCart } from "@/components/CartProvider";

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
  { label: "LCD Panels", href: "/lcd-panels" },
  { label: "Parts", href: "/parts" },
  { label: "Cables", href: "/cables" },
];

export function Navbar() {
  const router = useRouter();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = useCallback(async () => {
    const adminEmails = (
      process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
    ).split(",");

    // Check mock cookie first
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

    // Supabase check commented for local dev
    /*
    try {
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
    */
    setUserEmail(null);
    setIsAdmin(false);
  }, []);

  const handleLogout = async () => {
    if (typeof document !== "undefined") {
      document.cookie = "mock-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    // Supabase sign-out commented for local dev
    // try { const supabase = createClient(); await supabase.auth.signOut(); } catch {}
    setUserEmail(null);
    setIsAdmin(false);
    setUserMenuOpen(false);
    router.refresh();
  };

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = () => setUserMenuOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [userMenuOpen]);

  useEffect(() => {
    const timer = setInterval(() => setAnnouncementIdx((i) => (i + 1) % announcements.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <span key={announcementIdx} className="transition-all duration-500">{announcements[announcementIdx]}</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <button className="p-1.5 sm:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">Rehvox</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="rounded-md px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/cart"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {userEmail ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <User className={`h-5 w-5 ${isAdmin ? "text-primary" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1.5 shadow-md z-50">
                      <div className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1 truncate font-medium">{userEmail}</div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
                          <Settings className="h-4 w-4 text-primary" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 text-left">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setLoginOpen(true)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Login">
                  <User className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
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

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-b bg-background sm:hidden">
          <nav className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="flex items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {link.label} <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
            <div className="my-2 border-t" />
            {userEmail ? (
              <div className="space-y-1.5 py-1.5">
                <div className="px-2 text-xs text-muted-foreground truncate">Signed in: {userEmail}</div>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                    Admin Panel <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 text-left">
                  Sign Out <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }} className="flex w-full items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                Admin Login <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </nav>
        </div>
      )}

      <LoginModal open={loginOpen} onOpenChange={(val) => { setLoginOpen(val); checkSession(); }} />
    </header>
  );
}
