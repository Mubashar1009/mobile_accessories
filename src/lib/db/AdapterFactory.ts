import "server-only";

import { SQLAdapter } from "./adapters/SQLAdapter";
import { SupabaseAdapter } from "./adapters/SupabaseAdapter";
import { ConfigurationError } from "./errors";
import { ADAPTERS, type DatabaseAdapterType, type DatabaseConfig } from "./types";

/**
 * Static factory that turns a `DatabaseConfig` into a concrete adapter
 * instance. This is the only place in the codebase that knows about
 * `SQLAdapter` / `SupabaseAdapter` — everything above it (extensions, app
 * code) only ever sees `DatabaseAdapterType`.
 */
export class AdapterFactory {
  static create<T extends DatabaseConfig>(type: T["adapter"], config: T): DatabaseAdapterType {
    if (!config) {
      throw new ConfigurationError("AdapterFactory.create requires a config object.");
    }

    switch (type) {
      case ADAPTERS.SQL: {
        const sqlConfig = config as Extract<DatabaseConfig, { adapter: "sql" }>;
        if (!sqlConfig.connectionString) {
          throw new ConfigurationError('AdapterFactory: "sql" adapter requires a connectionString.');
        }
        return new SQLAdapter(sqlConfig);
      }

      case ADAPTERS.SUPABASE: {
        const supabaseConfig = config as Extract<DatabaseConfig, { adapter: "supabase" }>;
        if (!supabaseConfig.url || !supabaseConfig.key) {
          throw new ConfigurationError('AdapterFactory: "supabase" adapter requires both a url and a key.');
        }
        return new SupabaseAdapter(supabaseConfig);
      }

      default:
        throw new ConfigurationError(`AdapterFactory: unsupported adapter type "${String(type)}".`);
    }
  }
}
