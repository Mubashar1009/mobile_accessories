"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@/store/login/useLoginStore";
import { loginSchema } from "@/types/login/schema";

function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return !url || url.includes("your-project-id") || url === "https://.supabase.co";
}

export function useLogin() {
  const router = useRouter();

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
        const adminEmails = (
          process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
        ).split(",");

        if (isPlaceholderSupabase()) {
          if (adminEmails.includes(result.data.email.trim())) {
            document.cookie = `mock-admin-session=${encodeURIComponent(
              result.data.email.trim()
            )}; path=/; max-age=86400`;
            resetForm();
            router.push("/admin");
            router.refresh();
          } else {
            setServerError("Access denied: you are not authorized as an administrator.");
          }
          return;
        }

        // Real Supabase auth would go here
        // const supabase = createClient();
        // const { error } = await supabase.auth.signInWithPassword(result.data);
        // if (error) throw error;

        resetForm();
        router.push("/admin");
        router.refresh();
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, setServerError, setFieldErrors, setLoading, resetForm, router]
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
