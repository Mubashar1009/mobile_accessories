import "server-only";

import type { DatabaseAdapterType, QueryOptions } from "../types";

/**
 * Decorator base for cross-cutting concerns (caching, audit logging,
 * soft-delete, encryption, …). Every method just forwards to the wrapped
 * `next` adapter by default — a concrete extension only overrides the
 * methods whose behavior it actually changes, so adding a new concern never
 * requires touching this class or any other extension.
 */
export abstract class BaseExtension implements DatabaseAdapterType {
  constructor(protected readonly next: DatabaseAdapterType) {}

  get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    return this.next.get<T>(table, id);
  }

  list<T = Record<string, unknown>>(table: string, options?: QueryOptions): Promise<T[]> {
    return this.next.list<T>(table, options);
  }

  create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T> {
    return this.next.create<T>(table, data);
  }

  update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    return this.next.update<T>(table, id, data);
  }

  delete(table: string, id: string | number): Promise<void> {
    return this.next.delete(table, id);
  }
}
