/**
 * Centralized Environment Configuration
 * Strictly reads from environment variables (.env / .env.local).
 * No environment values or secrets are hardcoded in source files.
 */

export const env = {
  supabase: {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  auth: {
    // Secret key for password encryption/hashing - defined strictly in .env / .env.local
    passwordSecretKey:
      process.env.PASSWORD_SECRET_KEY ||
      process.env.AUTH_SECRET ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "",
  },
  site: {
    // Base URL used to build absolute redirect links (e.g. Supabase's
    // resetPasswordForEmail `redirectTo`) — set to the deployed origin in
    // production, defaults to the local dev server otherwise.
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

export function isPlaceholderSupabase(): boolean {
  const url = env.supabase.url;
  return !url || url.includes("your-project-id") || url === "https://.supabase.co";
}
