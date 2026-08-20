import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { SiteChrome } from "@/components/SiteChrome";
import { StoredLocaleRedirect } from "@/components/StoredLocaleRedirect";
import { HomeSections } from "@/components/pages/HomeSections";

const t = getDict("en");

/* `tokenswitch.org/` is the canonical English home — the same body as `/en/`,
 * rendered statically rather than behind a client redirect. */
export const metadata: Metadata = buildPageMetadata("en", {
  title: `${t.brand} — ${t.tagline}`,
  description: t.hero.subtitle,
  path: "",
});

export default function Page() {
  return (
    <SiteChrome locale="en">
      <StoredLocaleRedirect />
      <HomeSections locale="en" />
    </SiteChrome>
  );
}
