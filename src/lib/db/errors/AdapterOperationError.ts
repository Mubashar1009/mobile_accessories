import { DatabaseError } from "./DatabaseError";

/**
 * Wraps a failure raised by the underlying adapter itself — a Postgres
 * query error, a Supabase/PostgREST error response — so every adapter
 * fails through the same shape regardless of which one is active. The
 * original error is preserved as `cause` for logging/debugging.
 */
export class AdapterOperationError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, "ADAPTER_OPERATION_FAILED", options);
  }
}
