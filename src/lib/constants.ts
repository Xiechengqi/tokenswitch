import type { Locale } from "./types";

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
/* Neither market has a repo of its own — both live in cc-switch-router
 * (`src/client_market.rs`, `src/share_market.rs`). The former
 * cc-switch-market and cc-switch-share-market repos are retired; do not link
 * them from the site. */
export const DOCS_URL = "https://docs.tokenswitch.org";

/** Region membership source of truth (router repo). */
export const REGIONS_RAW_URL =
  "https://raw.githubusercontent.com/Xiechengqi/cc-switch-router/refs/heads/master/regions";

export const SERVER_WEB_PORT = 15721;
