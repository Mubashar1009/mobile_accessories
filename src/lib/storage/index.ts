import "server-only";

/**
 * Barrel for the storage-specific adapter layer. No singleton lives here —
 * `StorageAdapterFactory.create` is invoked once from `Core.initialize`,
 * and the rest of the app reaches the instance through `Core.storage`.
 */
export { StorageAdapterFactory } from "./StorageAdapterFactory";
export { STORAGE_ADAPTERS } from "./types";
export type {
  StorageAdapter,
  StorageAdapterName,
  StorageConfig,
  SupabaseStorageAdapterConfig,
  UploadResult,
} from "./types";
export { StorageError } from "./errors";
