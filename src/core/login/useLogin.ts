"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@/store/login/useLoginStore";
import { loginSchema } from "@/types/login/schema";
import { useAuth } from "@/hooks/useAuth";
import { AppRoutes } from "@/types/enums/routes";

export function useLogin() {
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    email,
    password,
    serverError,
    fieldErrors,
    loading,
    showPassword,
    setEmail,
    setPassword,
    setServerError,
    setFieldErrors,
    setLoading,
    setShowPassword,
    resetForm,
  } = useLoginStore();

  /** Validate a single field on blur / change and update only that field's error */
  const validateField = useCallback(
    (field: "email" | "password", value: string) => {
      const partial = field === "email" ? { email: value, password } : { email, password: value };
      const result = loginSchema.safeParse(partial);

      if (result.success) {
        setFieldErrors({ ...fieldErrors, [field]: undefined });
      } else {
        const fieldIssue = result.error.issues.find((i) => i.path[0] === field);
        setFieldErrors({ ...fieldErrors, [field]: fieldIssue?.message });
      }
    },
    [email, password, fieldErrors, setFieldErrors]
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      validateField("email", value);
    },
    [setEmail, validateField]
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      validateField("password", value);
    },
    [setPassword, validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);

      // ── Full Zod validation ──
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          if (!errors[field]) errors[field] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }

      setFieldErrors({});
      setLoading(true);

      try {
        // Authenticate (verifies encrypted password + Supabase Auth, and
        // establishes the browser client's own session) via useAuth().
        const actionResult = await signIn(result.data.email.trim(), result.data.password);

        if (actionResult.error) {
          setServerError(actionResult.error);
          return;
        }

        // Login successful -> reset form & redirect to home by default
        resetForm();
        router.push(AppRoutes.HOME);
        router.refresh();
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, setServerError, setFieldErrors, setLoading, resetForm, router, signIn]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  return {
    // State
    email,
    password,
    serverError,
    fieldErrors,
    loading,
    showPassword,
    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    toggleShowPassword,
  };
}
