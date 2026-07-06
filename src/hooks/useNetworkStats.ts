"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLiveNetworkStats,
  getBakedNetworkStats,
  POLL_INTERVAL_MS,
} from "@/lib/network-stats";
import type { NetworkStats } from "@/lib/types";

export function useNetworkStats() {
  const [stats, setStats] = useState<NetworkStats>(() => getBakedNetworkStats());
  const liveEnabledRef = useRef(true);

  const apply = useCallback((next: NetworkStats) => {
    setStats(next);
  }, []);

  useEffect(() => {
    apply(getBakedNetworkStats());

    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const refresh = async () => {
      if (!liveEnabledRef.current || document.visibilityState === "hidden") return;
      try {
        const live = await fetchLiveNetworkStats();
        if (cancelled) return;
        if (live) {
          apply(live);
        } else {
          liveEnabledRef.current = false;
          if (timer) clearInterval(timer);
        }
      } catch {
        liveEnabledRef.current = false;
        if (timer) clearInterval(timer);
      }
    };

    timer = setInterval(refresh, POLL_INTERVAL_MS);
    void refresh();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && liveEnabledRef.current) void refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [apply]);

  return stats;
}
