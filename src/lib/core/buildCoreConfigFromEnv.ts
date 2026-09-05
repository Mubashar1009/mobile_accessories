import "server-only";

import { ADAPTERS } from "@/lib/db/types";
import type { DatabaseConfig, DatabaseServiceConfig } from "@/lib/db/types";
import { STORAGE_ADAPTERS } from "@/lib/storage/types";
import type { StorageConfig } from "@/lib/storage/types";
import type { CoreConfig } from "./Core";

function readBoolEnv(name: string): boolean {
  return process.env[name] === "true";
}

function buildDbAdapterConfig(): DatabaseConfig {
  const adapterName = process.env.DB_ADAPTER || ADAPTERS.SUPABASE;

  if (adapterName === ADAPTERS.SQL) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DB_ADAPTER="sql" requires DATABASE_URL to be set.');
    }
    return { adapter: ADAPTERS.SQL, connectionString };
  }

  if (adapterName === ADAPTERS.SUPABASE) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'DB_ADAPTER="supabase" requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY to be set.'
      );
    }
    return { adapter: ADAPTERS.SUPABASE, url, key };
  }

  throw new Error(`Unsupported DB_ADAPTER "${adapterName}" — use "sql" or "supabase".`);
}

// Which table.column pairs EncryptionExtension covers. Hardcoded rather
// than env-driven: a flat env var can't cleanly express a table -> columns
// map — a real multi-table setup would likely load this from a config
// file instead. No fields are configured yet.
const ENCRYPTED_FIELDS: Record<string, string[]> = {};

function buildDbServiceConfig(): DatabaseServiceConfig {
  const encryptionEnabled = readBoolEnv("DB_ENCRYPTION_ENABLED");
  return {
    adapter: buildDbAdapterConfig(),
    extensions: {
      caching: { enabled: readBoolEnv("DB_CACHE_ENABLED") },
      audit: { enabled: readBoolEnv("DB_AUDIT_ENABLED") },
      softDelete: { enabled: readBoolEnv("DB_SOFT_DELETE_ENABLED") },
      encryption: {
        enabled: encryptionEnabled,
        // ENCRYPTION_KEY is only required when encryption is actually on —
        // guard the lookup so DatabaseServiceConfig doesn't demand a key
        // that will never be validated.
        key: encryptionEnabled ? requireEncryptionKey() : "",
        fields: ENCRYPTED_FIELDS,
      },
    },
  };
}

function requireEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("DB_ENCRYPTION_ENABLED=true requires ENCRYPTION_KEY to be set (exactly 32 bytes).");
  }
  return key;
}

function buildStorageConfig(): StorageConfig {
  const adapterName = process.env.STORAGE_ADAPTER || STORAGE_ADAPTERS.SUPABASE;

  if (adapterName === STORAGE_ADAPTERS.SUPABASE) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'STORAGE_ADAPTER="supabase" requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY to be set.'
      );
    }
    return { adapter: STORAGE_ADAPTERS.SUPABASE, url, key };
  }

  throw new Error(`Unsupported STORAGE_ADAPTER "${adapterName}" — use "supabase".`);
}

/** Reads every env var Core needs and assembles one `CoreConfig`. */
export function buildCoreConfigFromEnv(): CoreConfig {
  return {
    db: buildDbServiceConfig(),
    storage: buildStorageConfig(),
  };
}
