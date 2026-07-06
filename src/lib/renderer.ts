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

export function renderServer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(37, 99, 235, 0.18)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#2563eb";
  ctx.fill();
}

export function renderClient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  client: ClientAnimState,
) {
  const enterEase = easeOutCubic(client.enterProgress);
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  const alpha = enterEase * exitAlpha;
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

export function renderRipple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  client: ClientAnimState,
) {
  const enterEase = easeOutCubic(client.enterProgress);
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (enterEase < 1 || exitAlpha <= 0) return;

  const phase = client.ripplePhase;
  const rippleR = 5 + phase * 20;
  const rippleAlpha = (1 - phase) * 0.35 * exitAlpha;
  if (rippleAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = rippleAlpha;
  ctx.beginPath();
  ctx.arc(x, y, rippleR, 0, Math.PI * 2);
  ctx.strokeStyle = client.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function renderArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  client: ClientAnimState,
) {
  const progress = client.arcProgress;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (progress <= 0 || exitAlpha <= 0) return;

  const cp = getControlPoint(cx, cy, sx, sy);
  ctx.save();
  ctx.globalAlpha = exitAlpha;
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

  ctx.strokeStyle = "rgba(34, 197, 94, 0.24)";
  ctx.lineWidth = 1;
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
) {
  if (client.arcProgress < 1) return;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (exitAlpha <= 0) return;

  const cp = getControlPoint(cx, cy, sx, sy);
  const t = client.flowPhase;
  const x = quadBezier(cx, cp[0], sx, t);
  const y = quadBezier(cy, cp[1], sy, t);
  const tTrail = Math.max(0, t - 0.03);
  const tx = quadBezier(cx, cp[0], sx, tTrail);
  const ty = quadBezier(cy, cp[1], sy, tTrail);

  ctx.save();
  ctx.globalAlpha = 0.12 * exitAlpha;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.3 * exitAlpha;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
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
