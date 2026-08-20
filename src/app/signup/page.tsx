"use client";

import Link from "next/link";
import {
  Loader2,
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useSignup } from "@/core/signup/useSignup";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppRoutes } from "@/types/enums/routes";

const highlights = [
  {
    icon: Sparkles,
    title: "Exclusive Member Deals",
    sub: "Access special discounts on mobile accessories",
    bg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Zap,
    title: "Fast Checkout & Orders",
    sub: "Save your preferences & track order status effortlessly",
    bg: "bg-cyan-500/10 text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure Account",
    sub: "Your credentials & data are protected by Supabase Auth",
    bg: "bg-indigo-500/10 text-indigo-400",
  },
];

export default function SignupPage() {
  const {
    name,
    email,
    password,
    confirmPassword,
    serverError,
    successMessage,
    fieldErrors,
    loading,
    showPassword,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    toggleShowPassword,
  } = useSignup();

  return (
    <Box className="relative flex min-h-screen overflow-hidden bg-[#080c12] font-sans">
      {/* Background ambient glow */}
      <Box
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(16,185,129,0.15),transparent_60%)] animate-pulse"
      />

      {/* Left panel */}
      <Box className="relative z-10 hidden flex-1 flex-col justify-center px-16 py-16 lg:flex xl:px-20">
        {/* Brand Header */}
        <Flex align="center" gap="xs" className="mb-16">
          <Flex
            align="center"
            justify="center"
            className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]"
          >
            <ShoppingBag size={20} className="text-white" />
          </Flex>
          <Box as="span" className="text-base font-bold tracking-tight text-slate-100">
            Al-Rehman Mobile Shop
          </Box>
        </Flex>

        {/* Hero text */}
        <Paragraph className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
          Create Your Free Account
        </Paragraph>
        <Heading level="h1" className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-50">
          Join Al-Rehman
          <br />
          <Box as="span" className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Mobile Accessories
          </Box>
        </Heading>
        <Paragraph className="mb-12 max-w-md text-base leading-relaxed text-slate-400">
          Create an account to explore premium earbuds, smart chargers, power banks, and audio gear with instant checkout.
        </Paragraph>

        {/* Feature Highlights */}
        <Box className="flex flex-col gap-4 max-w-md">
          {highlights.map(({ icon: Icon, title, sub, bg }) => (
            <Flex
              key={title}
              align="center"
              gap="sm"
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-emerald-500/30"
            >
              <Flex align="center" justify="center" className={`h-10 w-10 shrink-0 rounded-xl ${bg}`}>
                <Icon size={18} />
              </Flex>
              <Box>
                <Paragraph className="text-sm font-semibold text-slate-200">{title}</Paragraph>
                <Paragraph className="text-xs text-slate-400">{sub}</Paragraph>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>

      {/* Right panel (Sign Up form) */}
      <Flex
        align="center"
        justify="center"
        className="relative z-10 w-full flex-col px-6 py-12 lg:w-[520px] lg:shrink-0 lg:px-12"
      >
        <Box className="w-full max-w-[420px] rounded-3xl border border-white/[0.08] bg-slate-900/70 p-8 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {/* Header */}
          <Paragraph className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-400">
            Get Started
          </Paragraph>
          <Heading level="h2" className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
            Create Account
          </Heading>
          <Paragraph className="mb-7 text-sm leading-relaxed text-slate-400">
            Sign up with your details to start shopping.
          </Paragraph>

          {/* Success Notification */}
          {successMessage && (
            <Flex
              align="center"
              gap="xs"
              role="alert"
              className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              {successMessage}
            </Flex>
          )}

          {/* Server Error Notification */}
          {serverError && (
            <Flex
              align="center"
              gap="xs"
              role="alert"
              className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <Box as="span" className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
              {serverError}
            </Flex>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <Box>
              <Label htmlFor="signup-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400">
                Full Name
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={15} />
                </Box>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className="bg-white/[0.04] py-3 pl-11 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                />
              </Box>
              {fieldErrors.name && (
                <Paragraph id="name-error" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.name}
                </Paragraph>
              )}
            </Box>

            {/* Email */}
            <Box>
              <Label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400">
                Email address
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={15} />
                </Box>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className="bg-white/[0.04] py-3 pl-11 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                />
              </Box>
              {fieldErrors.email && (
                <Paragraph id="email-error" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.email}
                </Paragraph>
              )}
            </Box>

            {/* Password */}
            <Box>
              <Label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400">
                Password
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={15} />
                </Box>
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className="bg-white/[0.04] py-3 pl-11 pr-12 text-slate-100 border-white/[0.08] focus:border-emerald-500"
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
                <Paragraph id="password-error" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.password}
                </Paragraph>
              )}
            </Box>

            {/* Confirm Password */}
            <Box>
              <Label htmlFor="signup-confirm-password" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400">
                Confirm Password
              </Label>
              <Box className="relative">
                <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={15} />
                </Box>
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                  className="bg-white/[0.04] py-3 pl-11 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                />
              </Box>
              {fieldErrors.confirmPassword && (
                <Paragraph id="confirm-password-error" role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.confirmPassword}
                </Paragraph>
              )}
            </Box>

            {/* Submit Button */}
            <Button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-3 w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <Box className="mt-6 flex flex-col items-center gap-3 text-center">
            <Paragraph className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href={AppRoutes.LOGIN} className="font-semibold text-emerald-400 hover:underline">
                Sign In
              </Link>
            </Paragraph>
            <Link href={AppRoutes.HOME} className="text-xs text-slate-500 transition-colors hover:text-emerald-400">
              ← Back to storefront
            </Link>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
