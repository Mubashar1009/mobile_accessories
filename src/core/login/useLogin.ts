"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@/store/login/useLoginStore";
import { loginSchema } from "@/types/login/schema";
import { createClient } from "@/utils/supabase/client";

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
        const supabase = createClient();

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: result.data.email.trim(),
          password: result.data.password,
        });

        if (authError) {
          if (authError.message.toLowerCase().includes("invalid login credentials")) {
            setServerError("Incorrect email or password. Please try again.");
          } else if (authError.message.toLowerCase().includes("email not confirmed")) {
            setServerError(
              "Please confirm your email address before signing in. Check your inbox for the invite link."
            );
          } else {
            setServerError(authError.message);
          }
          return;
        }

        // 2. Check role in public.users (set by the on_auth_user_created trigger in 003 migration)
        const { data: userRow, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (roleError || !userRow) {
          // Sign out to avoid a half-authenticated state
          await supabase.auth.signOut();
          setServerError("Could not verify your account. Please contact support.");
          return;
        }

        if (userRow.role !== "admin") {
          await supabase.auth.signOut();
          setServerError("Access denied: your account does not have administrator privileges.");
          return;
        }

        // 3. Admin confirmed — go to dashboard
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
