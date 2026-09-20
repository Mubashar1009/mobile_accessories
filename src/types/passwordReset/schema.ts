import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type RequestPasswordResetFormValues = z.infer<typeof requestPasswordResetSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
