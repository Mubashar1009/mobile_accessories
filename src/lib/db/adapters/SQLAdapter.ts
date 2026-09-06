import "server-only";

import { Pool, type PoolConfig } from "pg";
import { AdapterOperationError, ConfigurationError, NotFoundError, ValidationError } from "../errors";
import type { DatabaseAdapterType, QueryOptions, SQLAdapterConfig } from "../types";

// Postgres has no way to bind identifiers (table/column names) as query
// parameters — only values. So identifiers are validated against this
// allowlist pattern before being concatenated into SQL; every value, by
// contrast, always travels through a `$n` placeholder.
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function assertValidIdentifier(name: string, kind: "table" | "column"): void {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new ValidationError(`SQLAdapter: invalid ${kind} identifier "${name}".`);
  }
}

async function runQuery<T extends Record<string, unknown>>(
  pool: Pool,
  sql: string,
  values: unknown[]
): Promise<{ rows: T[] }> {
  try {
    return await pool.query<T>(sql, values);
  } catch (cause) {
    throw new AdapterOperationError(
      cause instanceof Error ? cause.message : "SQLAdapter query failed.",
      { cause }
    );
  }
}

/**
 * Raw Postgres adapter, for connecting directly to Supabase's (or any)
 * Postgres instance via `DATABASE_URL` instead of going through the
 * Supabase REST API.
 */
export class SQLAdapter implements DatabaseAdapterType {
  private readonly pool: Pool;

  constructor(config: SQLAdapterConfig) {
    if (!config.connectionString) {
      throw new ConfigurationError("SQLAdapter requires a connectionString.");
    }

    const poolConfig: PoolConfig = {
      connectionString: config.connectionString,
      // Supabase's Postgres endpoints require SSL, but the CA chain isn't
      // reliably available in serverless runtimes — trust the connection
      // without verifying the certificate.
      ssl: { rejectUnauthorized: false },
    };

    this.pool = new Pool(poolConfig);
  }

  async get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    assertValidIdentifier(table, "table");
    const result = await runQuery<Record<string, unknown>>(
      this.pool,
      `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`,
      [id]
    );
    return (result.rows[0] as T) ?? null;
  }

  async list<T = Record<string, unknown>>(table: string, options: QueryOptions = {}): Promise<T[]> {
    assertValidIdentifier(table, "table");
    const { where = {}, orderBy, ascending = true, limit } = options;

    const values: unknown[] = [];
    const conditions = Object.entries(where).map(([column, value]) => {
      assertValidIdentifier(column, "column");
      values.push(value);
      return `${column} = $${values.length}`;
    });

    let sql = `SELECT * FROM ${table}`;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    if (orderBy) {
      assertValidIdentifier(orderBy, "column");
      sql += ` ORDER BY ${orderBy} ${ascending ? "ASC" : "DESC"}`;
    }
    if (limit !== undefined) {
      values.push(limit);
      sql += ` LIMIT $${values.length}`;
    }

    const result = await runQuery<Record<string, unknown>>(this.pool, sql, values);
    return result.rows as T[];
  }

  async create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T> {
    assertValidIdentifier(table, "table");
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) {
      throw new ValidationError(`SQLAdapter.create("${table}") requires at least one field.`);
    }
    entries.forEach(([column]) => assertValidIdentifier(column, "column"));

    const columns = entries.map(([column]) => column);
    const values = entries.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
    const result = await runQuery<Record<string, unknown>>(this.pool, sql, values);
    return result.rows[0] as T;
  }

  async update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    assertValidIdentifier(table, "table");
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) {
      throw new ValidationError(`SQLAdapter.update("${table}") requires at least one field.`);
    }
    entries.forEach(([column]) => assertValidIdentifier(column, "column"));

    const values = entries.map(([, value]) => value);
    const assignments = entries.map(([column], index) => `${column} = $${index + 1}`);
    values.push(id);

    const sql = `UPDATE ${table} SET ${assignments.join(", ")} WHERE id = $${values.length} RETURNING *`;
    const result = await runQuery<Record<string, unknown>>(this.pool, sql, values);
    if (result.rows.length === 0) {
      throw new NotFoundError(table, id);
    }
    return result.rows[0] as T;
  }

  async delete(table: string, id: string | number): Promise<void> {
    assertValidIdentifier(table, "table");
    await runQuery(this.pool, `DELETE FROM ${table} WHERE id = $1`, [id]);
  }
}
