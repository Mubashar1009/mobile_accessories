"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { getLastSyncedAt } from "@/lib/offlineSearchIndex";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/**
 * Live "you're offline" banner for the offline search index. Only visible
 * while `navigator.onLine` is false, and reports how long ago the local
 * IndexedDB mirror was last synced so the user knows results may be stale.
 * Reacts to the browser's online/offline events without a page refresh.
 */
export function OfflineSearchStatus() {
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => {
      setOnline(false);
      getLastSyncedAt().then(setLastSyncedAt);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      getLastSyncedAt().then(setLastSyncedAt);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        Showing cached results
        {lastSyncedAt ? `, last synced ${formatRelativeTime(lastSyncedAt)}` : ""}
      </span>
    </div>
  );
}
