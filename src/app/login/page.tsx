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

const featureChips = [
  {
    icon: ShoppingBag,
    title: "Product Management",
    sub: "Add, edit, and organise your catalog",
    color: "#10b981",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Headphones,
    title: "Smart Accessories",
    sub: "Earbuds, cables, power banks & more",
    color: "#06b6d4",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Wifi,
    title: "Live Inventory",
    sub: "Real-time stock updates",
    color: "#818cf8",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Battery,
    title: "Order Tracking",
    sub: "Monitor orders & generate invoices",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
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
    <div className="relative flex min-h-screen overflow-hidden bg-[#080c12] font-sans">
      {/* ── Ambient background ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 animate-[meshShift_14s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(16,185,129,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.14) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Left panel ── */}
      <div className="relative z-10 hidden flex-1 flex-col justify-center px-16 py-16 lg:flex xl:px-20">
        {/* Brand */}
        <div className="mb-16 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100">
            Al-Rehman Mobile Shop
          </span>
          <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Admin
          </span>
        </div>

        {/* Hero text */}
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
          Admin Portal
        </p>
        <h1 className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-50">
          Manage your
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            store with ease
          </span>
        </h1>
        <p className="mb-14 max-w-sm text-base leading-relaxed text-slate-500">
          Access the full admin workspace to manage products, orders, and
          analytics — all from one place.
        </p>

        {/* Feature chips */}
        <div className="flex flex-col gap-3">
          {featureChips.map(({ icon: Icon, title, sub, color, bg }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-emerald-500/30"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{title}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div
        aria-hidden
        className="relative z-10 hidden shrink-0 lg:block"
        style={{
          width: 1,
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)",
        }}
      />

      {/* ── Right panel (form) ── */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[480px] lg:shrink-0 lg:px-12">
        <div className="w-full max-w-[400px] rounded-3xl border border-white/[0.08] bg-slate-900/70 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {/* Form header */}
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-400">
            Secure Access
          </p>
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
            Welcome back
          </h2>
          <p className="mb-9 text-sm leading-relaxed text-slate-500">
            Sign in with your admin credentials to continue.
          </p>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-semibold tracking-wide text-slate-400"
              >
                Email address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail size={15} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={[
                    "w-full rounded-xl border bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600",
                    "outline-none transition-all",
                    "focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20",
                    fieldErrors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/[0.08] focus:border-emerald-500",
                  ].join(" ")}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-xs font-semibold tracking-wide text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={[
                    "w-full rounded-xl border bg-white/[0.04] py-3.5 pl-11 pr-12 text-sm text-slate-100 placeholder:text-slate-600",
                    "outline-none transition-all",
                    "focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/20",
                    fieldErrors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/[0.08] focus:border-emerald-500",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <span>⚠</span> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <Link
            href="/"
            className="mt-7 flex items-center justify-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-emerald-400"
          >
            ← Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
