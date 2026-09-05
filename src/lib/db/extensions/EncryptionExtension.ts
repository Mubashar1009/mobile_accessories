import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { logger } from "@/lib/logger";
import { BaseExtension } from "./BaseExtension";
import { ConfigurationError, EncryptionError } from "../errors";
import type { DatabaseAdapterType, EncryptionExtensionConfig, QueryOptions } from "../types";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

function assertValidKey(key: string): Buffer {
  const buffer = Buffer.from(key, "utf8");
  if (buffer.length !== KEY_LENGTH) {
    throw new ConfigurationError(
      `EncryptionExtension: key must be exactly ${KEY_LENGTH} bytes (UTF-8), got ${buffer.length}.`
    );
  }
  return buffer;
}

// A value only "looks encrypted" if it has our exact iv:authTag:data shape —
// this is how old plain-text rows are told apart from new encrypted ones
// without a schema migration.
function looksEncrypted(value: string): boolean {
  return value.split(":").length === 3;
}

function encryptValue(value: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptValue(payload: string, key: Buffer): string {
  const [ivHex, authTagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/**
 * Encrypts configured fields at rest with AES-256-GCM. `create`/`update`
 * encrypt the listed columns in the input BEFORE delegating to `next`, then
 * decrypt the returned row before handing it back — so the caller always
 * sees plain data. `get`/`list` decrypt on the way out. Only string values
 * are touched; a missing field passes through untouched.
 *
 * Encryption failures on write are compliance-critical and are left to
 * throw. Decryption failures (wrong key, corrupted data) are caught, logged
 * as a warning naming the table/field, and the raw stored value is returned
 * as-is rather than throwing — a bad row shouldn't take down a whole read.
 */
export class EncryptionExtension extends BaseExtension {
  private readonly key: Buffer;
  private readonly fields: Record<string, string[]>;

  constructor(next: DatabaseAdapterType, config: EncryptionExtensionConfig) {
    super(next);
    this.key = assertValidKey(config.key);
    this.fields = config.fields ?? {};
  }

  private fieldsFor(table: string): string[] {
    return this.fields[table] ?? [];
  }

  private encryptRow<T>(table: string, data: Partial<T>): Partial<T> {
    const fields = this.fieldsFor(table);
    if (fields.length === 0) {
      return data;
    }
    const record: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    for (const field of fields) {
      const value = record[field];
      if (typeof value === "string") {
        try {
          record[field] = encryptValue(value, this.key);
        } catch (cause) {
          throw new EncryptionError(`Failed to encrypt ${table}.${field}.`, { cause });
        }
      }
    }
    return record as Partial<T>;
  }

  private decryptRow<T>(table: string, row: T | null): T | null {
    const fields = this.fieldsFor(table);
    if (!row || fields.length === 0) {
      return row;
    }
    const record: Record<string, unknown> = { ...(row as Record<string, unknown>) };
    for (const field of fields) {
      const value = record[field];
      if (typeof value !== "string" || !looksEncrypted(value)) {
        continue;
      }
      try {
        record[field] = decryptValue(value, this.key);
      } catch (error) {
        logger.warn(`[encryption] failed to decrypt ${table}.${field} — returning raw value`, error, {
          table,
          field,
        });
      }
    }
    return record as T;
  }

  async get<T = Record<string, unknown>>(table: string, id: string | number): Promise<T | null> {
    return this.decryptRow(table, await this.next.get<T>(table, id));
  }

  async list<T = Record<string, unknown>>(table: string, options?: QueryOptions): Promise<T[]> {
    const rows = await this.next.list<T>(table, options);
    return rows.map((row) => this.decryptRow(table, row) as T);
  }

  async create<T = Record<string, unknown>>(table: string, data: Partial<T>): Promise<T> {
    const created = await this.next.create<T>(table, this.encryptRow(table, data));
    return this.decryptRow(table, created) as T;
  }

  async update<T = Record<string, unknown>>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const updated = await this.next.update<T>(table, id, this.encryptRow(table, data));
    return this.decryptRow(table, updated) as T;
  }
}
