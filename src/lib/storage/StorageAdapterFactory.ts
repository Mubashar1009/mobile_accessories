import "server-only";

import { SupabaseStorageAdapter } from "./adapters/SupabaseStorageAdapter";
import { STORAGE_ADAPTERS, type StorageAdapter, type StorageConfig } from "./types";

/**
 * Static factory that turns a `StorageConfig` into a concrete adapter
 * instance — same class+switch shape as `AdapterFactory` in `src/lib/db`.
 * `STORAGE_ADAPTERS` currently has one member (Supabase), structured to
 * add "r2"/"s3" later without touching any call site.
 */
export class StorageAdapterFactory {
  static create<T extends StorageConfig>(type: T["adapter"], config: T): StorageAdapter {
    if (!config) {
      throw new Error("StorageAdapterFactory.create requires a config object.");
    }

    switch (type) {
      case STORAGE_ADAPTERS.SUPABASE: {
        const supabaseConfig = config as Extract<StorageConfig, { adapter: "supabase" }>;
        if (!supabaseConfig.url || !supabaseConfig.key) {
          throw new Error('StorageAdapterFactory: "supabase" adapter requires both a url and a key.');
        }
        return new SupabaseStorageAdapter(supabaseConfig);
      }

      default:
        throw new Error(`StorageAdapterFactory: unsupported adapter type "${String(type)}".`);
    }
  }
}
