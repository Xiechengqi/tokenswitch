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
  tokenMarketShares: number | null;
  shareListings: number | null;
}

export interface NetworkStats {
  bakedAt?: string;
  source?: string;
  isSnapshot?: boolean;
  sharesOnline: number | null;
  tokenMarketShares: number | null;
  shareListings: number | null;
  publicModels: string[];
  byRegion: RegionNetworkStats[];
}
