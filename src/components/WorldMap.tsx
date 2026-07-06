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
  renderRipple,
  renderArc,
  renderFlowDot,
} from "@/lib/renderer";
import { useMapPoints } from "@/hooks/useMapPoints";
import type { ClientAnimState } from "@/lib/animation";
import type { AggregatedMapData, Locale, ServerPoint } from "@/lib/types";
import { getDict } from "@/lib/i18n";

interface MapRenderData {
  regions: AggregatedMapData["regions"];
  servers: ServerPoint[];
  clients: ClientAnimState[];
}

export function WorldMap({ locale, className }: { locale: Locale; className?: string }) {
  const t = getDict(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const projRef = useRef<ReturnType<typeof createProjection> & { width: number; height: number; dpr: number } | null>(null);
  const dataRef = useRef<MapRenderData>({ regions: [], servers: [], clients: [] });
  const clientHitRef = useRef<{ x: number; y: number; count: number }[]>([]);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [hoveredClient, setHoveredClient] = useState<{ count: number; x: number; y: number } | null>(null);
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

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
    const { zoom, panX, panY } = viewRef.current;

    updateAnimationStates(clients, timestamp, dt);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, panX * dpr, panY * dpr);
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

    for (const cp of clientProjections) {
      const sp = regionToServer.get(cp.client.region);
      if (!sp) continue;
      renderArc(ctx, cp.x, cp.y, sp.x, sp.y, cp.client);
      renderFlowDot(ctx, cp.x, cp.y, sp.x, sp.y, cp.client);
    }

    for (const cp of clientProjections) renderRipple(ctx, cp.x, cp.y, cp.client);
    for (const sp of serverPositions) renderServer(ctx, sp.x, sp.y);
    for (const cp of clientProjections) renderClient(ctx, cp.x, cp.y, cp.client);

    clientHitRef.current = clientProjections.map((cp) => ({
      x: cp.x,
      y: cp.y,
      count: cp.client.count || 1,
    }));

    ctx.restore();
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    setupMap();
    rafRef.current = requestAnimationFrame(animate);
    const container = containerRef.current;
    const ro = new ResizeObserver(() => {
      viewRef.current = { zoom: 1, panX: 0, panY: 0 };
      setHoveredClient(null);
      setupMap();
    });
    if (container) ro.observe(container);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [setupMap, animate]);

  const mapCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { zoom, panX, panY } = viewRef.current;
    return {
      mapX: (e.clientX - rect.left - panX) / zoom,
      mapY: (e.clientY - rect.top - panY) / zoom,
    };
  };

  return (
    <div ref={containerRef} className={className ?? "relative h-[420px] w-full sm:h-[520px]"}>
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-none"
        onPointerDown={(e) => {
          dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
          canvasRef.current?.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const drag = dragRef.current;
          if (drag.dragging) {
            const view = viewRef.current;
            view.panX += e.clientX - drag.lastX;
            view.panY += e.clientY - drag.lastY;
            drag.lastX = e.clientX;
            drag.lastY = e.clientY;
          }
          if (!projRef.current || drag.dragging) return;
          const { projection } = projRef.current;
          const { mapX, mapY } = mapCoords(e);
          const { servers } = dataRef.current;
          const HIT = 12;
          let overServer = false;
          let hoveredCount: number | null = null;
          for (const s of servers) {
            const p = projection([s.lon, s.lat]);
            if (p && Math.hypot(p[0] - mapX, p[1] - mapY) <= HIT) overServer = true;
          }
          for (const client of clientHitRef.current) {
            if (Math.hypot(client.x - mapX, client.y - mapY) <= HIT) hoveredCount = client.count;
          }
          setHoveredClient(
            hoveredCount == null ? null : { count: hoveredCount, x: e.clientX + 14, y: e.clientY + 14 },
          );
          if (canvasRef.current) {
            canvasRef.current.style.cursor = overServer ? "pointer" : hoveredCount != null ? "default" : "grab";
          }
        }}
        onPointerUp={(e) => {
          dragRef.current.dragging = false;
          canvasRef.current?.releasePointerCapture(e.pointerId);
        }}
        onPointerLeave={() => {
          setHoveredClient(null);
          if (canvasRef.current) canvasRef.current.style.cursor = "grab";
        }}
        onClick={(e) => {
          if (!projRef.current) return;
          const { projection } = projRef.current;
          const { mapX, mapY } = mapCoords(e);
          for (const s of dataRef.current.servers) {
            const p = projection([s.lon, s.lat]);
            if (p && Math.hypot(p[0] - mapX, p[1] - mapY) <= 12) {
              window.open(s.url, "_blank", "noopener,noreferrer");
              return;
            }
          }
        }}
      />
      {hoveredClient && (
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
