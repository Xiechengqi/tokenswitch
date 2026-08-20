import bakedUsage from "@/data/baked/usage.json";
import type { AggregatedUsage, Region, RegionUsage, UsageModelRow } from "./types";
import { resolveRegions } from "./regions";
import { safeFetch } from "./safe-fetch";

/** The only window the site shows. The router also serves `7d` and `30d`. */
export const USAGE_PERIOD = "24h";
export const USAGE_POLL_INTERVAL_MS = 60_000;
/** Model rows rendered before the remainder collapses into one "other" row. */
export const USAGE_MODEL_ROWS = 8;

export function getBakedUsage(): AggregatedUsage {
  return { ...(bakedUsage as AggregatedUsage), isSnapshot: true };
}

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Mirrors the router's `format_compact_number` (embed_usage.rs) so the site and
 * the SVG badges in the router README never disagree about the same figure. */
export function formatCompactTokens(value: number): string {
  const units: [number, string][] = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ];
  for (const [threshold, suffix] of units) {
    if (value >= threshold) {
      const scaled = value / threshold;
      const text = scaled.toFixed(scaled >= 100 ? 0 : 1);
      return `${text.replace(/\.0$/, "")}${suffix}`;
    }
  }
  return String(Math.round(value));
}

export function formatFullTokens(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** The router splits cache into read and creation; the badge and this site both
 * report the sum, so the three parts add up to the total on screen. */
function normalizeModelRow(raw: Record<string, unknown>): UsageModelRow | null {
  const model = typeof raw.model === "string" ? raw.model.trim() : "";
  if (!model) return null;
  return {
    model,
    inputTokens: toCount(raw.inputTokens),
    outputTokens: toCount(raw.outputTokens),
    cacheTokens: toCount(raw.cacheReadTokens) + toCount(raw.cacheCreationTokens),
    totalTokens: toCount(raw.totalTokens),
  };
}

/** A per-minute cache key. Cloudflare rewrites `Cache-Control: max-age` upward on
 * the router's public routes, and a rewritten `max-age` outlives `no-store`; a
 * changing query string does not. */
function minuteBucket(): number {
  return Math.floor(Date.now() / 60_000);
}

export async function fetchRegionUsage(region: Region): Promise<RegionUsage | null> {
  const base = region.url.replace(/\/$/, "");
  const res = await safeFetch(
    `${base}/v1/public/usage/global?period=${USAGE_PERIOD}&t=${minuteBucket()}`,
    { mode: "cors", cache: "no-store" },
  );
  // 404 is the expected answer from a router that predates this endpoint —
  // treat it exactly like an unreachable region rather than as a zero.
  if (!res?.ok) return null;
  try {
    const data = await res.json();
    if (data == null || typeof data !== "object") return null;
    const models = Array.isArray(data.models)
      ? data.models
          .map((row: Record<string, unknown>) => normalizeModelRow(row))
          .filter((row: UsageModelRow | null): row is UsageModelRow => row != null)
      : [];
    return {
      region: region.name,
      reporting: true,
      totalTokens: toCount(data.totalTokens),
      inputTokens: toCount(data.inputTokens),
      outputTokens: toCount(data.outputTokens),
      cacheTokens: toCount(data.cacheReadTokens) + toCount(data.cacheCreationTokens),
      models,
    };
  } catch {
    return null;
  }
}

/** Sum whole regions, never truncated ones. The router returns every model row by
 * default precisely so this can happen before any cut: capping each region first
 * drops its long tail, and the visible rows stop adding up to the total. */
export function aggregateUsage(
  regions: Region[],
  rows: (RegionUsage | null)[],
): AggregatedUsage | null {
  const byRegion: RegionUsage[] = [];
  const missingRegions: string[] = [];
  const modelTotals = new Map<string, UsageModelRow>();
  let totalTokens = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheTokens = 0;
  let regionsReporting = 0;

  regions.forEach((region, index) => {
    const row = rows[index] ?? null;
    if (!row) {
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
    regionsReporting += 1;
    byRegion.push(row);
    totalTokens += row.totalTokens;
    inputTokens += row.inputTokens;
    outputTokens += row.outputTokens;
    cacheTokens += row.cacheTokens;
    for (const model of row.models) {
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

  if (regionsReporting === 0) return null;

  const models = [...modelTotals.values()].sort((a, b) => {
    // The router emits an "unknown" bucket for requests whose model it could not
    // read. It is a real row, but it never leads the list.
    const aUnknown = a.model === "unknown" ? 1 : 0;
    const bUnknown = b.model === "unknown" ? 1 : 0;
    if (aUnknown !== bUnknown) return aUnknown - bUnknown;
    return b.totalTokens - a.totalTokens || a.model.localeCompare(b.model);
  });

  return {
    bakedAt: new Date().toISOString(),
    source: "live",
    isSnapshot: false,
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
}

/** Cut the tail into a single "other" row so the visible rows still sum to the
 * total. Returns the tail count so the caller can label it. */
export function splitModelRows(
  models: UsageModelRow[],
  limit = USAGE_MODEL_ROWS,
): {
  rows: UsageModelRow[];
  otherCount: number;
  otherTokens: number;
  /** Models the disclosure actually accounts for — the zero-token rows are
   * dropped, so this is what the toggle should promise, not `models.length`. */
  modelCount: number;
} {
  const shown = models.filter((row) => row.totalTokens > 0);
  if (shown.length <= limit) {
    return { rows: shown, otherCount: 0, otherTokens: 0, modelCount: shown.length };
  }
  const rows = shown.slice(0, limit);
  const tail = shown.slice(limit);
  return {
    rows,
    otherCount: tail.length,
    otherTokens: tail.reduce((sum, row) => sum + row.totalTokens, 0),
    modelCount: shown.length,
  };
}

export async function fetchLiveUsage(regions?: Region[]): Promise<AggregatedUsage | null> {
  try {
    const list = await resolveRegions(regions);
    if (!list.length) return null;
    const rows = await Promise.all(list.map((region) => fetchRegionUsage(region)));
    return aggregateUsage(list, rows);
  } catch {
    return null;
  }
}
