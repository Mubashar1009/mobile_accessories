import { DatabaseError } from "./DatabaseError";

/**
 * Thrown by EncryptionExtension for failures specific to encrypting or
 * decrypting field values — as opposed to ConfigurationError, which covers
 * the extension's own setup (e.g. a missing key).
 */
export class EncryptionError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, "ENCRYPTION_ERROR", options);
  }
}
