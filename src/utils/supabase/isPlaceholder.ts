/**
 * Helper utility to determine whether Supabase credentials are placeholder or unconfigured.
 */
export function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    !url ||
    !key ||
    url.includes("placeholder") ||
    key.includes("placeholder") ||
    url.includes("your-project-id") ||
    url === "https://.supabase.co"
  );
}
