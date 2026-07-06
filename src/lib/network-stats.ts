import networkStatsData from "@/data/baked/network-stats.json";
import type { NetworkStats } from "./types";
import { getBakedRegions, shareMarketUrl, tokenMarketUrl } from "./regions";
import { safeFetch } from "./safe-fetch";

const POLL_INTERVAL_MS = 60_000;

export function getBakedNetworkStats(): NetworkStats {
  return { ...(networkStatsData as NetworkStats), isSnapshot: true };
}

async function fetchRegionRouterStats(baseUrl: string) {
  const res = await safeFetch(`${baseUrl.replace(/\/$/, "")}/v1/public/network-stats`, {
    mode: "cors",
    cache: "no-store",
  });
  if (!res?.ok) return null;
  try {
    const data = await res.json();
    return {
      activeShares: Number(data.activeShares ?? 0),
      activeClients: Number(data.activeClients ?? 0),
    };
  } catch {
    return null;
  }
}

async function fetchRegionMarketStats(regionDomain: string) {
  const url = `${tokenMarketUrl({ name: "", domain: regionDomain, url: "" })}/v1/public/dashboard/kpis?window=7d`;
  const res = await safeFetch(url, { mode: "cors", cache: "no-store" });
  if (!res?.ok) return null;
  try {
    const data = await res.json();
    return { onlineShares: Number(data.onlineShares ?? 0) };
  } catch {
    return null;
  }
}

async function fetchRegionShareMarketStats(regionDomain: string) {
  const url = `${shareMarketUrl({ name: "", domain: regionDomain, url: "" })}/v1/listings`;
  const res = await safeFetch(url, { mode: "cors", cache: "no-store" });
  if (!res?.ok) return null;
  try {
    const data = await res.json();
    const listings = Array.isArray(data.listings) ? data.listings : [];
    return { listingCount: listings.length };
  } catch {
    return null;
  }
}

async function fetchRegionTopModels(regionDomain: string) {
  const url = `${tokenMarketUrl({ name: "", domain: regionDomain, url: "" })}/v1/public/dashboard/top-models?days=30&limit=10`;
  const res = await safeFetch(url, { mode: "cors", cache: "no-store" });
  if (!res?.ok) return [];
  try {
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    return items
      .map((item: { model?: string }) => item.model)
      .filter((m: unknown): m is string => typeof m === "string" && m.length > 0);
  } catch {
    return [];
  }
}

export async function fetchLiveNetworkStats(): Promise<NetworkStats | null> {
  try {
    const { regions } = getBakedRegions();
    const results = await Promise.all(
      regions.map(async (region) => {
        const [router, market, shareMarket, models] = await Promise.all([
          fetchRegionRouterStats(region.url),
          fetchRegionMarketStats(region.domain),
          fetchRegionShareMarketStats(region.domain),
          fetchRegionTopModels(region.domain),
        ]);
        return { region: region.name, router, market, shareMarket, models };
      }),
    );

    let sharesOnline = 0;
    let tokenMarketShares = 0;
    let shareListings = 0;
    let routerOk = 0;
    const modelSet = new Set<string>();
    const byRegion: NetworkStats["byRegion"] = [];

    for (const row of results) {
      if (row.router) {
        routerOk += 1;
        sharesOnline += row.router.activeShares;
      }
      if (row.market) tokenMarketShares += row.market.onlineShares;
      if (row.shareMarket) shareListings += row.shareMarket.listingCount;
      for (const m of row.models) modelSet.add(m);
      byRegion.push({
        region: row.region,
        sharesOnline: row.router?.activeShares ?? null,
        tokenMarketShares: row.market?.onlineShares ?? null,
        shareListings: row.shareMarket?.listingCount ?? null,
      });
    }

    if (routerOk === 0 && tokenMarketShares === 0 && shareListings === 0) {
      return null;
    }

    return {
      bakedAt: new Date().toISOString(),
      source: "live",
      sharesOnline: routerOk > 0 ? sharesOnline : null,
      tokenMarketShares: tokenMarketShares > 0 ? tokenMarketShares : null,
      shareListings: shareListings > 0 ? shareListings : null,
      publicModels: [...modelSet].sort(),
      byRegion,
      isSnapshot: false,
    };
  } catch {
    return null;
  }
}

export { POLL_INTERVAL_MS };
