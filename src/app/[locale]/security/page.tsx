import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { SecurityPage } from "@/components/pages/SecurityPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return buildPageMetadata(locale, {
    title: `${t.securityPage.title} — ${t.brand}`,
    description: t.securityPage.subtitle,
    path: "security",
  });
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <SecurityPage locale={locale} />;
}
