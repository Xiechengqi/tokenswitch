"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Locale, Region } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import {
  regionLabel,
  routerDashboardUrl,
  shareMarketUrl,
  tokenMarketUrl,
} from "@/lib/regions";
import { probeRegionHealth } from "@/lib/map-points";
import { cn } from "@/lib/cn";

export function RegionCard({
  id,
  locale,
  region,
  lat,
  lon,
  clientsOnline,
  selected,
  onSelect,
}: {
  id?: string;
  locale: Locale;
  region: Region;
  lat?: number;
  lon?: number;
  clientsOnline?: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const t = getDict(locale);
  const [health, setHealth] = useState<{ healthy: boolean; latencyMs: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void probeRegionHealth(region.url).then((result) => {
      if (!cancelled) setHealth(result);
    });
    return () => {
      cancelled = true;
    };
  }, [region.url]);

  const coords =
    lat != null && lon != null
      ? `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`
      : null;

  const links = [
    { label: t.network.dashboard, href: routerDashboardUrl(region) },
    { label: t.network.tokenMarket, href: tokenMarketUrl(region) },
    { label: t.network.shareMarket, href: shareMarketUrl(region) },
  ];

  return (
    <div
      id={id}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-2xl bg-card p-6 shadow-sm transition-shadow",
        selected && "ring-2 ring-accent shadow-md",
        onSelect && "cursor-pointer hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                health == null
                  ? "bg-muted-foreground/40"
                  : health.healthy
                    ? "bg-quaternary"
                    : "bg-secondary",
              )}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {health == null ? "…" : health.healthy ? t.network.healthy : t.network.down}
              {health?.latencyMs != null ? ` · ${health.latencyMs}ms` : ""}
            </span>
          </div>
          <h3 className="mt-3 font-heading text-2xl font-bold">{regionLabel(region.name, locale)}</h3>
          {coords && <p className="mt-1 font-mono text-xs text-muted-foreground">{coords}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{region.domain}</p>
          {clientsOnline != null && (
            <p className="mt-3 text-sm">
              {t.network.clients}: <b>{clientsOnline}</b>
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            {link.label}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
