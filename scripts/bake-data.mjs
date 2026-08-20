#!/usr/bin/env node
/**
 * Build-time data baker: regions, map-points, network stats, cross-region 24h
 * token usage, and GitHub release info.
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

/** Keep in sync with `USAGE_PERIOD` in src/lib/usage.ts — the baked snapshot and
 * the browser refresh have to describe the same window. */
const USAGE_PERIOD = "24h";

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
  { name: "usa", domain: "ustokenswitch.cc", url: "https://ustokenswitch.cc" },
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
  shareListings: null,
  byRegion: [],
};

/** Matches `AggregatedUsage` in src/lib/types.ts. `regionsReporting: 0` is what
 * the UI reads as "no usage data", so the panel hides itself instead of
 * rendering a fabricated zero. */
const FALLBACK_USAGE = {
  bakedAt: new Date().toISOString(),
  source: "fallback",
  period: USAGE_PERIOD,
  totalTokens: 0,
  inputTokens: 0,
  outputTokens: 0,
  cacheTokens: 0,
  models: [],
  byRegion: [],
  regionsReporting: 0,
  regionsTotal: 0,
  missingRegions: [],
  partial: true,
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
  let shareListings = 0;
  let routerOk = 0;
  const byRegion = [];

  const results = await Promise.allSettled(
    regions.map(async (region) => {
      const base = region.url.replace(/\/$/, "");
      // Both endpoints live on the router itself. The former `market.<domain>`
      // and `share-market.<domain>` hosts were retired when the markets moved
      // into the router; fetching them only ever produced silent failures.
      const [routerRes, listingsRes] = await Promise.allSettled([
        fetchJson(`${base}/v1/public/network-stats`),
        fetchJson(`${base}/v1/share-market/listings`),
      ]);
      return { region: region.name, routerRes, listingsRes };
    }),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { region, routerRes, listingsRes } = result.value;
    let regionShares = null;
    let regionListings = null;

    if (routerRes.status === "fulfilled") {
      routerOk += 1;
      regionShares = Number(routerRes.value.activeShares ?? 0);
      sharesOnline += regionShares;
    }
    if (listingsRes.status === "fulfilled") {
      const listings = Array.isArray(listingsRes.value.listings)
        ? listingsRes.value.listings
        : [];
      regionListings = listings.length;
      shareListings += regionListings;
    }

    byRegion.push({
      region,
      sharesOnline: regionShares,
      shareListings: regionListings,
    });
  }

  if (routerOk === 0 && shareListings === 0) {
    console.warn("bake: network-stats — all fetches failed, using fallback");
    const fallback = previous ?? FALLBACK_NETWORK_STATS;
    await writeJson(outPath, { ...fallback, bakedAt: new Date().toISOString() });
    return fallback;
  }

  const data = {
    bakedAt: new Date().toISOString(),
    source: "live",
    sharesOnline: routerOk > 0 ? sharesOnline : null,
    shareListings: shareListings > 0 ? shareListings : null,
    byRegion,
  };
  await writeJson(outPath, data);
  console.log(
    `bake: network-stats (shares=${data.sharesOnline}, listings=${data.shareListings})`,
  );
  return data;
}

function usageCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Cross-region 24h token usage, summed before anything is truncated.
 *
 * Mirrors `aggregateUsage` in src/lib/usage.ts: the same shape has to come out
 * of the build-time bake and the browser refresh, or the first paint would
 * disagree with the value that replaces it a moment later. A region that does
 * not answer is recorded as `reporting: false`, never as a zero — an old router
 * build answers 404 here, and counting that as no traffic would understate the
 * network total without saying so. */
