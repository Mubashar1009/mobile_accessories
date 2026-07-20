"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, ChevronRight, Settings, LogOut, ShoppingBag } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { useCart } from "@/core/cart/useCart";
import { useNavbar } from "@/core/navbar/useNavbar";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";

const navLinks = [
  { label: "Home", href: "/" },
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

  // Only modal open state stays as useState (per architecture rule)
  const [loginOpen, setLoginOpen] = useState(false);

  const {
    mobileOpen,
    searchOpen,
    searchQuery,
    announcementIdx,
    scrolled,
    userMenuOpen,
    userEmail,
    isAdmin,
    announcements,
    setSearchQuery,
    setMobileOpen,
    setUserMenuOpen,
    checkSession,
    handleLogout,
    handleSearch,
    toggleMobileOpen,
    toggleSearchOpen,
    toggleUserMenuOpen,
  } = useNavbar();

  useEffect(() => {
    checkSession();
  }, [checkSession, loginOpen]);

  return (
    <Box as="header" className={`sticky top-0 z-50 bg-background transition-shadow ${scrolled ? "shadow-md" : ""}`}>
      {/* Announcement strip */}
      <Box className="bg-primary text-primary-foreground">
        <Flex align="center" justify="center" className="mx-auto h-8 max-w-7xl px-4 text-xs font-medium sm:text-sm">
          <Box as="span" key={announcementIdx} className="transition-all duration-500">{announcements[announcementIdx]}</Box>
        </Flex>
      </Box>

      {/* Main nav */}
      <Box className="border-b">
        <Flex align="center" justify="between" className="mx-auto h-16 max-w-7xl px-4 sm:px-6">
          {/* Left: Menu button + Logo */}
          <Flex align="center" gap="sm">
            <button className="p-1.5 lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={toggleMobileOpen} aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Flex align="center" justify="center" className="h-9 w-9 rounded-lg bg-primary">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </Flex>
              <Box as="span" className="text-sm font-bold tracking-tight text-foreground sm:text-base">Al-Rehman Mobile Shop</Box>
            </Link>
          </Flex>

          {/* Desktop nav */}
          <Box as="nav" className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="rounded-md px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </Box>

          {/* Right icons */}
          <Flex align="center" gap="xs">
            <button onClick={toggleSearchOpen} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/cart"
              className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Box as="span" className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in-50">
                  {cartCount}
                </Box>
              )}
            </Link>

            <Box className="relative" onClick={(e) => e.stopPropagation()}>
              {userEmail ? (
                <>
                  <button onClick={toggleUserMenuOpen} className="flex items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <User className={`h-5 w-5 ${isAdmin ? "text-primary" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <Box className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1.5 shadow-md z-50">
                      <Box className="px-2 py-1.5 text-xs text-muted-foreground border-b mb-1 truncate font-medium">{userEmail}</Box>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
                          <Settings className="h-4 w-4 text-primary" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => handleLogout()} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 text-left">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </Box>
                  )}
                </>
              ) : (
                <button onClick={() => setLoginOpen(true)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Login">
                  <User className="h-5 w-5" />
                </button>
              )}
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Search bar */}
      {searchOpen && (
        <Box className="border-b bg-background">
          <Box className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <form onSubmit={handleSearch}>
              <Box className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search earbuds, headphones, speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </Box>
            </form>
          </Box>
        </Box>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <Box className="border-b bg-background lg:hidden">
          <Box as="nav" className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="flex items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {link.label} <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
            <Box className="my-2 border-t" />
            {userEmail ? (
              <Box className="space-y-1.5 py-1.5">
                <Box className="px-2 text-xs text-muted-foreground truncate">Signed in: {userEmail}</Box>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                    Admin Panel <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 text-left">
                  Sign Out <ChevronRight className="h-4 w-4" />
                </button>
              </Box>
            ) : (
              <button onClick={() => { setMobileOpen(false); setLoginOpen(true); }} className="flex w-full items-center justify-between rounded-md py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent text-left">
                Admin Login <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </Box>
        </Box>
      )}

      <LoginModal open={loginOpen} onOpenChange={(val) => { setLoginOpen(val); checkSession(); }} />
    </Box>
  );
}
