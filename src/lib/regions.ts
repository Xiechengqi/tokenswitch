import regionsData from "@/data/baked/regions.json";
import marketsReadyData from "@/data/markets-ready.json";
import type { Locale, Region } from "./types";
import { REGIONS_RAW_URL } from "./constants";
import { safeFetch } from "./safe-fetch";

export interface BakedRegions {
  bakedAt: string;
  regions: Region[];
}

export function getBakedRegions(): BakedRegions {
  return regionsData as BakedRegions;
}

export function isMarketReady(regionName: string): boolean {
  const ready = (marketsReadyData as { ready: string[] }).ready ?? [];
  return ready.includes(regionName.toLowerCase());
}

export function regionLabel(name: string, locale: Locale): string {
  const labels: Record<string, { en: string; zh: string; ja: string }> = {
    japan: { en: "Japan", zh: "日本", ja: "日本" },
    singapore: { en: "Singapore", zh: "新加坡", ja: "シンガポール" },
    hongkong: { en: "Hong Kong", zh: "香港", ja: "香港" },
  };
  const hit = labels[name.toLowerCase()];
  if (hit) return hit[locale];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function tokenMarketUrl(region: Region): string {
  return `https://market.${region.domain}`;
}

/** Share Market is no longer a standalone service — it is a module inside the
 * router (cc-switch-router `src/share_market.rs`), and its UI is a route on the
 * router's own dashboard rather than a `share-market.` subdomain. */
export function shareMarketUrl(region: Region): string {
  return `${region.url.replace(/\/$/, "")}/share-market`;
}

/** Public catalog endpoint for the same module. Anonymous reads are allowed
 * (`resolve_router_session` yields an Option), but the route is merged outside
 * the router's `public_cors_layer`, so a cross-origin browser fetch is still
 * blocked until CORS is extended to it. Callers degrade to the snapshot. */
export function shareMarketListingsUrl(region: Pick<Region, "url">): string {
  return `${region.url.replace(/\/$/, "")}/v1/share-market/listings`;
}

export function routerDashboardUrl(region: Region): string {
  return region.url;
}

export function parseRegionsText(text: string): Region[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, domain] = line.split(":");
      if (!name?.trim() || !domain?.trim()) return null;
      const d = domain.trim();
      return {
        name: name.trim(),
        domain: d,
        url: d.startsWith("http") ? d : `https://${d}`,
      };
    })
    .filter((r): r is Region => r != null);
}

/** Browser refresh of region membership from the router repo raw file. */
export async function fetchLiveRegions(): Promise<Region[] | null> {
  const res = await safeFetch(REGIONS_RAW_URL, { mode: "cors", cache: "no-store" });
  if (!res?.ok) return null;
  try {
    const text = await res.text();
    const regions = parseRegionsText(text);
    return regions.length > 0 ? regions : null;
  } catch {
    return null;
  }
}

/** Prefer an explicit list, else live GitHub `regions`, else baked snapshot. */
export async function resolveRegions(preferred?: Region[]): Promise<Region[]> {
  if (preferred?.length) return preferred;
  const live = await fetchLiveRegions();
  if (live?.length) return live;
  return getBakedRegions().regions;
}
