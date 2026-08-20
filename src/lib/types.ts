export type Locale = "en" | "zh" | "ja";

export const LOCALES: Locale[] = ["en", "zh", "ja"];
export const DEFAULT_LOCALE: Locale = "en";

export interface Region {
  name: string;
  domain: string;
  url: string;
}

export interface RegionInfo {
  region: string;
  url: string;
}

export interface ServerPoint {
  lat: number;
  lon: number;
  region: string;
  url: string;
}

export interface ClientPoint {
  lat: number;
  lon: number;
  region: string;
  count: number;
}

export interface AggregatedMapData {
  bakedAt?: string;
  source?: string;
  isSnapshot?: boolean;
  regions: RegionInfo[];
  servers: ServerPoint[];
  clientCount: number;
  clients: ClientPoint[];
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
  size: number;
  contentType: string;
}

export interface BakedRelease {
  bakedAt: string;
  tagName: string;
  name: string;
  publishedAt: string;
  repo: string;
  assets: ReleaseAsset[];
}

export interface RegionHealth {
  region: string;
  url: string;
  healthy: boolean | null;
  latencyMs: number | null;
}

export interface RegionNetworkStats {
  region: string;
  sharesOnline: number | null;
  shareListings: number | null;
}

export interface NetworkStats {
  bakedAt?: string;
  source?: string;
  isSnapshot?: boolean;
  sharesOnline: number | null;
  shareListings: number | null;
  byRegion: RegionNetworkStats[];
}

/** One model row from a router's `/v1/public/usage/global`. */
export interface UsageModelRow {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheTokens: number;
  totalTokens: number;
}

export interface RegionUsage {
  region: string;
  /** False when the region did not answer — distinct from an answer of zero. */
  reporting: boolean;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheTokens: number;
  models: UsageModelRow[];
}

export interface AggregatedUsage {
  bakedAt?: string;
  source?: string;
  isSnapshot?: boolean;
  period: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheTokens: number;
  /** Summed across every reporting region, then sorted — never truncated here. */
  models: UsageModelRow[];
  byRegion: RegionUsage[];
  regionsReporting: number;
  regionsTotal: number;
  missingRegions: string[];
  /** True when at least one region is missing, so the total is a floor. */
  partial: boolean;
}
