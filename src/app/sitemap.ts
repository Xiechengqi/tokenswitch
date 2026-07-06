import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALES } from "@/lib/types";

export const dynamic = "force-static";

const PAGES = ["", "network", "download", "earn", "markets", "faq"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const path = page ? `/${locale}/${page}/` : `/${locale}/`;
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
