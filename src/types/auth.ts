export interface AuthActionResult {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface PasswordResetResult {
  success: boolean;
  error?: string;
}
