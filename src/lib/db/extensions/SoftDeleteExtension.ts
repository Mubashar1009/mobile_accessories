import "server-only";

import { BaseExtension } from "./BaseExtension";
import type { DatabaseAdapterType, QueryOptions, SoftDeleteExtensionConfig } from "../types";

const DEFAULT_COLUMN = "deleted_at";

/**
 * Turns hard deletes into a flag flip: `delete` sets the configured column
 * (default `deleted_at`) to the current timestamp via `update` instead of
 * removing the row. `get`/`list` filter out rows where that column is
 * already set; `list` skips the filter when `options.includeDeleted` is
 * true. `get` has no options parameter in `DatabaseAdapterType`, so it
 * always filters — there's no per-call way to ask for a soft-deleted row
 * by id.
 *
 * `list` filters in-memory rather than pushing an `IS NULL` clause into the
 * query, since `QueryOptions.where` only expresses equality and stays
 * identical across both adapters — this keeps the check adapter-agnostic
 * at the cost of fetching (and discarding) soft-deleted rows from the
 * underlying store.
 */
export class SoftDeleteExtension extends BaseExtension {
  private readonly column: string;

  constructor(next: DatabaseAdapterType, config: SoftDeleteExtensionConfig = { enabled: true }) {
    super(next);
    this.column = config.column ?? DEFAULT_COLUMN;
  }

  private isDeleted(row: Record<string, unknown>): boolean {
    return row[this.column] != null;
  }

  async get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    const row = await this.next.get<T>(table, id);
    if (!row || this.isDeleted(row as Record<string, unknown>)) {
      return null;
    }
    return row;
  }

  async list<T = Record<string, unknown>>(table: string, options?: QueryOptions): Promise<T[]> {
    const rows = await this.next.list<T>(table, options);
    if (options?.includeDeleted) {
      return rows;
    }
    return rows.filter((row) => !this.isDeleted(row as Record<string, unknown>));
  }

  async delete(table: string, id: string | number): Promise<void> {
    await this.next.update(table, id, { [this.column]: new Date().toISOString() });
  }
}
