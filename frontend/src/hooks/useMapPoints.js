import { useEffect, useRef, useCallback } from 'react';
import { createClientState } from '../lib/animation';

const API_URL = '/api/map-points';
const POLL_INTERVAL = 60000;

export function useMapPoints(onUpdate) {
  const stateRef = useRef({
    regions: [],
    servers: [],
    clients: [],
    clientKeys: new Map(),
  });

  const tryFetch = useCallback(async () => {
    const state = stateRef.current;

    let data;
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      data = await res.json();
    } catch {
      return;
    }

    state.regions = data.regions || [];
    state.servers = data.servers || [];

    const newKeys = new Map();
    const incoming = data.clients || [];

    const keyCounts = new Map();
    for (const c of incoming) {
      const base = `${c.lat},${c.lon}`;
      const n = keyCounts.get(base) || 0;
      keyCounts.set(base, n + 1);
      const key = n === 0 ? base : `${base}#${n}`;
      newKeys.set(key, c);
      if (!state.clientKeys.has(key)) {
        state.clients.push(createClientState(c.lat, c.lon, key));
      }
    }

    for (const c of state.clients) {
      if (!newKeys.has(c.key) && !c.exiting) {
        c.exiting = true;
        c.exitProgress = 0;
      }
    }

    state.clientKeys = newKeys;

    onUpdate({
      regions: state.regions,
      servers: state.servers,
      clients: state.clients,
    });
  }, [onUpdate]);

  useEffect(() => {
    tryFetch();
    const id = setInterval(tryFetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [tryFetch]);

  return stateRef;
}
