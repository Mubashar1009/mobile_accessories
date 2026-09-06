import "server-only";

import { AdapterFactory } from "./AdapterFactory";
import { AuditExtension } from "./extensions/AuditExtension";
import { CachingExtension } from "./extensions/CachingExtension";
import { EncryptionExtension } from "./extensions/EncryptionExtension";
import { SoftDeleteExtension } from "./extensions/SoftDeleteExtension";
import type { DatabaseAdapterType, DatabaseServiceConfig } from "./types";

/**
 * Builds the base adapter (raw Postgres or Supabase) and wraps it with
 * whichever extensions are enabled, innermost to outermost:
 *
 *   base -> Encryption -> SoftDelete -> Caching -> Audit
 *
 * That order matters: encryption/decryption should happen closest to the
 * real data so every other extension only ever sees plaintext, soft-delete
 * filtering should apply before a result is cached, and audit logging
 * should be the outermost layer so it sees the same view of a call that the
 * app does.
 *
 * Adding a new cross-cutting concern later means writing one class (see
 * extensions/BaseExtension.ts) and adding one `if` block here — nothing
 * else in the app changes.
 */
export function createDatabaseService(config: DatabaseServiceConfig): DatabaseAdapterType {
  let service: DatabaseAdapterType = AdapterFactory.create(config.adapter.adapter, config.adapter);

  const extensions = config.extensions ?? {};

  if (extensions.encryption?.enabled) {
    service = new EncryptionExtension(service, extensions.encryption);
  }
  if (extensions.softDelete?.enabled) {
    service = new SoftDeleteExtension(service, extensions.softDelete);
  }
  if (extensions.caching?.enabled) {
    service = new CachingExtension(service, extensions.caching);
  }
  if (extensions.audit?.enabled) {
    service = new AuditExtension(service);
  }

  return service;
}
