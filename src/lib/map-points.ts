import mapPointsData from "@/data/baked/map-points.json";
import type { AggregatedMapData, Region } from "./types";
import { resolveRegions } from "./regions";
import { safeFetch } from "./safe-fetch";

const POLL_INTERVAL_MS = 60_000;

export function getBakedMapPoints(): AggregatedMapData {
  const data = mapPointsData as AggregatedMapData;
  return { ...data, isSnapshot: true };
}

/**
 * Aggregate public map points from every known region router.
 * Pass `regions` from `useRegions()` so UI membership and fetches stay in sync;
 * otherwise resolves live GitHub `regions` with baked fallback.
 */
export async function fetchLiveMapPoints(
  regions?: Region[],
): Promise<AggregatedMapData | null> {
  const list = await resolveRegions(regions);
  if (!list.length) return null;

  const results = await Promise.allSettled(
    list.map(async (region) => {
      const url = `${region.url.replace(/\/$/, "")}/v1/public/map-points`;
      const res = await safeFetch(url, { mode: "cors" });
      if (!res?.ok) throw new Error(`HTTP ${res?.status ?? "failed"}`);
      const data = await res.json();
      return { region: region.name, baseUrl: region.url, data };
    }),
  );

  const aggregated: AggregatedMapData = {
    regions: list.map((r) => ({ region: r.name, url: r.url })),
    servers: [],
    clientCount: 0,
    clients: [],
    isSnapshot: false,
  };

  let ok = 0;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    ok += 1;
    const { region, baseUrl, data } = result.value;
    if (data.server) {
      aggregated.servers.push({
        lat: data.server.lat,
        lon: data.server.lon,
        region,
        url: baseUrl,
      });
    }
    const clients = data.clients ?? [];
    // Prefer router clientCount (true active installations); clients[] may be country-aggregated.
    aggregated.clientCount +=
      typeof data.clientCount === "number" && data.clientCount > 0
        ? data.clientCount
        : clients.reduce((sum: number, c: { count?: number }) => sum + (c.count ?? 1), 0);
    for (const c of clients) {
      aggregated.clients.push({
        lat: c.lat,
        lon: c.lon,
        region,
        count: c.count ?? 1,
      });
    }
  }

  return ok > 0 ? aggregated : null;
}

export async function probeRegionHealth(
  url: string,
): Promise<{ healthy: boolean; latencyMs: number } | null> {
  const start = performance.now();
  try {
    const res = await safeFetch(`${url.replace(/\/$/, "")}/v1/healthz`, {
      mode: "cors",
      cache: "no-store",
    });
    if (!res?.ok) return { healthy: false, latencyMs: Math.round(performance.now() - start) };
    const body = await res.json();
    return {
      healthy: body?.ok === true,
      latencyMs: Math.round(performance.now() - start),
    };
  } catch {
    return null;
  }
}

export { POLL_INTERVAL_MS };
