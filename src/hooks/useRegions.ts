"use client";

import { useEffect, useState } from "react";
import type { Region } from "@/lib/types";
import { fetchLiveRegions, getBakedRegions } from "@/lib/regions";

/** Baked regions first; refresh from GitHub raw `regions` when available. */
export function useRegions(): Region[] {
  const [regions, setRegions] = useState<Region[]>(() => getBakedRegions().regions);

  useEffect(() => {
    let cancelled = false;
    void fetchLiveRegions().then((live) => {
      if (!cancelled && live?.length) setRegions(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return regions;
}
