"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { getBakedRegions } from "@/lib/regions";
import { useMapPoints } from "@/hooks/useMapPoints";
import { RegionCard } from "@/components/RegionCard";
import { DOCS_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { WorldMapLazy } from "@/components/WorldMapLazy";

export function NetworkPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const { regions } = getBakedRegions();
  const [data, setData] = useState({ servers: [] as { region: string; lat: number; lon: number }[], clientCountByRegion: new Map<string, number>() });

  const handleUpdate = useCallback(
    (payload: {
      servers: { region: string; lat: number; lon: number }[];
      clients: { region: string; count: number }[];
    }) => {
      const clientCountByRegion = new Map<string, number>();
      for (const c of payload.clients) {
        clientCountByRegion.set(c.region, (clientCountByRegion.get(c.region) || 0) + (c.count || 1));
      }
      setData({ servers: payload.servers, clientCountByRegion });
    },
    [],
  );

  useMapPoints(handleUpdate);

  const serverByRegion = Object.fromEntries(data.servers.map((s) => [s.region, s]));

  return (
    <>
      <section className="border-b-2 border-border bg-terminal py-8 text-white">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
          <WorldMapLazy locale={locale} className="relative h-[320px] w-full sm:h-[420px]" />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
          <h1 className="font-heading text-4xl font-bold">{t.network.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.network.subtitle}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {regions.map((region) => {
              const server = serverByRegion[region.name];
              return (
                <RegionCard
                  key={region.name}
                  locale={locale}
                  region={region}
                  lat={server?.lat}
                  lon={server?.lon}
                  clientsOnline={data.clientCountByRegion.get(region.name)}
                />
              );
            })}
          </div>

          <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold">{t.network.selfHost}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.network.selfHostDesc}</p>
            <div className="mt-6">
              <Button href={`${DOCS_URL}/#/self-host/router-deploy`} external variant="secondary">
                {t.network.selfHostCta} →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
