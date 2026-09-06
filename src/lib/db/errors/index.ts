export { DatabaseError, type DatabaseErrorCode } from "./DatabaseError";
export { ConfigurationError } from "./ConfigurationError";
export { ValidationError } from "./ValidationError";
export { NotFoundError } from "./NotFoundError";
export { AdapterOperationError } from "./AdapterOperationError";
export { EncryptionError } from "./EncryptionError";

import { DatabaseError } from "./DatabaseError";

/** Narrows `unknown` (e.g. a catch-block error) to `DatabaseError`. */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}
