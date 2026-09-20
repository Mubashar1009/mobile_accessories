/**
 * Storage-specific adapter contracts — file lifecycle, not row CRUD. Kept
 * entirely separate from `src/lib/db`'s `DatabaseAdapterType` and from
 * `src/lib/auth`'s `AuthAdapter`: each of the three layers is independently
 * swappable.
 */

export const STORAGE_ADAPTERS = {
  SUPABASE: "supabase",
} as const;

export type StorageAdapterName = (typeof STORAGE_ADAPTERS)[keyof typeof STORAGE_ADAPTERS];

export interface UploadResult {
  path: string;
  url: string;
}

export interface StorageAdapter {
  upload(bucket: string, path: string, file: File | Blob): Promise<UploadResult>;
  remove(bucket: string, paths: string[]): Promise<void>;
  getPublicUrl(bucket: string, path: string): Promise<string>;
}

export interface SupabaseStorageAdapterConfig {
  adapter: typeof STORAGE_ADAPTERS.SUPABASE;
  url: string;
  key: string;
}

export type StorageConfig = SupabaseStorageAdapterConfig;
