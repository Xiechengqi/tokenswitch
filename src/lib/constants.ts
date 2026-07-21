import type { Locale } from "./types";

/** Basis points — source: cc-switch-market MARKET_PLATFORM_COMMISSION_BPS */
export const MARKET_PLATFORM_COMMISSION_BPS = 1000;
/** Basis points — source: cc-switch-market MARKET_ROUTER_COMMISSION_BPS */
export const MARKET_ROUTER_COMMISSION_BPS = 500;

export function providerNetFromGross(grossUsd: number): number {
  const totalBps = MARKET_PLATFORM_COMMISSION_BPS + MARKET_ROUTER_COMMISSION_BPS;
  return grossUsd * (1 - totalBps / 10000);
}

export function formatUsd(value: number, locale: Locale): string {
  const localeTag = locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const GITHUB_REPO = "https://github.com/Xiechengqi/tokenswitch";
export const TELEGRAM_URL = "https://t.me/tokenswitchorg";
export const X_URL = "https://x.com/TokenSwitch";
/** Provider runtime (server). Desktop cc-switch is deprecated and must not be linked from the site. */
export const CLIENT_REPO = "https://github.com/xiechengqi/cc-switch-server";
export const ROUTER_REPO = "https://github.com/xiechengqi/cc-switch-router";
export const MARKET_REPO = "https://github.com/xiechengqi/cc-switch-market";
export const SHARE_MARKET_REPO = "https://github.com/xiechengqi/cc-switch-share-market";
export const DOCS_URL = "https://docs.tokenswitch.org";

/** Region membership source of truth (router repo). */
export const REGIONS_RAW_URL =
  "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/refs/heads/master/regions";

export const SERVER_WEB_PORT = 15721;
