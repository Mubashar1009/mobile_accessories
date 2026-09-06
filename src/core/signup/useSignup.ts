"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/store/signup/useSignupStore";
import { signupSchema } from "@/types/signup/schema";
import { useAuth } from "@/hooks/useAuth";
import { AppRoutes } from "@/types/enums/routes";

export function useSignup() {
  const router = useRouter();
  const { signUp } = useAuth();

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
        // Sign up (encrypted password storage + Supabase Auth, and
        // establishes the browser client's own session) via useAuth().
        const actionResult = await signUp(
          result.data.name.trim(),
          result.data.email.trim(),
          result.data.password,
          result.data.confirmPassword
        );

        if (actionResult.error) {
          setServerError(actionResult.error);
          return;
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
      signUp,
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
