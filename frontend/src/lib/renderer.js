import * as topojson from 'topojson-client';

// Draw the static land mass onto an offscreen canvas
export function renderBaseMap(canvas, path, topology) {
  const ctx = canvas.getContext('2d');
  const land = topojson.feature(topology, topology.objects.land);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Land fill
  ctx.beginPath();
  path.context(ctx)(land);
  ctx.fillStyle = '#E8E8ED';
  ctx.fill();

  // Land stroke
  ctx.beginPath();
  path.context(ctx)(land);
  ctx.strokeStyle = '#D2D2D7';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

// Draw server point with shadow
export function renderServer(ctx, x, y) {
  // Shadow
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fill();

  // Core dot
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#1D1D1F';
  ctx.fill();
}

// Draw client point with enter animation
export function renderClient(ctx, x, y, client) {
  const enterEase = easeOutCubic(client.enterProgress);
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  const alpha = enterEase * exitAlpha;
  const scale = enterEase;

  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Core dot
  const r = 4 * scale;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = client.color;
  ctx.fill();

  ctx.restore();
}

// Draw ripple effect
export function renderRipple(ctx, x, y, client) {
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

// Draw arc line between client and server
export function renderArc(ctx, cx, cy, sx, sy, client) {
  const progress = client.arcProgress;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (progress <= 0 || exitAlpha <= 0) return;

  const cp = getControlPoint(cx, cy, sx, sy);

  ctx.save();
  ctx.globalAlpha = exitAlpha;
  ctx.beginPath();
  ctx.moveTo(cx, cy);

  if (progress < 1) {
    // Partial arc draw
    const steps = Math.floor(progress * 50);
    for (let i = 1; i <= steps; i++) {
      const t = i / 50;
      const px = quadBezier(cx, cp[0], sx, t);
      const py = quadBezier(cy, cp[1], sy, t);
      ctx.lineTo(px, py);
    }
  } else {
    ctx.quadraticCurveTo(cp[0], cp[1], sx, sy);
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Draw flowing light dot along the arc
export function renderFlowDot(ctx, cx, cy, sx, sy, client) {
  if (client.arcProgress < 1) return;
  const exitAlpha = client.exiting ? 1 - easeOutCubic(client.exitProgress) : 1;
  if (exitAlpha <= 0) return;

  const cp = getControlPoint(cx, cy, sx, sy);
  const t = client.flowPhase;
  const x = quadBezier(cx, cp[0], sx, t);
  const y = quadBezier(cy, cp[1], sy, t);

  // Trail (slightly behind)
  const tTrail = Math.max(0, t - 0.03);
  const tx = quadBezier(cx, cp[0], sx, tTrail);
  const ty = quadBezier(cy, cp[1], sy, tTrail);

  ctx.save();
  ctx.globalAlpha = 0.12 * exitAlpha;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.strokeStyle = '#1D1D1F';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.3 * exitAlpha;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#1D1D1F';
  ctx.fill();
  ctx.restore();
}

// --- Helpers ---

function getControlPoint(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return [midX, midY - dist * 0.3];
}

function quadBezier(p0, p1, p2, t) {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
