"use client";

import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { getBakedRegions, regionLabel, shareMarketUrl, tokenMarketUrl } from "@/lib/regions";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function MarketsPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const { regions } = getBakedRegions();
  const stats = useNetworkStats();

  const showStats =
    stats.tokenMarketShares != null ||
    stats.shareListings != null ||
    stats.publicModels.length > 0;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.marketsPage.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.marketsPage.subtitle}</p>

        {showStats && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.tokenMarketShares != null && (
              <Card>
                <p className="text-sm text-muted-foreground">{t.marketsPage.stats.onlineShares}</p>
                <p className="mt-2 font-heading text-3xl font-bold tabular-nums">
                  {stats.tokenMarketShares}
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
            {stats.publicModels.length > 0 && (
              <Card className="sm:col-span-1">
                <p className="text-sm text-muted-foreground">{t.marketsPage.stats.models}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stats.publicModels.slice(0, 8).map((model) => (
                    <span
                      key={model}
                      className="rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px]"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-accent/40 bg-accent/5">
            <h2 className="font-heading text-2xl font-bold">{t.marketsPage.tokenTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t.marketsPage.tokenDesc}</p>
            <p className="mt-6 text-sm font-semibold">{t.marketsPage.pickRegion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {regions.map((region) => {
                const regionStats = stats.byRegion.find((r) => r.region === region.name);
                return (
                  <Button
                    key={region.name}
                    href={tokenMarketUrl(region)}
                    external
                    variant="secondary"
                  >
                    {regionLabel(region.name, locale)}
                    {regionStats?.tokenMarketShares != null
                      ? ` (${regionStats.tokenMarketShares})`
                      : ""}{" "}
                    →
                  </Button>
                );
              })}
            </div>
          </Card>

          <Card className="border-secondary/40 bg-secondary/5">
            <h2 className="font-heading text-2xl font-bold">{t.marketsPage.shareTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t.marketsPage.shareDesc}</p>
            <p className="mt-6 text-sm font-semibold">{t.marketsPage.pickRegion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {regions.map((region) => {
                const regionStats = stats.byRegion.find((r) => r.region === region.name);
                return (
                  <Button
                    key={region.name}
                    href={shareMarketUrl(region)}
                    external
                    variant="secondary"
                  >
                    {regionLabel(region.name, locale)}
                    {regionStats?.shareListings != null
                      ? ` (${regionStats.shareListings})`
                      : ""}{" "}
                    →
                  </Button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
