"use client";

import { Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ShoppingBag, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppRoutes } from "@/types/enums/routes";

function ForgotPasswordForm() {
  const { email, isSubmitting, isEmailSent, error, setEmail, requestReset } = usePasswordReset();

  // `/auth/confirm` sends the user back here with ?error=… when a reset
  // link is expired or already used — without this it would look like
  // the click simply did nothing.
  const linkError = useSearchParams().get("error");
  const shownError = error || linkError;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    requestReset();
  };

  return (
    <Box className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080c12] px-6 py-12 font-sans">
      <Box
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] animate-pulse"
      />

      <Box className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/[0.08] bg-slate-900/70 p-8 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <Flex align="center" gap="xs" className="mb-8">
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

        {isEmailSent ? (
          <>
            <Flex
              align="center"
              justify="center"
              className="mb-5 h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400"
            >
              <CheckCircle2 size={24} />
            </Flex>
            <Heading level="h2" className="mb-2 text-2xl font-extrabold tracking-tight text-slate-100">
              Check your email
            </Heading>
            <Paragraph className="mb-7 text-sm leading-relaxed text-slate-400">
              We&apos;ve sent a password reset link to{" "}
              <Box as="span" className="font-semibold text-slate-200">
                {email}
              </Box>
              . Follow the link to choose a new password.
            </Paragraph>
            <Link href={AppRoutes.LOGIN} className="text-sm font-semibold text-emerald-400 hover:underline">
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Paragraph className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-400">
              Reset Password
            </Paragraph>
            <Heading level="h2" className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
              Forgot password?
            </Heading>
            <Paragraph className="mb-7 text-sm leading-relaxed text-slate-400">
              Enter the email linked to your account and we&apos;ll send you a reset link.
            </Paragraph>

            {shownError && (
              <Flex
                align="center"
                gap="xs"
                role="alert"
                className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                <Box as="span" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {shownError}
              </Flex>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Box>
                <Label
                  htmlFor="forgot-password-email"
                  className="mb-2 block text-xs font-semibold tracking-wide text-slate-400"
                >
                  Email address
                </Label>
                <Box className="relative">
                  <Box as="span" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail size={15} />
                  </Box>
                  <Input
                    id="forgot-password-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/[0.04] py-3.5 pl-11 text-slate-100 border-white/[0.08] focus:border-emerald-500"
                  />
                </Box>
              </Box>

              <Button
                id="forgot-password-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending link…
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <Box className="mt-7 text-center">
              <Link href={AppRoutes.LOGIN} className="text-xs text-slate-400 transition-colors hover:text-emerald-400">
                ← Back to sign in
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

// useSearchParams() needs a Suspense boundary above it, otherwise this
// page can't be prerendered.
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
