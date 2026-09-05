import "server-only";

import { Core } from "@/lib/core";
import { UserRole } from "@/types/enums/roles";

interface UserRoleRow {
  role: UserRole;
}

/**
 * Server-side verification for admin access.
 * Checks the Supabase auth session (via a fresh Core.createAuthClient())
 * & public.users.role (via Core.db) — never touches Supabase directly.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const auth = await Core.createAuthClient();
    const {
      data: { user },
      error,
    } = await auth.auth.getUser();
    if (error || !user) {
      return false;
    }

    const userRow = await Core.db.get<UserRoleRow>("users", user.id);
    return userRow?.role === UserRole.ADMIN;
  } catch {
    return false;
  }
}
