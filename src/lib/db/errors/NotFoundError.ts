import { DatabaseError } from "./DatabaseError";

/**
 * Thrown when an operation targets a specific row (by id) and no such row
 * exists — e.g. `update()` against an id that was never inserted or was
 * already deleted.
 */
export class NotFoundError extends DatabaseError {
  constructor(table: string, id: string | number, options?: { cause?: unknown }) {
    super(`No row found in "${table}" with id "${id}".`, "NOT_FOUND", options);
  }
}
