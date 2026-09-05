import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { createDatabaseService } from "@/lib/db/createDatabaseService";
import type { DatabaseAdapterType, DatabaseServiceConfig } from "@/lib/db/types";
import { StorageAdapterFactory } from "@/lib/storage/StorageAdapterFactory";
import type { StorageAdapter, StorageConfig } from "@/lib/storage/types";
import { buildCoreConfigFromEnv } from "./buildCoreConfigFromEnv";

export interface CoreConfig {
  db: DatabaseServiceConfig;
  storage: StorageConfig;
}

interface CoreState {
  db: DatabaseAdapterType;
  storage: StorageAdapter;
}

// Next.js Fast Refresh re-evaluates modules on every edit during `next dev`
// without restarting the process. Caching state on `globalThis` survives
// those re-evaluations so `initialize` stays idempotent — in production the
// module is only ever evaluated once, so this is just a plain singleton.
declare global {
  var __coreState__: CoreState | undefined;
}

/**
 * Single bootstrap point for the DB and Storage adapters: `Core.initialize`
 * builds both exactly once, and `Core.db` / `Core.storage` are the only way
 * anything downstream (domain services, via `src/lib/registry.ts`) reaches
 * them.
 *
 * Auth is deliberately NOT part of this state. Supabase's SSR auth client
 * is bound to the current request's cookies — see `createAuthClient()`
 * below — so it can never be a cached, long-lived singleton the way db/
 * storage are.
 */
export class Core {
  private static get state(): CoreState | undefined {
    return globalThis.__coreState__;
  }

  private static set state(value: CoreState) {
    globalThis.__coreState__ = value;
  }

  /** Idempotent — a no-op if Core has already been initialized. */
  static initialize(config: CoreConfig): void {
    if (Core.state) {
      return;
    }
    Core.state = {
      db: createDatabaseService(config.db),
      storage: StorageAdapterFactory.create(config.storage.adapter, config.storage),
    };
  }

  static get db(): DatabaseAdapterType {
    return Core.requireState().db;
  }

  static get storage(): StorageAdapter {
    return Core.requireState().storage;
  }

  /**
   * Builds a FRESH Supabase SSR client bound to the current request's
   * cookies() — call this every time you need one, never cache or memoize
   * the result. Unlike db/storage (long-lived, boot-time singletons with no
   * per-user state), this client carries the calling user's session via
   * cookies; caching it on Core would leak one request's session into every
   * other request served by the same long-lived server process.
   */
  static async createAuthClient(): Promise<SupabaseClient> {
    const cookieStore = await cookies();

    return createServerClient(env.supabase.url, env.supabase.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore
          }
        },
      },
    });
  }

  /**
   * `instrumentation.ts` calls `Core.initialize()` once at server boot, but
   * that hook isn't guaranteed to have run before every module evaluation
   * (e.g. during `next build`'s page-data collection). `initialize` is
   * idempotent, so retrying it here — right before the first real read —
   * is a safe, cheap fallback: it either no-ops (already initialized) or
   * throws the real, specific config error (e.g. a missing env var) in
   * place of a generic "not initialized" message.
   */
  private static requireState(): CoreState {
    if (!Core.state) {
      Core.initialize(buildCoreConfigFromEnv());
    }
    return Core.state as CoreState;
  }
}
