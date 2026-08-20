"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLiveUsage,
  getBakedUsage,
  USAGE_POLL_INTERVAL_MS,
} from "@/lib/usage";
import { useRegions } from "@/hooks/useRegions";
import type { AggregatedUsage } from "@/lib/types";

/** Baked snapshot for the first paint, then the same cross-region aggregate
 * refreshed in the browser once a minute. Mirrors `useNetworkStats`: a failed
 * refresh keeps the last good value rather than blanking the panel, and polling
 * stops while the tab is hidden. */
export function useNetworkUsage(): AggregatedUsage {
  const regions = useRegions();
  const [usage, setUsage] = useState<AggregatedUsage>(() => getBakedUsage());

  const apply = useCallback((next: AggregatedUsage) => {
    setUsage(next);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const live = await fetchLiveUsage(regions);
        if (cancelled || !live) return;
        apply(live);
      } catch {
        /* keep last usage */
      }
    };

    timer = setInterval(refresh, USAGE_POLL_INTERVAL_MS);
    void refresh();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [apply, regions]);

  return usage;
}
