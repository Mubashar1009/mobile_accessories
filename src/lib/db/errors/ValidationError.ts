import { DatabaseError } from "./DatabaseError";

/**
 * Thrown when the caller's input can't safely be turned into a query: an
 * invalid table/column identifier, or a create/update call with no fields.
 * Unlike ConfigurationError, this is the caller's data, not the setup.
 */
export class ValidationError extends DatabaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, "VALIDATION_ERROR", options);
  }
}
