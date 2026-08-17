"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/core/cart/useCart";
import { useNavbar } from "@/core/navbar/useNavbar";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppRoutes } from "@/types/enums/routes";

const navLinks = [
  { label: "Home", href: AppRoutes.HOME },
  { label: "Earbuds", href: AppRoutes.EARBUDS },
  { label: "Headphones", href: AppRoutes.HEADPHONES },
  { label: "Speakers", href: AppRoutes.SPEAKERS },
  { label: "Power Banks", href: AppRoutes.POWER_BANKS },
  { label: "Smart Trackers", href: AppRoutes.SMART_TRACKERS },
  { label: "LCD Panels", href: AppRoutes.LCD_PANELS },
  { label: "Parts", href: AppRoutes.PARTS },
  { label: "Cables", href: AppRoutes.CABLES },
];

export function Navbar() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const {
    mobileOpen,
    searchOpen,
    searchQuery,
    announcementIdx,
    scrolled,
    announcements,
    setSearchQuery,
    setMobileOpen,
    checkSession,
    handleSearch,
    toggleMobileOpen,
    toggleSearchOpen,
  } = useNavbar();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={toggleMobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link href={AppRoutes.HOME} className="flex items-center gap-2.5">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearchOpen}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Cart"
            >
              <Link href={AppRoutes.CART}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Box as="span" className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in-50">
                    {cartCount}
                  </Box>
                )}
              </Link>
            </Button>
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
                <Input
                  type="text"
                  placeholder="Search earbuds, headphones, speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted/50 pl-10"
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
          </Box>
        </Box>
      )}
    </Box>
  );
}
