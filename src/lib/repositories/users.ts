import "server-only";

import { Core } from "@/lib/core";

export interface UserAuthRow {
  id: string;
  email: string;
  name?: string | null;
  password?: string | null;
}

/**
 * Case-insensitive email lookup for public.users — the one query in this
 * app that a raw Supabase `.ilike()` used to serve directly. Named here
 * instead, so no call site constructs a Supabase query-builder chain of
 * its own.
 *
 * `DatabaseAdapterType.list`'s `where` only expresses equality, so a real
 * SQL ILIKE isn't available through the generic layer yet. Supabase Auth
 * already normalizes stored emails to lowercase on sign-up, and this
 * project's `on_auth_user_created` trigger copies that email verbatim into
 * `public.users`, so a lowercased equality match is equivalent to ILIKE
 * for every row this app creates — a deliberate, disclosed simplification
 * rather than a hidden behavior change. (The alternative — extending
 * `DatabaseAdapterType` with an explicit ILIKE operator — would need every
 * adapter, including the raw-SQL one, to implement it; not worth it for
 * this app's one case-insensitive lookup.)
 */
export async function findUserByEmail(email: string): Promise<UserAuthRow | null> {
  const rows = await Core.db.list<UserAuthRow>("users", {
    where: { email: email.trim().toLowerCase() },
    limit: 1,
  });
  return rows[0] ?? null;
}
