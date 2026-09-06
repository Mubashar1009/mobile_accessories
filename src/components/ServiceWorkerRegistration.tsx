"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Dev: keep no service worker / caches around so hot-reload stays fresh.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        caches
          .keys()
          .then((names) => names.forEach((name) => caches.delete(name)))
          .catch(() => {});
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                toast("A new version is available.", {
                  action: {
                    label: "Refresh",
                    onClick: () => window.location.reload(),
                  },
                  duration: Infinity,
                });
              }
            });
          });
        })
        .catch(() => {});
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
