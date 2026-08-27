"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/store/signup/useSignupStore";
import { signupSchema } from "@/types/signup/schema";
import { signupUserAction } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import { AppRoutes } from "@/types/enums/routes";

export function useSignup() {
  const router = useRouter();

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
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setServerError,
    setSuccessMessage,
    setFieldErrors,
    setLoading,
    setShowPassword,
    resetForm,
  } = useSignupStore();

  const validateField = useCallback(
    (field: "name" | "email" | "password" | "confirmPassword", value: string) => {
      const formValues = {
        name: field === "name" ? value : name,
        email: field === "email" ? value : email,
        password: field === "password" ? value : password,
        confirmPassword: field === "confirmPassword" ? value : confirmPassword,
      };

      const result = signupSchema.safeParse(formValues);

      if (result.success) {
        setFieldErrors({ ...fieldErrors, [field]: undefined });
      } else {
        const fieldIssue = result.error.issues.find((i) => i.path[0] === field);
        setFieldErrors({ ...fieldErrors, [field]: fieldIssue?.message });
      }
    },
    [name, email, password, confirmPassword, fieldErrors, setFieldErrors]
  );

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      validateField("name", value);
    },
    [setName, validateField]
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

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);
      validateField("confirmPassword", value);
    },
    [setConfirmPassword, validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);
      setSuccessMessage(null);

      // Zod validation
      const result = signupSchema.safeParse({ name, email, password, confirmPassword });
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
        // Sign up with encrypted password storage via server action
        const actionResult = await signupUserAction({
          name: result.data.name.trim(),
          email: result.data.email.trim(),
          password: result.data.password,
          confirmPassword: result.data.confirmPassword,
        });

        if (actionResult.error) {
          setServerError(actionResult.error);
          return;
        }

        // Also sign in browser client if session available
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: result.data.email.trim(),
            password: result.data.password,
          });
        } catch {
          // Ignored if confirmation email required
        }

        setSuccessMessage("Account created successfully! Redirecting...");
        resetForm();
        setTimeout(() => {
          router.push(AppRoutes.HOME);
          router.refresh();
        }, 1200);
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      setServerError,
      setSuccessMessage,
      setFieldErrors,
      setLoading,
      resetForm,
      router,
    ]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  return {
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
  };
}
