import { logger } from "@/lib/logger";

export async function register() {
  // Core's adapters (pg, supabase-js) are Node-only — skip on the edge
  // runtime, where this hook also fires but those packages can't load.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Core, buildCoreConfigFromEnv } = await import("@/lib/core");
    try {
      Core.initialize(buildCoreConfigFromEnv());
    } catch (error) {
      // `register()` must resolve before the server accepts ANY request —
      // a throw here takes down the whole app, including pages that never
      // touch Core (e.g. this project's static storefront pages) and dev
      // environments that simply haven't set DB/Supabase env vars yet.
      // Log and move on: Core.db/Core.storage retry initialization
      // themselves on first real access, so a genuine misconfiguration
      // still surfaces — just on first actual use instead of at boot.
      logger.warn("[instrumentation] Core.initialize() failed at server boot — will retry on first use", error);
    }
  }
}
