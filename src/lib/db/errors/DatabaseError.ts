export type DatabaseErrorCode =
  | "CONFIGURATION_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "ADAPTER_OPERATION_FAILED"
  | "ENCRYPTION_ERROR";

/**
 * Base class for every error raised by src/db/lib. Catch this (or a
 * specific subclass) instead of a bare `Error` to distinguish
 * database-layer failures — bad config, invalid input, a missing row, a
 * failed adapter call — from unrelated bugs, and to get a stable `code`
 * that's safe to branch on or report without parsing message strings.
 */
export class DatabaseError extends Error {
  readonly code: DatabaseErrorCode;

  constructor(message: string, code: DatabaseErrorCode, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
