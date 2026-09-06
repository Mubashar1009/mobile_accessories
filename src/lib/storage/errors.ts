/** Raised by a StorageAdapter for a failed upload/remove/getPublicUrl call. */
export class StorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StorageError";
  }
}
