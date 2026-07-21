#!/usr/bin/env node
/**
 * Build-time data baker: regions, map-points snapshot, GitHub release info.
 * On failure, keeps the previous baked JSON files as fallback.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src", "data", "baked");
const LOCAL_REGIONS = join(ROOT, "..", "cc-switch-router", "regions");

const REGIONS_RAW_URLS = [
  "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/refs/heads/master/regions",
  "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/master/regions",
  "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/main/regions",
];
const RELEASES_URL =
  "https://api.github.com/repos/xiechengqi/cc-switch-server/releases/latest";

const FALLBACK_REGIONS = [
  { name: "japan", domain: "jptokenswitch.cc", url: "https://jptokenswitch.cc" },
  {
    name: "singapore",
    domain: "sgptokenswitch.cc",
    url: "https://sgptokenswitch.cc",
  },
  {
    name: "hongkong",
    domain: "hktokenswitch.cc",
    url: "https://hktokenswitch.cc",
  },
];

const FALLBACK_RELEASE = {
  tagName: "latest",
  name: "cc-switch-server",
  publishedAt: new Date().toISOString(),
  assets: [],
  repo: "xiechengqi/cc-switch-server",
};

const FALLBACK_MAP_POINTS = {
  bakedAt: new Date().toISOString(),
  source: "fallback",
  regions: FALLBACK_REGIONS.map((r) => ({ region: r.name, url: r.url })),
  servers: [],
  clientCount: 0,
  clients: [],
};

const FALLBACK_NETWORK_STATS = {
  bakedAt: new Date().toISOString(),
  source: "fallback",
  sharesOnline: null,
  tokenMarketShares: null,
  shareListings: null,
  publicModels: [],
  byRegion: [],
};

async function readJsonSafe(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function fetchJson(url, init) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "User-Agent": "tokenswitch-bake",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function parseRegionsText(text) {
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
    .filter(Boolean);
}

async function bakeRegions(previous) {
  const outPath = join(OUT_DIR, "regions.json");
  try {
    let text = null;
    try {
      text = await readFile(LOCAL_REGIONS, "utf8");
      console.log("bake: regions (local file)");
    } catch {
      for (const url of REGIONS_RAW_URLS) {
        try {
          const res = await fetch(url, {
            headers: { Accept: "text/plain", "User-Agent": "tokenswitch-bake" },
          });
          if (!res.ok) continue;
          text = await res.text();
          console.log(`bake: regions (${url})`);
          break;
        } catch {
          /* try next */
        }
      }
    }
    if (!text) throw new Error("no regions source available");
    const regions = parseRegionsText(text);
    if (regions.length === 0) throw new Error("empty regions");
    const data = { bakedAt: new Date().toISOString(), regions };
    await writeJson(outPath, data);
    console.log(`bake: regions (${regions.length})`);
    return data;
  } catch (err) {
    console.warn(`bake: regions failed — ${err.message}`);
    if (previous) return previous;
    const data = { bakedAt: new Date().toISOString(), regions: FALLBACK_REGIONS };
    await writeJson(outPath, data);
    return data;
  }
}

async function bakeMapPoints(regionsData, previous) {
  const outPath = join(OUT_DIR, "map-points.json");
  const regions = regionsData?.regions ?? FALLBACK_REGIONS;

  const results = await Promise.allSettled(
    regions.map(async (region) => {
      const url = `${region.url.replace(/\/$/, "")}/v1/public/map-points`;
      const data = await fetchJson(url);
      return { region: region.name, baseUrl: region.url, data };
    }),
  );

  const aggregated = {
    bakedAt: new Date().toISOString(),
    source: "live",
    regions: regions.map((r) => ({ region: r.name, url: r.url })),
    servers: [],
    clientCount: 0,
    clients: [],
  };

  let okCount = 0;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    okCount += 1;
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
    aggregated.clientCount +=
      data.clientCount > 0
        ? data.clientCount
        : clients.reduce((sum, c) => sum + (c.count ?? 1), 0);
    for (const c of clients) {
      aggregated.clients.push({
        lat: c.lat,
        lon: c.lon,
        region,
        count: c.count ?? 1,
      });
    }
  }

  if (okCount === 0) {
    console.warn("bake: map-points — all region fetches failed, using fallback");
    const fallback = previous ?? FALLBACK_MAP_POINTS;
    await writeJson(outPath, { ...fallback, bakedAt: new Date().toISOString() });
    return fallback;
  }

  await writeJson(outPath, aggregated);
  console.log(
    `bake: map-points (${okCount}/${regions.length} regions, ${aggregated.clientCount} clients)`,
  );
  return aggregated;
}

