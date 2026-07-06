"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  fetchLiveMapPoints,
  getBakedMapPoints,
  POLL_INTERVAL_MS,
} from "@/lib/map-points";
import { createClientState, type ClientAnimState } from "@/lib/animation";
import type { AggregatedMapData, ClientPoint, ServerPoint } from "@/lib/types";

interface MapRenderData {
  regions: AggregatedMapData["regions"];
  servers: ServerPoint[];
  clients: ClientAnimState[];
}

interface MapPointsState extends AggregatedMapData {
  clients: ClientAnimState[];
}

function mergeClientPoints(
  state: { clients: ClientAnimState[]; clientKeys: Set<string> },
  incoming: ClientPoint[],
) {
  const newKeys = new Set<string>();
  for (const c of incoming) {
    const key = `${c.region}:${c.lat},${c.lon}`;
    newKeys.add(key);
    if (!state.clientKeys.has(key)) {
      state.clients.push(createClientState(c.lat, c.lon, key, c.region, c.count || 1));
      continue;
    }
    const existing = state.clients.find((client) => client.key === key);
    if (existing) {
      existing.count = c.count || 1;
      existing.region = c.region;
    }
  }
  for (const c of state.clients) {
    if (!newKeys.has(c.key) && !c.exiting) {
      c.exiting = true;
      c.exitProgress = 0;
    }
  }
  state.clientKeys = newKeys;
}

export function useMapPoints(onUpdate: (data: MapPointsState) => void) {
  const stateRef = useRef({
    regions: [] as AggregatedMapData["regions"],
    servers: [] as AggregatedMapData["servers"],
    clientCount: 0,
    clients: [] as ClientAnimState[],
    clientKeys: new Set<string>(),
    isSnapshot: true,
  });
  const liveEnabledRef = useRef(true);

  const applyPayload = useCallback(
    (payload: AggregatedMapData) => {
      const state = stateRef.current;
      state.regions = payload.regions;
      state.servers = payload.servers;
      state.clientCount = payload.clientCount;
      state.isSnapshot = payload.isSnapshot ?? false;
      mergeClientPoints(state, payload.clients);
      onUpdate({
        regions: state.regions,
        servers: state.servers,
        clientCount: state.clientCount,
        clients: state.clients,
        isSnapshot: state.isSnapshot,
      });
    },
    [onUpdate],
  );

  useEffect(() => {
    applyPayload(getBakedMapPoints());

    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const refresh = async () => {
      if (!liveEnabledRef.current || document.visibilityState === "hidden") return;
      try {
        const live = await fetchLiveMapPoints();
        if (cancelled) return;
        if (live) {
          applyPayload(live);
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
  }, [applyPayload]);

  return stateRef;
}
