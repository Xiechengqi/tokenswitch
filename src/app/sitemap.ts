import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, type Locale } from "@/lib/types";
import pageDates from "@/data/baked/page-dates.json";

export const dynamic = "force-static";

const PAGES = ["", "network", "download", "earn", "markets", "faq"] as const;

/* Canonical URLs only.
 *
 * `/en/` is deliberately absent: it renders the same home as the bare domain
 * and canonicals there, so listing it would ask a crawler to index a page that
 * disclaims itself. `/[locale]/security/` and `/routers/` are absent for the
 * same reason — both are `noindex` redirect stubs.
 *
 * `lastmod` comes from git (see `bakePageDates` in scripts/bake-data.mjs) and is
 * omitted when there is no history to read, rather than falling back to "now":
 * the old `new Date()` restamped every URL on every nightly build. */
function pageUrl(locale: Locale, page: string): string {
  if (locale === "en" && !page) return `${SITE_URL}/`;
  return `${SITE_URL}/${locale}/${page ? `${page}/` : ""}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dates: Record<string, string> = pageDates;

  return LOCALES.flatMap((locale) =>
    PAGES.map((page) => {
      const lastModified = dates[page];
      return {
        url: pageUrl(locale, page),
        ...(lastModified ? { lastModified } : {}),
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries([
            ["x-default", pageUrl("en", page)],
            ...LOCALES.map((l) => [l, pageUrl(l, page)]),
          ]),
        },
      };
    }),
  );
}
