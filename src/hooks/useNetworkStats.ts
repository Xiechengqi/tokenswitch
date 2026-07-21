"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLiveNetworkStats,
  getBakedNetworkStats,
  POLL_INTERVAL_MS,
} from "@/lib/network-stats";
import { useRegions } from "@/hooks/useRegions";
import type { NetworkStats } from "@/lib/types";

export function useNetworkStats() {
  const regions = useRegions();
  const [stats, setStats] = useState<NetworkStats>(() => getBakedNetworkStats());

  const apply = useCallback((next: NetworkStats) => {
    setStats(next);
  }, []);

  useEffect(() => {
    apply(getBakedNetworkStats());

    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const live = await fetchLiveNetworkStats(regions);
        if (cancelled || !live) return;
        apply(live);
      } catch {
        /* keep last stats */
      }
    };

    timer = setInterval(refresh, POLL_INTERVAL_MS);
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

  return stats;
}
