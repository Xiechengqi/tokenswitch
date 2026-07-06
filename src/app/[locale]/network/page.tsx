import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { NetworkPage } from "@/components/pages/NetworkPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return buildPageMetadata(locale, {
    title: `${t.network.title} — ${t.brand}`,
    description: t.network.subtitle,
    path: "network",
  });
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <NetworkPage locale={locale} />;
}
