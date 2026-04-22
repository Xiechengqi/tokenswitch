import { useEffect, useRef, useCallback } from 'react';
import { createClientState } from '../lib/animation';

const API_URL = '/api/map-points';
const POLL_INTERVAL = 60000;

export function useMapPoints(onUpdate) {
  const stateRef = useRef({
    regions: [],
    servers: [],
    clientCount: 0,
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
    state.clientCount = data.clientCount || 0;

    const newKeys = new Map();
    const incoming = data.clients || [];

    for (const c of incoming) {
      const key = `${c.region}:${c.lat},${c.lon}`;
      newKeys.set(key, c);
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

    onUpdate({
      regions: state.regions,
      servers: state.servers,
      clientCount: state.clientCount || incoming.reduce((sum, client) => sum + (client.count || 1), 0),
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
