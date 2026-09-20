import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { StorageError } from "../errors";
import type { StorageAdapter, SupabaseStorageAdapterConfig, UploadResult } from "../types";

/**
 * Storage adapter backed by Supabase Storage, using a service-role
 * supabase-js client (like `SupabaseAdapter` in `src/lib/db`) rather than
 * the request-scoped SSR client — uploads/deletes are already gated by an
 * admin check at the call site, so they don't need to ride the caller's
 * session/RLS policies too.
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  private readonly client: SupabaseClient;

  constructor(config: SupabaseStorageAdapterConfig) {
    if (!config.url || !config.key) {
      throw new StorageError("SupabaseStorageAdapter requires both a url and a key.");
    }
    this.client = createClient(config.url, config.key);
  }

  async upload(bucket: string, path: string, file: File | Blob): Promise<UploadResult> {
    const contentType = file instanceof File ? file.type : undefined;
    const { error } = await this.client.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: false,
    });
    if (error) {
      throw new StorageError(`SupabaseStorageAdapter.upload("${bucket}/${path}") failed: ${error.message}`, {
        cause: error,
      });
    }
    return { path, url: await this.getPublicUrl(bucket, path) };
  }

  async remove(bucket: string, paths: string[]): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) {
      throw new StorageError(`SupabaseStorageAdapter.remove("${bucket}") failed: ${error.message}`, {
        cause: error,
      });
    }
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
