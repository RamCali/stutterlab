"use client";

import { useEffect } from "react";
import { cacheOfflineBundle } from "@/lib/offline/daily-bundle";

export function OfflineBundleProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    async function refreshBundle() {
      try {
        const res = await fetch("/api/offline/daily-bundle");
        if (!res.ok) return;
        const data = await res.json();
        cacheOfflineBundle(data);
      } catch {
        // offline — use existing cache
      }
    }

    refreshBundle();
    const id = setInterval(refreshBundle, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
