import "server-only";

import type { DatabaseAdapterType } from "@/lib/db/types";
import type { StorageAdapter } from "@/lib/storage/types";

export interface DomainServiceDeps {
  db: DatabaseAdapterType;
  storage: StorageAdapter;
}

/**
 * Base for every domain service. `db`/`storage` are constructor-injected
 * long-lived singletons (see `src/lib/registry.ts`) — a concrete service
 * never constructs an adapter or imports `Core` itself.
 *
 * Auth is deliberately NOT part of this bag: a Supabase SSR client is
 * bound to one request's cookies, but a domain service instance is a
 * long-lived singleton shared across every request. Storing an auth client
 * on `this` would leak one user's session into every other caller. Methods
 * that need auth take a `SupabaseClient` as an explicit parameter instead —
 * built fresh per call via `Core.createAuthClient()` at the server-action
 * boundary — never on the constructor.
 */
export abstract class BaseDomainService {
  protected readonly db: DatabaseAdapterType;
  protected readonly storage: StorageAdapter;

  constructor(deps: DomainServiceDeps) {
    this.db = deps.db;
    this.storage = deps.storage;
  }
}
