import type { Metadata } from "next";
import type { Locale } from "./types";
import { LOCALES } from "./types";
import { getDict } from "./i18n";

export const SITE_URL = "https://tokenswitch.org";
export const OG_IMAGE = `${SITE_URL}/og.png`;

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  ja: "ja_JP",
};

function pageUrl(locale: Locale, path: string): string {
  const segment = path ? `${path}/` : "";
  return `${SITE_URL}/${locale}/${segment}`;
}

export function buildAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = {
    "x-default": pageUrl("en", path),
  };
  for (const l of LOCALES) {
    languages[l] = pageUrl(l, path);
  }
  return {
    canonical: pageUrl(locale, path),
    languages,
  };
}

export function buildPageMetadata(
  locale: Locale,
  {
    title,
    description,
    path = "",
  }: {
    title: string;
    description: string;
    path?: string;
  },
): Metadata {
  const url = pageUrl(locale, path);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: getDict(locale).brand,
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "TokenSwitch" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
    alternates: buildAlternates(locale, path),
  };
}
