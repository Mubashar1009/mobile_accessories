import "server-only";

import { logger } from "@/lib/logger";
import { BaseExtension } from "./BaseExtension";

type AuditOperation = "create" | "update" | "delete";

/**
 * Records every write to an `audit_logs` table (see
 * migrations/005_audit_logs.sql): `create`/`update`/`delete` all write the
 * audit row through `this.next` BEFORE performing the real operation, so
 * the log reflects intent even if the underlying write then fails.
 *
 * `after` for create/update is the caller's input payload, not the
 * DB-returned row — the row doesn't exist yet (create) or hasn't been
 * written yet (update) at the point the audit entry is logged.
 *
 * A failure to write the audit row is logged and swallowed rather than
 * thrown, so a missing/misconfigured `audit_logs` table can't take down
 * unrelated writes.
 */
export class AuditExtension extends BaseExtension {
  private async logEntry(
    table: string,
    operation: AuditOperation,
    before: unknown,
    after: unknown
  ): Promise<void> {
    try {
      await this.next.create("audit_logs", {
        table_name: table,
        operation,
        before_data: before ?? null,
        after_data: after ?? null,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn(`[audit] failed to log ${operation} on "${table}"`, error, { table, operation });
    }
  }

  async create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T> {
    await this.logEntry(table, "create", undefined, data);
    return this.next.create<T>(table, data);
  }

  async update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const before = await this.next.get<T>(table, id).catch(() => null);
    await this.logEntry(table, "update", before, data);
    return this.next.update<T>(table, id, data);
  }

  async delete(table: string, id: string | number): Promise<void> {
    const before = await this.next.get(table, id).catch(() => null);
    await this.logEntry(table, "delete", before, undefined);
    await this.next.delete(table, id);
  }
}
