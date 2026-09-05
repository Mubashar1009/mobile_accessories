import "server-only";

import { buildCoreConfigFromEnv, Core } from "@/lib/core";
import { logger } from "@/lib/logger";
import { AuthService } from "@/lib/services/AuthService";
import { ProductService } from "@/lib/services/ProductService";

// Defensive, best-effort — instrumentation.ts already calls Core.initialize()
// once at server boot. This must never throw here: this module is imported
// (eagerly evaluated) by every action module, and Next.js evaluates action
// modules during `next build`'s page-data collection for pages that use
// them — even ones that end up never calling a service. Correctness doesn't
// depend on this succeeding: Core.db/Core.storage self-heal on first real
// access (see Core.ts), and `lazy()` below defers reaching them until a
// service method is actually called.
try {
  Core.initialize(buildCoreConfigFromEnv());
} catch (error) {
  // Expected in dev before env vars are set and during some build phases —
  // debug level (suppressed in production) rather than warn, since
  // `lazy()` below resolves it for real on first actual use.
  logger.debug("[registry] Core.initialize() deferred — will resolve lazily on first use", {
    reason: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Defers constructing a service (and reading Core.db/Core.storage, which
 * throws on bad config) until the first time one of its methods is
 * actually called — never at module-evaluation time.
 */
function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      instance ??= factory();
      const value = Reflect.get(instance, prop, receiver);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const productService = lazy(() => new ProductService({ db: Core.db, storage: Core.storage }));
export const authService = lazy(() => new AuthService({ db: Core.db, storage: Core.storage }));
