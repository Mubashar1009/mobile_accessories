import "server-only";

import { BaseExtension } from "./BaseExtension";
import type { CachingExtensionConfig, DatabaseAdapterType } from "../types";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 60;

/**
 * Read-through in-memory cache. `get` serves from the cache when the entry
 * is still fresh, and falls through to `next` (populating the cache) on a
 * miss or expiry. `update`/`delete` invalidate the entry so a write is
 * never followed by a stale read.
 *
 * The cache is process-local (a plain `Map`), which is fine for a single
 * long-lived server process; on serverless/edge runtimes with many
 * short-lived instances it simply behaves like a smaller, per-instance
 * cache rather than a shared one.
 */
export class CachingExtension extends BaseExtension {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs: number;

  constructor(next: DatabaseAdapterType, config: CachingExtensionConfig = { enabled: true }) {
    super(next);
    this.ttlMs = (config.ttlSeconds ?? DEFAULT_TTL_SECONDS) * 1000;
  }

  private cacheKey(table: string, id: string | number): string {
    return `${table}:${id}`;
  }

  async get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    const key = this.cacheKey(table, id);
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T | null;
    }

    const value = await this.next.get<T>(table, id);
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }

  async update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const result = await this.next.update<T>(table, id, data);
    this.cache.delete(this.cacheKey(table, id));
    return result;
  }

  async delete(table: string, id: string | number): Promise<void> {
    await this.next.delete(table, id);
    this.cache.delete(this.cacheKey(table, id));
  }
}
