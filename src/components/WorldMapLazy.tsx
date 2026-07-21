"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/types";
import type { MapMode } from "./WorldMap";

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
  mode = "explore",
  selectedRegion = null,
  onSelectRegion,
  showLegend = false,
}: {
  locale: Locale;
  className?: string;
  mode?: MapMode;
  selectedRegion?: string | null;
  onSelectRegion?: (region: string) => void;
  showLegend?: boolean;
}) {
  return (
    <WorldMap
      locale={locale}
      className={className}
      mode={mode}
      selectedRegion={selectedRegion}
      onSelectRegion={onSelectRegion}
      showLegend={showLegend}
    />
  );
}
