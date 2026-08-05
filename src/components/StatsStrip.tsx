"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { useMapPoints } from "@/hooks/useMapPoints";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { cn } from "@/lib/cn";

/* Rotational confetti — each figure gets its own rule colour so the band reads
 * as four things, not one table. */
const RULES = ["bg-accent", "bg-secondary", "bg-tertiary", "bg-quaternary"] as const;

export function StatsStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const networkStats = useNetworkStats();
  const [counts, setCounts] = useState({
    clients: 0,
    servers: 0,
    regions: 0,
    isSnapshot: true,
  });

  const handleUpdate = useCallback(
    (data: {
      clientCount: number;
      servers: unknown[];
      regions: unknown[];
      isSnapshot?: boolean;
    }) => {
      setCounts({
        clients: data.clientCount || 0,
        servers: data.servers.length,
        regions: data.regions.length,
        isSnapshot: data.isSnapshot ?? true,
      });
    },
    [],
  );

  useMapPoints(handleUpdate);

  const isSnapshot = counts.isSnapshot || networkStats.isSnapshot !== false;
  const shares = networkStats.sharesOnline != null ? networkStats.sharesOnline : null;

  const stats = [
    { label: t.stats.regions, value: counts.regions },
    { label: t.stats.servers, value: counts.servers },
    { label: t.stats.connections, value: counts.clients },
    ...(shares != null ? [{ label: t.stats.shares, value: shares }] : []),
  ];

  return (
    <section className="bg-card" aria-label={t.stats.live}>
      <div className="mx-auto max-w-[var(--container)] px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isSnapshot ? "bg-muted-foreground/50" : "ts-heartbeat bg-quaternary",
              )}
              aria-hidden
            />
            {isSnapshot ? t.stats.snapshot : t.stats.live}
          </span>
          <Link
            href={localePath(locale, "network")}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-[border-color,background-color] duration-[var(--dur-fast)] ease-out hover:border-accent hover:bg-accent/5"
          >
            {t.stats.explore}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div
          className={cn(
            "mt-5 grid grid-cols-2 gap-4",
            stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3",
          )}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="min-w-0">
              <div className="font-heading text-3xl font-bold tabular-nums">{stat.value}</div>
              <div className={cn("mt-2 h-0.5 w-8 rounded-full", RULES[i % RULES.length])} aria-hidden />
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
