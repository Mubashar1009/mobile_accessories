import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AdapterOperationError, ConfigurationError, ValidationError } from "../errors";
import { containsRegexTerm, quotePostgrestValue } from "../searchPattern";
import type { DatabaseAdapterType, QueryOptions, SupabaseAdapterConfig } from "../types";

// PostgREST builds filters out of a comma/parenthesis-delimited string, so a
// column name is structure, not a bound parameter. Restrict them to the same
// plain-identifier shape SQLAdapter enforces, rather than trusting whatever a
// caller passes in.
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Supabase JS adapter. Talks to Supabase's REST (PostgREST) API rather than
 * opening a raw Postgres connection — used with the service-role key, so
 * this must never reach a client bundle (see the `server-only` import
 * above).
 */
export class SupabaseAdapter implements DatabaseAdapterType {
  private readonly client: SupabaseClient;

  constructor(config: SupabaseAdapterConfig) {
    if (!config.url || !config.key) {
      throw new ConfigurationError("SupabaseAdapter requires both a url and a key.");
    }
    this.client = createClient(config.url, config.key);
  }

  async get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    const { data, error } = await this.client.from(table).select("*").eq("id", id).maybeSingle();
    if (error) {
      throw new AdapterOperationError(`SupabaseAdapter.get("${table}") failed: ${error.message}`, {
        cause: error,
      });
    }
    return (data as T | null) ?? null;
  }

  async list<T = Record<string, unknown>>(table: string, options: QueryOptions = {}): Promise<T[]> {
    const { where = {}, search, orderBy, ascending = true, limit } = options;

    let query = this.client.from(table).select("*");
    for (const [column, value] of Object.entries(where)) {
      query = query.eq(column, value);
    }

    // Case-insensitive substring search across the requested columns, OR-ed
    // together. PostgREST expresses that as `or=(col.op.<value>,…)`, which
    // supabase-js's `.or()` takes as a raw string — so the value is quoted
    // (commas/parens in the term would otherwise be read as filter syntax).
    //
    // `imatch` (Postgres `~*`), NOT `ilike`: PostgREST rewrites `*` to `%`
    // inside a like/ilike value, so a user searching for a literal `*` would
    // silently get a wildcard, and no escaping of `*` survives that rewrite.
    // `~*` is unanchored and case-insensitive, so a fully escaped regex is an
    // exact "contains" match — see ../searchPattern.ts.
    //
    // A blank term adds no filter at all rather than matching every row.
    const searchTerm = search?.term.trim();
    if (search && searchTerm && search.columns.length > 0) {
      const value = quotePostgrestValue(containsRegexTerm(searchTerm));
      const clauses = search.columns.map((column) => {
        if (!IDENTIFIER_PATTERN.test(column)) {
          throw new ValidationError(`SupabaseAdapter: invalid column identifier "${column}".`);
        }
        return `${column}.imatch.${value}`;
      });
      query = query.or(clauses.join(","));
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      throw new AdapterOperationError(`SupabaseAdapter.list("${table}") failed: ${error.message}`, {
        cause: error,
      });
    }
    return (data as T[] | null) ?? [];
  }

  async create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T> {
    // Without a generated `Database` schema, supabase-js can't resolve the
    // insert row shape for an arbitrary generic `T` — the cast below is
    // the documented escape hatch for that gap; runtime behavior is
    // unaffected since PostgREST validates the payload either way.
    const { data: row, error } = await this.client
      .from(table)
      .insert(data as never)
      .select()
      .single();
    if (error) {
      throw new AdapterOperationError(`SupabaseAdapter.create("${table}") failed: ${error.message}`, {
        cause: error,
      });
    }
    return row as T;
  }

  async update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const { data: row, error } = await this.client
      .from(table)
      .update(data as never)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw new AdapterOperationError(`SupabaseAdapter.update("${table}") failed: ${error.message}`, {
        cause: error,
      });
    }
    return row as T;
  }

  async delete(table: string, id: string | number): Promise<void> {
    const { error } = await this.client.from(table).delete().eq("id", id);
    if (error) {
      throw new AdapterOperationError(`SupabaseAdapter.delete("${table}") failed: ${error.message}`, {
        cause: error,
      });
    }
  }
}
