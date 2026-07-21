import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import type { GeoPath } from "d3-geo";
import type { ClientAnimState } from "./animation";

export function renderBaseMap(
  canvas: HTMLCanvasElement,
  path: GeoPath,
  topology: Topology,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const land = topojson.feature(topology, topology.objects.land);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  path.context(ctx)(land);
  ctx.fillStyle = "#e8e8ed";
  ctx.fill();

  ctx.beginPath();
  path.context(ctx)(land);
  ctx.strokeStyle = "#d2d2d7";
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

export function renderServer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts?: {
    selected?: boolean;
    dimmed?: boolean;
    /** 0..1 breathing pulse for showcase mode */
    breath?: number;
  },
) {
  const dimmed = opts?.dimmed ?? false;
  const selected = opts?.selected ?? false;
  const breath = opts?.breath ?? 0;
  const alpha = dimmed ? 0.28 : 1;
  const glowR = selected ? 14 : 8 + breath * 6;
  const coreR = selected ? 7 : 5;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fillStyle = selected ? "rgba(37, 99, 235, 0.32)" : `rgba(37, 99, 235, ${0.18 + breath * 0.2})`;
  ctx.fill();

  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, coreR + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(x, y, coreR, 0, Math.PI * 2);
  ctx.fillStyle = "#2563eb";
  ctx.fill();
  ctx.restore();
}

export function renderClient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  client: ClientAnimState,
  opts?: { dimmed?: boolean; alphaScale?: number },
) {
  const enterEase = easeOutCubic(client.enterProgress);
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  const dim = opts?.dimmed ? 0.28 : 1;
  const alpha = enterEase * exitAlpha * dim * (opts?.alphaScale ?? 1);
  const scale = enterEase;
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
  ctx.fillStyle = client.color;
  ctx.fill();
  ctx.restore();
}

export function renderArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  client: ClientAnimState,
  opts?: { emphasis?: boolean; alphaScale?: number },
) {
  const progress = client.arcProgress;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (progress <= 0 || exitAlpha <= 0) return;

  const emphasis = opts?.emphasis ?? false;
  const cp = getControlPoint(cx, cy, sx, sy);
  ctx.save();
  ctx.globalAlpha = exitAlpha * (opts?.alphaScale ?? 1);
  ctx.beginPath();
  ctx.moveTo(cx, cy);

  if (progress < 1) {
    const steps = Math.floor(progress * 50);
    for (let i = 1; i <= steps; i++) {
      const t = i / 50;
      ctx.lineTo(quadBezier(cx, cp[0], sx, t), quadBezier(cy, cp[1], sy, t));
    }
  } else {
    ctx.quadraticCurveTo(cp[0], cp[1], sx, sy);
  }

  ctx.strokeStyle = emphasis ? "rgba(34, 197, 94, 0.55)" : "rgba(34, 197, 94, 0.24)";
  ctx.lineWidth = emphasis ? 2 : 1;
  ctx.stroke();
  ctx.restore();
}

export function renderFlowDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  client: ClientAnimState,
  opts?: { alphaScale?: number },
) {
  if (client.arcProgress < 1) return;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  const scale = opts?.alphaScale ?? 1;
  if (exitAlpha <= 0 || scale <= 0) return;

  const cp = getControlPoint(cx, cy, sx, sy);
  const t = client.flowPhase;
  const x = quadBezier(cx, cp[0], sx, t);
  const y = quadBezier(cy, cp[1], sy, t);
  const tTrail = Math.max(0, t - 0.03);
  const tx = quadBezier(cx, cp[0], sx, tTrail);
  const ty = quadBezier(cy, cp[1], sy, tTrail);

  ctx.save();
  ctx.globalAlpha = 0.08 * exitAlpha * scale;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22 * exitAlpha * scale;
  ctx.beginPath();
  ctx.arc(x, y, 1.75, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.restore();
}

function getControlPoint(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return [midX, midY - dist * 0.3] as const;
}

function quadBezier(p0: number, p1: number, p2: number, t: number) {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}
