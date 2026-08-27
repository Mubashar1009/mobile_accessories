"use client";

import Link from "next/link";
import {
  Loader2,
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Wifi,
  Battery,
  Headphones,
} from "lucide-react";
import { useLogin } from "@/core/login/useLogin";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppRoutes } from "@/types/enums/routes";

const featureChips = [
  {
    icon: ShoppingBag,
    title: "Product Catalog",
    sub: "Browse & shop latest mobile accessories",
    bg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Headphones,
    title: "Smart Accessories",
    sub: "Earbuds, cables, power banks & more",
    bg: "bg-cyan-500/10 text-cyan-400",
  },
  {
    icon: Wifi,
    title: "Live Stock",
    sub: "Real-time stock updates & fast delivery",
    bg: "bg-indigo-500/10 text-indigo-400",
  },
  {
    icon: Battery,
    title: "Secure Account",
    sub: "Protected authentication by Supabase",
    bg: "bg-amber-500/10 text-amber-400",
  },
];

export default function LoginPage() {
  const {
    email,
    password,
    serverError,
    fieldErrors,
    loading,
    showPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    toggleShowPassword,
  } = useLogin();

  return (
    <Box className="relative flex min-h-screen overflow-hidden bg-[#080c12] font-sans">
      {/* Ambient background */}
      <Box
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(16,185,129,0.18),transparent_60%)] animate-pulse"
      />

      {/* Left panel */}
      <Box className="relative z-10 hidden flex-1 flex-col justify-center px-16 py-16 lg:flex xl:px-20">
        {/* Brand */}
        <Flex align="center" gap="xs" className="mb-16">
          <Flex align="center" justify="center" className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <ShoppingBag size={20} className="text-white" />
          </Flex>
          <Box as="span" className="text-base font-bold tracking-tight text-slate-100">
            Al-Rehman Mobile Shop
          </Box>
        </Flex>

        {/* Hero text */}
        <Paragraph className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
          Welcome Back
        </Paragraph>
        <Heading level="h1" className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-50">
          Sign in to your
          <br />
          <Box as="span" className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            account
          </Box>
        </Heading>
        <Paragraph className="mb-14 max-w-sm text-base leading-relaxed text-slate-400">
          Access your personal account, shop top mobile accessories, or manage products if you are an administrator.
        </Paragraph>

        {/* Feature chips */}
        <Box className="flex flex-col gap-3">
          {featureChips.map(({ icon: Icon, title, sub, bg }) => (
            <Flex
              key={title}
              align="center"
              gap="sm"
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-emerald-500/30"
            >
              <Flex align="center" justify="center" className={`h-9 w-9 shrink-0 rounded-xl ${bg}`}>
                <Icon size={17} />
              </Flex>
              <Box>
                <Paragraph className="text-sm font-semibold text-slate-200">{title}</Paragraph>
                <Paragraph className="text-xs text-slate-400">{sub}</Paragraph>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>

      {/* Right panel (form) */}
      <Flex align="center" justify="center" className="relative z-10 w-full flex-col px-6 py-12 lg:w-[480px] lg:shrink-0 lg:px-12">
        <Box className="w-full max-w-[400px] rounded-3xl border border-white/[0.08] bg-slate-900/70 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {/* Form header */}
          <Paragraph className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-400">
            Account Sign In
          </Paragraph>
          <Heading level="h2" className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
            Welcome back
          </Heading>
          <Paragraph className="mb-9 text-sm leading-relaxed text-slate-400">
            Enter your credentials to access your account.
          </Paragraph>

          {/* Server error */}
          {serverError && (
            <Flex align="center" gap="xs" role="alert" className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <Box as="span" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              {serverError}
            </Flex>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <Box>
              <Label htmlFor="login-email" className="mb-2 block text-xs font-semibold tracking-wide text-slate-400">
                Email address
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={15} />
                </Box>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className="bg-white/[0.04] py-3.5 pl-11 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                />
              </Box>
              {fieldErrors.email && (
                <Paragraph id="email-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <Box as="span">⚠</Box> {fieldErrors.email}
                </Paragraph>
              )}
            </Box>

            {/* Password */}
            <Box>
              <Label htmlFor="login-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-400">
                Password
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={15} />
                </Box>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className="bg-white/[0.04] py-3.5 pl-11 pr-12 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </Button>
              </Box>
              {fieldErrors.password && (
                <Paragraph id="password-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <Box as="span">⚠</Box> {fieldErrors.password}
                </Paragraph>
              )}
            </Box>

            {/* Submit */}
            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <Box className="mt-7 flex flex-col items-center gap-3 text-center">
            <Paragraph className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href={AppRoutes.SIGNUP} className="font-semibold text-emerald-400 hover:underline">
                Sign Up
              </Link>
            </Paragraph>
            <Link
              href={AppRoutes.HOME}
              className="text-xs text-slate-500 transition-colors hover:text-emerald-400"
            >
              ← Back to storefront
            </Link>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
