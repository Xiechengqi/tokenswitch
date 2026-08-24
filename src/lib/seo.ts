import type { Metadata } from "next";
import type { Locale } from "./types";
import { LOCALES } from "./types";
import { getDict } from "./i18n";
import {
  CLIENT_REPO,
  DOCS_URL,
  GITHUB_REPO,
  ROUTER_REPO,
  TELEGRAM_URL,
  X_URL,
} from "./constants";

export const SITE_URL = "https://tokenswitch.org";
export const LOGO_IMAGE = `${SITE_URL}/tokenswitch-logo.png`;
export const LOGO_IMAGE_SIZE = 204;
export const OG_IMAGE = `${SITE_URL}/og.png`;
/* The real pixels of `public/og.png`. Declaring 1200x630 when the file is 3:2
 * makes every consumer that trusts the declaration crop or refetch. */
export const OG_IMAGE_WIDTH = 1536;
export const OG_IMAGE_HEIGHT = 1024;

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  ja: "ja_JP",
};

/** BCP-47 tags for `<html lang>` and schema.org `inLanguage`. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  zh: "zh-Hans",
  ja: "ja",
};

/* The English home is the bare domain. Every external link, every share and
 * every README points at `tokenswitch.org`, so that URL — not `/en/` — has to
 * be the canonical one, or the inbound signal lands on a URL that claims to be
 * a copy of something else. `/en/` still builds (it was the indexed URL and may
 * have links of its own) but canonicals here. Every other English page keeps
 * its `/en/` prefix, so only the home is doubled. */
function pageUrl(locale: Locale, path: string): string {
  if (locale === "en" && !path) return `${SITE_URL}/`;
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

/** Declared once per root layout; page metadata merges on top of it. */
export const SITE_ICONS: Metadata["icons"] = {
  icon: [{ url: "/tokenswitch-logo.png", type: "image/png", sizes: "204x204" }],
  apple: [{ url: "/tokenswitch-logo.png", type: "image/png", sizes: "204x204" }],
};

export function buildPageMetadata(
  locale: Locale,
  {
    title,
    description,
    path = "",
    noIndex = false,
  }: {
    title: string;
    description: string;
    path?: string;
    /** Redirect stubs: keep the URL resolvable, keep it out of the index. */
    noIndex?: boolean;
  },
): Metadata {
  const url = pageUrl(locale, path);
  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: getDict(locale).brand,
      locale: OG_LOCALE[locale],
      type: "website",
      images: [
        { url: OG_IMAGE, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: "TokenSwitch" },
      ],
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

/* One `@graph` rather than three loose scripts: the Organization node is what a
 * brand query resolves against, and the other two only mean anything when they
 * can point at it by `@id`. `sameAs` is the disambiguation — there is another
 * TokenSwitch on a .co, and these are the profiles that say which one this is. */
export function siteJsonLd(locale: Locale) {
  const t = getDict(locale);
  const home = pageUrl(locale, "");
  const download = pageUrl(locale, "download");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: t.brand,
        url: `${SITE_URL}/`,
        description: t.tagline,
        logo: {
          "@type": "ImageObject",
          url: LOGO_IMAGE,
          width: LOGO_IMAGE_SIZE,
          height: LOGO_IMAGE_SIZE,
        },
        sameAs: [GITHUB_REPO, CLIENT_REPO, ROUTER_REPO, DOCS_URL, X_URL, TELEGRAM_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: t.brand,
        description: t.tagline,
        inLanguage: HTML_LANG[locale],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#client`,
        name: "cc-switch-server",
        alternateName: `${t.brand} client`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Linux (amd64, arm64)",
        url: download,
        description: t.download.subtitle,
        codeRepository: CLIENT_REPO,
        softwareHelp: DOCS_URL,
        image: OG_IMAGE,
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          url: download,
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${home}#webpage`,
        url: home,
        name: `${t.brand} — ${t.tagline}`,
        description: t.hero.subtitle,
        inLanguage: HTML_LANG[locale],
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}
