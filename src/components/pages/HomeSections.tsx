import type { Locale } from "@/lib/types";
import { siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { HowItWorks } from "@/components/HowItWorks";
import { EcosystemCards } from "@/components/EcosystemCards";
import { EarnStrip } from "@/components/EarnStrip";
import { TrustStrip } from "@/components/TrustStrip";
import { MapSection } from "@/components/MapSection";

/* The home body, shared by `/` (English) and `/[locale]/`. Those are two routes
 * under two different root layouts; keeping the sections in one place is what
 * stops them from becoming two subtly different home pages. */
export function HomeSections({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd data={siteJsonLd(locale)} />
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
