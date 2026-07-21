"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import worldData from "world-atlas/land-110m.json";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import { createProjection } from "@/lib/projection";
import { updateAnimationStates } from "@/lib/animation";
import {
  renderBaseMap,
  renderServer,
  renderClient,
  renderArc,
  renderFlowDot,
} from "@/lib/renderer";
import { useMapPoints } from "@/hooks/useMapPoints";
import type { ClientAnimState } from "@/lib/animation";
import type { AggregatedMapData, Locale, ServerPoint } from "@/lib/types";
import { getDict } from "@/lib/i18n";

export type MapMode = "showcase" | "explore";

const MAX_ARCS_PER_REGION = 8;
const HIT = 12;

interface MapRenderData {
  regions: AggregatedMapData["regions"];
  servers: ServerPoint[];
  clients: ClientAnimState[];
}

interface ClientHit {
  x: number;
  y: number;
  count: number;
  region: string;
}

export function WorldMap({
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
  const t = getDict(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const projRef = useRef<
    (ReturnType<typeof createProjection> & { width: number; height: number; dpr: number }) | null
  >(null);
  const dataRef = useRef<MapRenderData>({ regions: [], servers: [], clients: [] });
  const clientHitRef = useRef<ClientHit[]>([]);
  const serverHitRef = useRef<{ x: number; y: number; region: string }[]>([]);
  const modeRef = useRef(mode);
  const selectedRef = useRef(selectedRegion);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [hoveredClient, setHoveredClient] = useState<{
    count: number;
    x: number;
    y: number;
  } | null>(null);

  modeRef.current = mode;
  selectedRef.current = selectedRegion;

  const handleUpdate = useCallback((data: MapRenderData) => {
    dataRef.current = data;
  }, []);

  useMapPoints(handleUpdate);

  const setupMap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const offscreen = document.createElement("canvas");
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const offCtx = offscreen.getContext("2d");
    if (offCtx) offCtx.scale(dpr, dpr);
    offscreenRef.current = offscreen;

    const topology = worldData as unknown as Topology;
    const land = topojson.feature(topology, topology.objects.land);
    const { projection, path } = createProjection(w, h, land);
    projRef.current = { projection, path, width: w, height: h, dpr };

    renderBaseMap(offscreen, path, topology);
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    const proj = projRef.current;
    if (!canvas || !offscreen || !proj) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const dt = timestamp - (lastTimeRef.current || timestamp);
    lastTimeRef.current = timestamp;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { projection, dpr } = proj;
    const { servers, clients } = dataRef.current;
    const currentMode = modeRef.current;
    const selected = selectedRef.current;
    const hasSelection = currentMode === "explore" && !!selected;

    updateAnimationStates(clients, timestamp, dt);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(offscreen, 0, 0, offscreen.width / dpr, offscreen.height / dpr);

    const regionToServer = new Map<string, { x: number; y: number; url: string; region: string }>();
    const serverPositions: { x: number; y: number; url: string; region: string }[] = [];

    for (const s of servers) {
      const p = projection([s.lon, s.lat]);
      if (!p) continue;
      const sp = { x: p[0], y: p[1], url: s.url, region: s.region };
      serverPositions.push(sp);
      regionToServer.set(s.region, sp);
    }

    const OVERLAP_THRESHOLD = 15;
    const OFFSET_RADIUS = 18;
    const overlapCounts = new Map<string, number>();
    const clientProjections: {
      client: (typeof clients)[number];
      x: number;
      y: number;
      overlaps: boolean;
    }[] = [];

    if (currentMode === "explore") {
      for (const client of clients) {
        const cp = projection([client.lon, client.lat]);
        if (!cp) continue;
        const sp = regionToServer.get(client.region);
        let overlaps = false;
        if (sp && Math.hypot(cp[0] - sp.x, cp[1] - sp.y) < OVERLAP_THRESHOLD) {
          overlaps = true;
          overlapCounts.set(client.region, (overlapCounts.get(client.region) || 0) + 1);
        }
        clientProjections.push({ client, x: cp[0], y: cp[1], overlaps });
      }

      const overlapIndices = new Map<string, number>();
      for (const cp of clientProjections) {
        if (!cp.overlaps) continue;
        const sp = regionToServer.get(cp.client.region);
        const total = overlapCounts.get(cp.client.region) ?? 1;
        const idx = overlapIndices.get(cp.client.region) || 0;
        overlapIndices.set(cp.client.region, idx + 1);
        const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
        if (sp) {
          cp.x = sp.x + Math.cos(angle) * OFFSET_RADIUS;
          cp.y = sp.y + Math.sin(angle) * OFFSET_RADIUS;
        }
      }
    }

    // Arcs + flow only for selected region in explore (cap at N)
    if (hasSelection && selected) {
      const selectedClients = clientProjections
        .filter((cp) => cp.client.region === selected)
        .sort((a, b) => (b.client.count || 1) - (a.client.count || 1))
        .slice(0, MAX_ARCS_PER_REGION);

      for (const cp of selectedClients) {
        const sp = regionToServer.get(cp.client.region);
        if (!sp) continue;
        renderArc(ctx, cp.x, cp.y, sp.x, sp.y, cp.client, { emphasis: true });
        renderFlowDot(ctx, cp.x, cp.y, sp.x, sp.y, cp.client, { alphaScale: 0.7 });
      }
    }

    const breath = currentMode === "showcase" ? (Math.sin(timestamp / 900) + 1) / 2 : 0;

    for (const sp of serverPositions) {
      const isSelected = hasSelection && sp.region === selected;
      const dimmed = hasSelection && sp.region !== selected;
      renderServer(ctx, sp.x, sp.y, {
        selected: isSelected,
        dimmed,
        breath: currentMode === "showcase" ? breath : 0,
      });
    }

    for (const cp of clientProjections) {
      const dimmed = hasSelection && cp.client.region !== selected;
      renderClient(ctx, cp.x, cp.y, cp.client, { dimmed });
    }

    serverHitRef.current = serverPositions.map((sp) => ({
      x: sp.x,
      y: sp.y,
      region: sp.region,
    }));
    clientHitRef.current = clientProjections.map((cp) => ({
      x: cp.x,
      y: cp.y,
      count: cp.client.count || 1,
      region: cp.client.region,
    }));

    ctx.restore();
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    setupMap();
    rafRef.current = requestAnimationFrame(animate);
    const container = containerRef.current;
    const ro = new ResizeObserver(() => {
      setHoveredClient(null);
      setupMap();
    });
    if (container) ro.observe(container);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [setupMap, animate]);

  const mapCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      mapX: e.clientX - rect.left,
      mapY: e.clientY - rect.top,
    };
  };

  const hitRegion = (mapX: number, mapY: number): string | null => {
    for (const s of serverHitRef.current) {
      if (Math.hypot(s.x - mapX, s.y - mapY) <= HIT) return s.region;
    }
    for (const c of clientHitRef.current) {
      if (Math.hypot(c.x - mapX, c.y - mapY) <= HIT) return c.region;
    }
    return null;
  };

  return (
    <div ref={containerRef} className={className ?? "relative h-[420px] w-full sm:h-[520px]"}>
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerMove={(e) => {
          const { mapX, mapY } = mapCoords(e);
          let hoveredCount: number | null = null;
          let overHot = false;

          for (const s of serverHitRef.current) {
            if (Math.hypot(s.x - mapX, s.y - mapY) <= HIT) overHot = true;
          }
          for (const client of clientHitRef.current) {
            if (Math.hypot(client.x - mapX, client.y - mapY) <= HIT) {
              hoveredCount = client.count;
              overHot = true;
            }
          }

          setHoveredClient(
            hoveredCount == null
              ? null
              : { count: hoveredCount, x: e.clientX + 14, y: e.clientY + 14 },
          );
          if (canvasRef.current) {
            canvasRef.current.style.cursor = overHot ? "pointer" : "default";
          }
        }}
        onPointerLeave={() => {
          setHoveredClient(null);
          if (canvasRef.current) canvasRef.current.style.cursor = "default";
        }}
        onClick={(e) => {
          const { mapX, mapY } = mapCoords(e);
          const region = hitRegion(mapX, mapY);
          if (region) onSelectRegion?.(region);
        }}
      />
      {showLegend && (
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-border-strong/40 bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" aria-hidden />
            {t.map.legendServer}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" aria-hidden />
            {t.map.legendClient}
          </span>
        </div>
      )}
      {hoveredClient && mode === "explore" && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border-2 border-border-strong bg-card px-2 py-1 text-xs font-medium shadow-sm"
          style={{ left: hoveredClient.x, top: hoveredClient.y }}
        >
          {t.map.clients(hoveredClient.count)}
        </div>
      )}
    </div>
  );
}
