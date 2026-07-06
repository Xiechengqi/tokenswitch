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

export const DOCKER_COMMAND =
  "docker run -itd -p 8008:8008 -v $HOME/.token-switch:/root/.cc-switch --name cc-switch ghcr.io/xiechengqi/cc-switch:latest";

export const GITHUB_REPO = "https://github.com/Xiechengqi/tokenswitch";
export const CLIENT_REPO = "https://github.com/xiechengqi/cc-switch";
export const ROUTER_REPO = "https://github.com/xiechengqi/cc-switch-router";
export const MARKET_REPO = "https://github.com/xiechengqi/cc-switch-market";
export const SHARE_MARKET_REPO = "https://github.com/xiechengqi/cc-switch-share-market";
export const DOCS_URL = "https://docs.tokenswitch.org";
export const UPSTREAM_CC_SWITCH = "https://ccswitch.io";
