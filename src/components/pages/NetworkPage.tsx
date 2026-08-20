"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { useMapPoints } from "@/hooks/useMapPoints";
import { useNetworkUsage } from "@/hooks/useNetworkUsage";
import { useRegions } from "@/hooks/useRegions";
import { RegionCard } from "@/components/RegionCard";
import { UsagePanel } from "@/components/UsagePanel";
import { DOCS_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Explainer } from "@/components/Explainer";
import { WorldMapLazy } from "@/components/WorldMapLazy";

export function NetworkPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const regions = useRegions();
  const usage = useNetworkUsage();
  const didInitialUrlScroll = useRef(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [data, setData] = useState({
    servers: [] as { region: string; lat: number; lon: number }[],
    clientCountByRegion: new Map<string, number>(),
  });

  /* `?region=` is read from `location` and written with `history.replaceState`
   * rather than through `useSearchParams` / `router.replace`.
   *
   * `useSearchParams` opts the whole subtree out of prerendering, and under
   * `output: "export"` that meant this page shipped as a Suspense fallback: the
   * static HTML of /en/network/ contained one ellipsis and nothing else. Every
   * region, the live token totals and the model breakdown were invisible to
   * anything that does not run JavaScript. A deep-link convenience is not worth
   * the entire page. */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("region");
    if (!fromUrl || !regions.length) return;
    if (!regions.some((r) => r.name === fromUrl)) return;
    setSelectedRegion(fromUrl);
    if (!didInitialUrlScroll.current) {
      didInitialUrlScroll.current = true;
      requestAnimationFrame(() => {
        document.getElementById(`region-${fromUrl}`)?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
  }, [regions]);

  const selectRegion = useCallback(
    (region: string, opts?: { scrollToCard?: boolean; syncUrl?: boolean }) => {
      setSelectedRegion(region);
      if (opts?.syncUrl !== false) {
        const params = new URLSearchParams(window.location.search);
        params.set("region", region);
        window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
      }
      if (opts?.scrollToCard) {
        requestAnimationFrame(() => {
          document.getElementById(`region-${region}`)?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        });
      }
    },
    [],
  );

  const handleUpdate = useCallback(
    (payload: {
      servers: { region: string; lat: number; lon: number }[];
      clients: { region: string; count: number }[];
    }) => {
      const clientCountByRegion = new Map<string, number>();
      for (const c of payload.clients) {
        clientCountByRegion.set(
          c.region,
          (clientCountByRegion.get(c.region) || 0) + (c.count || 1),
        );
      }
      setData({ servers: payload.servers, clientCountByRegion });
    },
    [],
  );

  useMapPoints(handleUpdate);

  const serverByRegion = Object.fromEntries(data.servers.map((s) => [s.region, s]));
  const usageByRegion = new Map(
    usage.byRegion.filter((row) => row.reporting).map((row) => [row.region, row.totalTokens]),
  );

  return (
    <>
      <section className="bg-background py-8">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl bg-card">
            <WorldMapLazy
              locale={locale}
              mode="explore"
              showLegend
              selectedRegion={selectedRegion}
              onSelectRegion={(region) => selectRegion(region, { scrollToCard: true })}
              className="relative h-[320px] w-full sm:h-[420px]"
            />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold">{t.network.h1}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.network.subtitle}</p>

          <div className="mt-10">
            <UsagePanel locale={locale} usage={usage} />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {regions.map((region) => {
              const server = serverByRegion[region.name];
              return (
                <RegionCard
                  key={region.name}
                  id={`region-${region.name}`}
                  locale={locale}
                  region={region}
                  lat={server?.lat}
                  lon={server?.lon}
                  clientsOnline={data.clientCountByRegion.get(region.name)}
                  tokens24h={usageByRegion.get(region.name) ?? null}
                  selected={selectedRegion === region.name}
                  onSelect={() => selectRegion(region.name, { scrollToCard: false })}
                />
              );
            })}
          </div>

          <Explainer title={t.network.explainer.title} items={t.network.explainer.items} />

          <div className="mt-16 rounded-3xl bg-muted/30 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold">{t.network.selfHost}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.network.selfHostDesc}</p>
            <div className="mt-6">
              <Button href={`${DOCS_URL}/self-host/router-deploy`} external variant="secondary">
                {t.network.selfHostCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