async function bakeNetworkStats(regionsData, previous) {
  const outPath = join(OUT_DIR, "network-stats.json");
  const regions = regionsData?.regions ?? FALLBACK_REGIONS;

  let sharesOnline = 0;
  let tokenMarketShares = 0;
  let shareListings = 0;
  let routerOk = 0;
  const modelSet = new Set();
  const byRegion = [];

  const results = await Promise.allSettled(
    regions.map(async (region) => {
      const base = region.url.replace(/\/$/, "");
      const marketBase = `https://market.${region.domain}`;
      const shareBase = `https://share-market.${region.domain}`;

      const [routerRes, marketRes, shareRes, modelsRes] = await Promise.allSettled([
        fetchJson(`${base}/v1/public/network-stats`),
        fetchJson(`${marketBase}/v1/public/dashboard/kpis?window=7d`),
        fetchJson(`${shareBase}/v1/listings`),
        fetchJson(`${marketBase}/v1/public/dashboard/top-models?days=30&limit=10`),
      ]);

      return { region: region.name, routerRes, marketRes, shareRes, modelsRes };
    }),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { region, routerRes, marketRes, shareRes, modelsRes } = result.value;
    let regionShares = null;
    let regionMarketShares = null;
    let regionListings = null;

    if (routerRes.status === "fulfilled") {
      routerOk += 1;
      regionShares = Number(routerRes.value.activeShares ?? 0);
      sharesOnline += regionShares;
    }
    if (marketRes.status === "fulfilled") {
      regionMarketShares = Number(marketRes.value.onlineShares ?? 0);
      tokenMarketShares += regionMarketShares;
    }
    if (shareRes.status === "fulfilled") {
      const listings = Array.isArray(shareRes.value.listings) ? shareRes.value.listings : [];
      regionListings = listings.length;
      shareListings += regionListings;
    }
    if (modelsRes.status === "fulfilled") {
      for (const item of modelsRes.value.items ?? []) {
        if (item?.model) modelSet.add(item.model);
      }
    }

    byRegion.push({
      region,
      sharesOnline: regionShares,
      tokenMarketShares: regionMarketShares,
      shareListings: regionListings,
    });
  }

  if (routerOk === 0 && tokenMarketShares === 0 && shareListings === 0) {
    console.warn("bake: network-stats — all fetches failed, using fallback");
    const fallback = previous ?? FALLBACK_NETWORK_STATS;
    await writeJson(outPath, { ...fallback, bakedAt: new Date().toISOString() });
    return fallback;
  }

  const data = {
    bakedAt: new Date().toISOString(),
    source: "live",
    sharesOnline: routerOk > 0 ? sharesOnline : null,
    tokenMarketShares: tokenMarketShares > 0 ? tokenMarketShares : null,
    shareListings: shareListings > 0 ? shareListings : null,
    publicModels: [...modelSet].sort(),
    byRegion,
  };
  await writeJson(outPath, data);
  console.log(
    `bake: network-stats (shares=${data.sharesOnline}, market=${data.tokenMarketShares}, listings=${data.shareListings})`,
  );
  return data;
}

async function bakeRelease(previous) {
  const outPath = join(OUT_DIR, "release.json");
  try {
    const release = await fetchJson(RELEASES_URL);
    const data = {
      bakedAt: new Date().toISOString(),
      tagName: release.tag_name,
      name: release.name,
      publishedAt: release.published_at,
      repo: "xiechengqi/cc-switch-server",
      assets: (release.assets ?? []).map((a) => ({
        name: a.name,
        downloadUrl: a.browser_download_url,
        size: a.size,
        contentType: a.content_type,
      })),
    };
    await writeJson(outPath, data);
    console.log(`bake: release (${data.tagName})`);
    return data;
  } catch (err) {
    console.warn(`bake: release failed — ${err.message}`);
    if (previous) return previous;
    await writeJson(outPath, FALLBACK_RELEASE);
    return FALLBACK_RELEASE;
  }
}

async function main() {
  const prevRegions = await readJsonSafe(join(OUT_DIR, "regions.json"));
  const prevMapPoints = await readJsonSafe(join(OUT_DIR, "map-points.json"));
  const prevNetworkStats = await readJsonSafe(join(OUT_DIR, "network-stats.json"));
  const prevRelease = await readJsonSafe(join(OUT_DIR, "release.json"));

  const regions = await bakeRegions(prevRegions);
  await bakeMapPoints(regions, prevMapPoints);
  await bakeNetworkStats(regions, prevNetworkStats);
  await bakeRelease(prevRelease);
  console.log("bake: done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
