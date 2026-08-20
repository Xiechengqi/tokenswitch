import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { HomeSections } from "@/components/pages/HomeSections";

/* `/en/` is the same page as `/` and canonicals there — it was the indexed URL
 * before the bare domain became a real page, so it keeps working rather than
 * 404ing whatever already links to it. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return buildPageMetadata(locale, {
    title: `${t.brand} — ${t.tagline}`,
    description: t.hero.subtitle,
    path: "",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <HomeSections locale={locale} />;
}