async function bakeUsage(regionsData, previous) {
  const outPath = join(OUT_DIR, "usage.json");
  const regions = regionsData?.regions ?? FALLBACK_REGIONS;

  const results = await Promise.allSettled(
    regions.map(async (region) => {
      const base = region.url.replace(/\/$/, "");
      // No `models=` cap: every row is needed here, because truncating a region
      // before summing drops that region's long tail and the model rows stop
      // adding up to the total.
      const data = await fetchJson(
        `${base}/v1/public/usage/global?period=${USAGE_PERIOD}`,
      );
      return { region: region.name, data };
    }),
  );

  const byRegion = [];
  const missingRegions = [];
  const modelTotals = new Map();
  let totalTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheTokens = 0;
  let regionsReporting = 0;

  regions.forEach((region, index) => {
    const result = results[index];
    if (result.status !== "fulfilled" || !result.value?.data) {
      missingRegions.push(region.name);
      byRegion.push({
        region: region.name,
        reporting: false,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheTokens: 0,
        models: [],
      });
      return;
    }
    const data = result.value.data;
    const models = (Array.isArray(data.models) ? data.models : [])
      .map((row) => {
        const model = typeof row?.model === "string" ? row.model.trim() : "";
        if (!model) return null;
        return {
          model,
          inputTokens: usageCount(row.inputTokens),
          outputTokens: usageCount(row.outputTokens),
          cacheTokens:
            usageCount(row.cacheReadTokens) + usageCount(row.cacheCreationTokens),
          totalTokens: usageCount(row.totalTokens),
        };
      })
      .filter(Boolean);

    const row = {
      region: region.name,
      reporting: true,
      totalTokens: usageCount(data.totalTokens),
      inputTokens: usageCount(data.inputTokens),
      outputTokens: usageCount(data.outputTokens),
      cacheTokens:
        usageCount(data.cacheReadTokens) + usageCount(data.cacheCreationTokens),
      models,
    };

    regionsReporting += 1;
    byRegion.push(row);
    totalTokens += row.totalTokens;
    inputTokens += row.inputTokens;
    outputTokens += row.outputTokens;
    cacheTokens += row.cacheTokens;
    for (const model of models) {
      const hit = modelTotals.get(model.model);
      if (hit) {
        hit.inputTokens += model.inputTokens;
        hit.outputTokens += model.outputTokens;
        hit.cacheTokens += model.cacheTokens;
        hit.totalTokens += model.totalTokens;
      } else {
        modelTotals.set(model.model, { ...model });
      }
    }
  });

  if (regionsReporting === 0) {
    console.warn("bake: usage — no region reported, using fallback");
    const fallback = previous ?? FALLBACK_USAGE;
    await writeJson(outPath, { ...fallback, bakedAt: new Date().toISOString() });
    return fallback;
  }

  const models = [...modelTotals.values()].sort((a, b) => {
    // "unknown" is a real bucket the router emits for requests whose model it
    // could not read, but it never leads the list.
    const aUnknown = a.model === "unknown" ? 1 : 0;
    const bUnknown = b.model === "unknown" ? 1 : 0;
    if (aUnknown !== bUnknown) return aUnknown - bUnknown;
    return b.totalTokens - a.totalTokens || a.model.localeCompare(b.model);
  });

  const data = {
    bakedAt: new Date().toISOString(),
    source: "live",
    period: USAGE_PERIOD,
    totalTokens,
    inputTokens,
    outputTokens,
    cacheTokens,
    models,
    byRegion,
    regionsReporting,
    regionsTotal: regions.length,
    missingRegions,
    partial: missingRegions.length > 0,
  };
  await writeJson(outPath, data);
  console.log(
    `bake: usage (${regionsReporting}/${regions.length} regions, ${totalTokens} tokens, ${models.length} models)`,
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
  const prevUsage = await readJsonSafe(join(OUT_DIR, "usage.json"));
  const prevRelease = await readJsonSafe(join(OUT_DIR, "release.json"));

  const regions = await bakeRegions(prevRegions);
  await bakeMapPoints(regions, prevMapPoints);
  await bakeNetworkStats(regions, prevNetworkStats);
  await bakeUsage(regions, prevUsage);
  await bakeRelease(prevRelease);
  console.log("bake: done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
