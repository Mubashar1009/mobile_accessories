import "server-only";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

interface ErrorInfo {
  errorName: string;
  errorMessage: string;
  errorCode?: unknown;
  errorCause?: unknown;
  stack?: string;
}

// Custom error classes across this app (DatabaseError and its subclasses,
// AuthError, StorageError, …) all carry a stable `.code` — surface it
// alongside name/message/stack so a log line identifies *which* known
// failure mode this was, not just "Error: something broke".
function toErrorInfo(error: unknown): ErrorInfo | { error: string } {
  if (error instanceof Error) {
    const info: ErrorInfo = { errorName: error.name, errorMessage: error.message };
    if ("code" in error) {
      info.errorCode = (error as { code?: unknown }).code;
    }
    if (error.cause !== undefined) {
      info.errorCause = error.cause instanceof Error ? error.cause.message : error.cause;
    }
    if (process.env.NODE_ENV !== "production") {
      info.stack = error.stack;
    }
    return info;
  }
  return { error: String(error) };
}

function format(level: LogLevel, message: string, context?: LogContext): [string, LogContext | undefined] {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  return [line, context && Object.keys(context).length > 0 ? context : undefined];
}

/**
 * Small structured logger for server-side application code (adapters,
 * extensions, domain services, instrumentation) — as opposed to
 * `src/db/migrationmanager.ts`/`src/lib/migrate.ts`, where `console.log`
 * IS the CLI's user-facing output, not application logging, and stays
 * untouched.
 *
 * Wraps `console.*` rather than replacing it outright: in this project's
 * current deployment (no external log aggregator wired up), stdout/stderr
 * is where logs need to end up either way. What this adds over bare
 * `console.warn(msg, err)` calls is a consistent leveled shape and an
 * `error` param that's unpacked into structured fields (name, message,
 * `.code`, `.cause`, stack in development) instead of being stringified
 * ad hoc at each call site.
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "production") return;
    const [line, ctx] = format("debug", message, context);
    console.debug(line, ctx ?? "");
  },
  info(message: string, context?: LogContext): void {
    const [line, ctx] = format("info", message, context);
    console.info(line, ctx ?? "");
  },
  /** `error` is typically a caught exception, but any context value works. */
  warn(message: string, error?: unknown, context?: LogContext): void {
    const merged = { ...(error !== undefined ? toErrorInfo(error) : {}), ...context };
    const [line, ctx] = format("warn", message, merged);
    console.warn(line, ctx ?? "");
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    const merged = { ...(error !== undefined ? toErrorInfo(error) : {}), ...context };
    const [line, ctx] = format("error", message, merged);
    console.error(line, ctx ?? "");
  },
};
