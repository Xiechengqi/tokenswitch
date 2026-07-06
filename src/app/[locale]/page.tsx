import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { HowItWorks } from "@/components/HowItWorks";
import { EcosystemCards } from "@/components/EcosystemCards";
import { EarnStrip } from "@/components/EarnStrip";
import { TrustStrip } from "@/components/TrustStrip";
import { MapSection } from "@/components/MapSection";

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
  const t = getDict(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: t.brand,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "macOS, Windows, Linux",
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/${locale}/download/`,
            price: "0",
            priceCurrency: "USD",
          },
        }}
      />
      <Hero locale={locale} />
      <StatsStrip locale={locale} />
      <HowItWorks locale={locale} />
      <EcosystemCards locale={locale} />
      <EarnStrip locale={locale} />
      <TrustStrip locale={locale} />
      <MapSection locale={locale} />
    </>
  );
}
