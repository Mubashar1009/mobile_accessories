import "server-only";

/**
 * Barrel for the database-agnostic layer. This module holds no singleton —
 * `createDatabaseService` is invoked exactly once, from `Core.initialize`
 * (see src/lib/core/Core.ts), and every other part of the app reaches the
 * resulting instance through `Core.db`.
 */
export { createDatabaseService } from "./createDatabaseService";
export { ADAPTERS } from "./types";
export type {
  AdapterName,
  AuditExtensionConfig,
  CachingExtensionConfig,
  DatabaseAdapterType,
  DatabaseConfig,
  DatabaseServiceConfig,
  EncryptionExtensionConfig,
  QueryOptions,
  SoftDeleteExtensionConfig,
  SQLAdapterConfig,
  SupabaseAdapterConfig,
} from "./types";
export * from "./errors";
