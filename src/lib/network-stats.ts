import networkStatsData from "@/data/baked/network-stats.json";
import type { NetworkStats, Region } from "./types";
import { resolveRegions, shareMarketListingsUrl } from "./regions";
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
    // Ignore non-JSON / proxy error bodies (e.g. "unregistered-subdomain").
    if (data == null || typeof data !== "object") return null;
    return {
      activeShares: Number(data.activeShares ?? 0),
      activeClients: Number(data.activeClients ?? 0),
    };
  } catch {
    return null;
  }
}

async function fetchRegionShareMarketStats(regionUrl: string) {
  const url = shareMarketListingsUrl({ url: regionUrl });
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

/** Pass `regions` from `useRegions()` when available so stats track the same membership list. */
export async function fetchLiveNetworkStats(
  regions?: Region[],
): Promise<NetworkStats | null> {
  try {
    const list = await resolveRegions(regions);
    if (!list.length) return null;

    const results = await Promise.all(
      list.map(async (region) => {
        const [router, shareMarket] = await Promise.all([
          fetchRegionRouterStats(region.url),
          fetchRegionShareMarketStats(region.url),
        ]);
        return { region: region.name, router, shareMarket };
      }),
    );

    let sharesOnline = 0;
    let shareListings = 0;
    let routerOk = 0;
    const byRegion: NetworkStats["byRegion"] = [];

    for (const row of results) {
      if (row.router) {
        routerOk += 1;
        sharesOnline += row.router.activeShares;
      }
      if (row.shareMarket) shareListings += row.shareMarket.listingCount;
      byRegion.push({
        region: row.region,
        sharesOnline: row.router?.activeShares ?? null,
        shareListings: row.shareMarket?.listingCount ?? null,
      });
    }

    if (routerOk === 0 && shareListings === 0) {
      return null;
    }

    return {
      bakedAt: new Date().toISOString(),
      source: "live",
      sharesOnline: routerOk > 0 ? sharesOnline : null,
      shareListings: shareListings > 0 ? shareListings : null,
      byRegion,
      isSnapshot: false,
    };
  } catch {
    return null;
  }
}

export { POLL_INTERVAL_MS };
