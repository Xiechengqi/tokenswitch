"use client";

import { ArrowRight } from "lucide-react";
import type { Locale, Region } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { clientMarketUrl, regionLabel, shareMarketUrl } from "@/lib/regions";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useRegions } from "@/hooks/useRegions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/* Both markets are modules inside cc-switch-router, served from the router's
 * own host — so every region is reachable and there is no "coming soon" gate
 * to keep. The per-region counts come from the same public endpoints the
 * network page uses; a region that does not answer simply shows no count. */
export function MarketsPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const regions = useRegions();
  const stats = useNetworkStats();

  const showStats = stats.sharesOnline != null || stats.shareListings != null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.marketsPage.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.marketsPage.subtitle}</p>

        {showStats && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {stats.sharesOnline != null && (
              <Card>
                <p className="text-sm text-muted-foreground">{t.marketsPage.stats.onlineShares}</p>
                <p className="mt-2 font-heading text-3xl font-bold tabular-nums">
                  {stats.sharesOnline}
                </p>
              </Card>
            )}
            {stats.shareListings != null && (
              <Card>
                <p className="text-sm text-muted-foreground">{t.marketsPage.stats.listings}</p>
                <p className="mt-2 font-heading text-3xl font-bold tabular-nums">
                  {stats.shareListings}
                </p>
              </Card>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <MarketCard
            tone="border-accent/40 bg-accent/5"
            title={t.marketsPage.shareTitle}
            desc={t.marketsPage.shareDesc}
            pickRegion={t.marketsPage.pickRegion}
            regions={regions}
            locale={locale}
            href={shareMarketUrl}
            count={(region) =>
              stats.byRegion.find((r) => r.region === region)?.shareListings ?? null
            }
          />

          <MarketCard
            tone="border-secondary/40 bg-secondary/5"
            title={t.marketsPage.clientTitle}
            desc={t.marketsPage.clientDesc}
            pickRegion={t.marketsPage.pickRegion}
            regions={regions}
            locale={locale}
            href={clientMarketUrl}
            count={() => null}
          />
        </div>
      </div>
    </section>
  );
}

function MarketCard({
  tone,
  title,
  desc,
  pickRegion,
  regions,
  locale,
  href,
  count,
}: {
  tone: string;
  title: string;
  desc: string;
  pickRegion: string;
  regions: Region[];
  locale: Locale;
  href: (region: Region) => string;
  count: (region: string) => number | null;
}) {
  return (
    <Card className={tone}>
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
      <p className="mt-6 text-sm font-semibold">{pickRegion}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {regions.map((region) => {
          const n = count(region.name);
          return (
            <Button key={region.name} href={href(region)} external variant="secondary">
              {regionLabel(region.name, locale)}
              {n != null ? ` (${n})` : ""}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
