"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { useMapPoints } from "@/hooks/useMapPoints";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { cn } from "@/lib/cn";

export function StatsStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const networkStats = useNetworkStats();
  const [counts, setCounts] = useState({
    clients: 0,
    servers: 0,
    regions: 0,
    isSnapshot: true,
  });
  const [pulse, setPulse] = useState(true);

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

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 1500);
    return () => clearInterval(id);
  }, []);

  const isSnapshot = counts.isSnapshot || networkStats.isSnapshot !== false;
  const shares =
    networkStats.sharesOnline != null ? networkStats.sharesOnline : null;

  return (
    <Link
      href={localePath(locale, "network")}
      className="relative block border-b-2 border-border bg-card transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "absolute right-4 top-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
          isSnapshot ? "text-muted-foreground" : "text-quaternary",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-quaternary",
            pulse && !isSnapshot ? "opacity-100" : "opacity-40",
          )}
        />
        {isSnapshot ? t.stats.snapshot : t.stats.live}
      </span>

      <div className="mx-auto grid max-w-[var(--container)] grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6">
        <Stat label={t.stats.regions} value={counts.regions} />
        <Stat label={t.stats.servers} value={counts.servers} />
        <Stat label={t.stats.connections} value={counts.clients} />
        {shares != null ? (
          <Stat label={t.stats.shares} value={shares} />
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-heading text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
