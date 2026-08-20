"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  LogIn,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { useCart } from "@/core/cart/useCart";
import { useNavbar } from "@/core/navbar/useNavbar";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Paragraph } from "@/components/ui/paragraph";
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
          <Flex align="center" gap="xs" className="sm:gap-2 min-w-0 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground h-9 w-9 shrink-0"
              onClick={toggleMobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link href={AppRoutes.HOME} className="flex items-center gap-2 shrink-0">
              <Flex align="center" justify="center" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary shrink-0">
                <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary-foreground" />
              </Flex>
              <Box className="flex flex-col justify-center sm:flex-row sm:items-center sm:gap-1 leading-tight sm:leading-none">
                <Box as="span" className="text-xs sm:text-base font-extrabold tracking-tight text-foreground whitespace-nowrap">
                  Al-Rehman
                </Box>
                <Box as="span" className="text-[11px] sm:text-base font-extrabold tracking-tight text-emerald-500 sm:text-foreground whitespace-nowrap">
                  Mobile Shop
                </Box>
              </Box>
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
          <Flex align="center" gap="xs" className="shrink-0">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearchOpen}
              className="text-muted-foreground hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </Button>

            {/* Cart Link */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Cart"
            >
              <Link href={AppRoutes.CART}>
                <ShoppingBag className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <Box as="span" className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-in zoom-in-50">
                    {cartCount}
                  </Box>
                )}
              </Link>
            </Button>

            {/* User Icon & Account Dropdown */}
            <Box className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserMenuOpen();
                }}
                className={`relative text-muted-foreground hover:text-foreground ${userEmail ? "text-primary font-bold" : ""}`}
                aria-label="User Account"
                id="user-menu-btn"
              >
                <User className="h-5 w-5" />
                {userEmail && (
                  <Box as="span" className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </Button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-popover p-2 shadow-xl z-50 animate-in fade-in-80 zoom-in-95"
                >
                  {!userEmail ? (
                    /* Guest Options */
                    <Box className="flex flex-col gap-1">
                      <Paragraph className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Account Access
                      </Paragraph>
                      <Link
                        href={AppRoutes.LOGIN}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <LogIn className="h-4 w-4 text-emerald-500" />
                        Sign In
                      </Link>
                      <Link
                        href={AppRoutes.SIGNUP}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <UserPlus className="h-4 w-4 text-cyan-500" />
                        Sign Up
                      </Link>
                    </Box>
                  ) : (
                    /* Logged In Options */
                    <Box className="flex flex-col gap-1">
                      <Box className="border-b pb-2 mb-1 px-3 pt-1">
                        <Paragraph className="truncate text-xs font-semibold text-foreground">
                          {userEmail}
                        </Paragraph>
                        <Flex align="center" gap="xs" className="mt-0.5">
                          <Box as="span" className={`inline-block h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-amber-400" : "bg-emerald-400"}`} />
                          <Paragraph className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {isAdmin ? "Admin Account" : "User Account"}
                          </Paragraph>
                        </Flex>
                      </Box>

                      {/* Admin-only options */}
                      {isAdmin && (
                        <>
                          <Link
                            href={AppRoutes.DASHBOARD}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                          >
                            <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href={AppRoutes.CREATE_PRODUCT}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                          >
                            <PlusCircle className="h-4 w-4 text-cyan-500" />
                            Add New Product
                          </Link>
                          <Box className="border-b my-1" />
                        </>
                      )}

                      {/* Sign Out */}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </Box>
                  )}
                </Box>
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

            {/* Mobile Account Section */}
            <Box className="border-t mt-2 pt-3 pb-2">
              {!userEmail ? (
                <Flex gap="xs">
                  <Button asChild variant="outline" className="w-1/2 justify-center gap-1.5 text-xs" onClick={() => setMobileOpen(false)}>
                    <Link href={AppRoutes.LOGIN}>
                      <LogIn className="h-3.5 w-3.5 text-emerald-500" /> Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-1/2 justify-center gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setMobileOpen(false)}>
                    <Link href={AppRoutes.SIGNUP}>
                      <UserPlus className="h-3.5 w-3.5" /> Sign Up
                    </Link>
                  </Button>
                </Flex>
              ) : (
                <Box className="flex flex-col gap-2">
                  <Box className="px-1">
                    <Paragraph className="truncate text-xs font-semibold text-foreground">{userEmail}</Paragraph>
                    <Paragraph className="text-[10px] text-muted-foreground uppercase">{isAdmin ? "Admin Account" : "User Account"}</Paragraph>
                  </Box>

                  {isAdmin && (
                    <>
                      <Link
                        href={AppRoutes.DASHBOARD}
                        className="flex items-center justify-between rounded-md py-2 text-sm font-medium text-emerald-500"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Dashboard <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={AppRoutes.CREATE_PRODUCT}
                        className="flex items-center justify-between rounded-md py-2 text-sm font-medium text-cyan-500"
                        onClick={() => setMobileOpen(false)}
                      >
                        Add New Product <ChevronRight className="h-4 w-4" />
                      </Link>
                    </>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-center gap-2 mt-1"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
