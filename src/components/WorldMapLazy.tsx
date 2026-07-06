"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/types";

const WorldMap = dynamic(() => import("./WorldMap").then((m) => ({ default: m.WorldMap })), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[200px] items-center justify-center bg-muted text-sm text-muted-foreground"
      aria-busy="true"
      aria-label="Loading map"
    >
      …
    </div>
  ),
});

export function WorldMapLazy({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  return <WorldMap locale={locale} className={className} />;
}
