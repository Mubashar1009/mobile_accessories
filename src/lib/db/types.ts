/**
 * Shared contracts for the database-agnostic layer.
 *
 * `DatabaseAdapterType` is the surface every adapter (raw Postgres, Supabase,
 * …) and every decorator/extension implements. App code only ever talks to
 * this interface — never to `pg` or `@supabase/supabase-js` directly — so
 * swapping the underlying adapter, or adding a cross-cutting concern, never
 * touches call sites.
 *
 * This layer is CRUD-only. Auth (`src/lib/auth`) and file storage
 * (`src/lib/storage`) are separate, independently swappable adapter
 * hierarchies — never merged in here.
 */

export const ADAPTERS = {
  SQL: "sql",
  SUPABASE: "supabase",
} as const;

export type AdapterName = (typeof ADAPTERS)[keyof typeof ADAPTERS];

/**
 * Case-insensitive substring match across one or more columns, OR-ed
 * together, pushed down to the database as SQL `ILIKE`.
 *
 * `where` only expresses equality, which is why this is a separate option
 * rather than another entry in it. Both adapters implement it natively
 * (raw `ILIKE` for SQL, PostgREST `ilike` for Supabase), so a caller never
 * has to fetch a whole table and filter in memory to run a text search.
 *
 * The term is treated as a literal: LIKE metacharacters in it are escaped,
 * so searching `50%` finds rows containing "50%" rather than matching
 * everything. A blank/whitespace-only term is ignored entirely.
 */
export interface SearchOptions {
  /** Columns to match against; a row matches if ANY of them does. */
  columns: string[];
  /** Raw user input — escaped by the adapter, never interpolated. */
  term: string;
}

export interface QueryOptions {
  where?: Record<string, unknown>;
  /** Case-insensitive `ILIKE` search across columns -- see SearchOptions. */
  search?: SearchOptions;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  /** SoftDeleteExtension normally filters out soft-deleted rows; pass true to include them. */
  includeDeleted?: boolean;
}

export interface DatabaseAdapterType {
  get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null>;
  list<T = Record<string, unknown>>(table: string, options?: QueryOptions): Promise<T[]>;
  create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T>;
  update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T>;
  delete(table: string, id: string | number): Promise<void>;
}

// ── Adapter configs ─────────────────────────────────────────────────────

export interface SQLAdapterConfig {
  adapter: typeof ADAPTERS.SQL;
  connectionString: string;
}

export interface SupabaseAdapterConfig {
  adapter: typeof ADAPTERS.SUPABASE;
  url: string;
  key: string;
}

export type DatabaseConfig = SQLAdapterConfig | SupabaseAdapterConfig;

// ── Extension configs ───────────────────────────────────────────────────
// Every extension takes the same `{ enabled }`-based shape so
// createDatabaseService can toggle each one purely from config/env.

export interface ExtensionToggle {
  enabled: boolean;
}

export interface CachingExtensionConfig extends ExtensionToggle {
  /** How long a cached read stays fresh. Defaults to 60s. */
  ttlSeconds?: number;
}

export type AuditExtensionConfig = ExtensionToggle;

export interface SoftDeleteExtensionConfig extends ExtensionToggle {
  /** Column flipped instead of deleting the row. Defaults to "deleted_at". */
  column?: string;
}

export interface EncryptionExtensionConfig extends ExtensionToggle {
  /** Secret the field cipher uses directly — must be exactly 32 bytes (UTF-8). */
  key: string;
  /** Table name -> list of column names to encrypt/decrypt. */
  fields: Record<string, string[]>;
}

export interface DatabaseServiceConfig {
  adapter: DatabaseConfig;
  extensions?: {
    caching?: CachingExtensionConfig;
    audit?: AuditExtensionConfig;
    softDelete?: SoftDeleteExtensionConfig;
    encryption?: EncryptionExtensionConfig;
  };
}
