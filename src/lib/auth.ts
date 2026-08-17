import { createClient } from "@/utils/supabase/server";
import { UserRole } from "@/types/enums/roles";

/**
 * Server-side verification for admin access.
 * Checks Supabase authentication session & public.users role.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    const { data: userRow, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return !roleError && userRow?.role === UserRole.ADMIN;
  } catch {
    return false;
  }
}
