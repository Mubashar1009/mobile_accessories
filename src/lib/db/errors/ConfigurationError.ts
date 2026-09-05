import { DatabaseError } from "./DatabaseError";

/**
 * Thrown when the database layer itself is misconfigured: a missing or
 * unsupported adapter type, a missing env var an adapter/extension needs,
 * or an empty config object. This is always a setup problem — fix the
 * environment or the config passed to `createDatabaseService`, not the
 * caller's data.
 */
export class ConfigurationError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, "CONFIGURATION_ERROR", options);
  }
}
