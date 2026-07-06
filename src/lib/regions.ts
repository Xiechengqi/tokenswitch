import regionsData from "@/data/baked/regions.json";
import type { Region } from "./types";

export interface BakedRegions {
  bakedAt: string;
  regions: Region[];
}

export function getBakedRegions(): BakedRegions {
  return regionsData as BakedRegions;
}

import type { Locale } from "./types";

export function regionLabel(name: string, locale: Locale): string {
  const labels: Record<string, { en: string; zh: string; ja: string }> = {
    japan: { en: "Japan", zh: "日本", ja: "日本" },
    singapore: { en: "Singapore", zh: "新加坡", ja: "シンガポール" },
  };
  const hit = labels[name.toLowerCase()];
  if (hit) return hit[locale];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function tokenMarketUrl(region: Region): string {
  return `https://market.${region.domain}`;
}

export function shareMarketUrl(region: Region): string {
  return `https://share-market.${region.domain}`;
}

export function routerDashboardUrl(region: Region): string {
  return region.url;
}
