import { useRef, useState, useEffect, useCallback } from 'react';
import worldData from 'world-atlas/land-110m.json';
import * as topojson from 'topojson-client';
import { createProjection } from '../lib/projection';
import { updateAnimationStates } from '../lib/animation';
import {
  renderBaseMap,
  renderServer,
  renderClient,
  renderRipple,
  renderArc,
  renderFlowDot,
} from '../lib/renderer';
import { useMapPoints } from '../hooks/useMapPoints';
import StatusCard from './StatusCard';
import HeroOverlay from './HeroOverlay';

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export default function WorldMap() {
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const projRef = useRef(null);
  const dataRef = useRef({ regions: [], servers: [], clients: [] });
  const clientHitRef = useRef([]);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [counts, setCounts] = useState({ clients: 0, servers: 0 });
  const [regions, setRegions] = useState([]);
  const [hoveredClient, setHoveredClient] = useState(null);

  // Zoom/pan state (in refs for perf — no re-render needed)
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

  const handleUpdate = useCallback((data) => {
    dataRef.current = data;
    setCounts({ clients: data.clientCount || 0, servers: data.servers.length });
    if (data.regions.length > 0) setRegions(data.regions);
  }, []);

  useMapPoints(handleUpdate);

  // Setup projection + offscreen base map
  const setupMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const offscreen = document.createElement('canvas');
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const offCtx = offscreen.getContext('2d');
    offCtx.scale(dpr, dpr);
    offscreenRef.current = offscreen;

    const land = topojson.feature(worldData, worldData.objects.land);
    const { projection, path } = createProjection(w, h, land);
    projRef.current = { projection, path, width: w, height: h, dpr };

    renderBaseMap(offscreen, path, worldData);
  }, []);

  // Animation loop
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    const proj = projRef.current;
    if (!canvas || !offscreen || !proj) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const dt = timestamp - (lastTimeRef.current || timestamp);
    lastTimeRef.current = timestamp;

    const ctx = canvas.getContext('2d');
    const { projection, dpr } = proj;
    const { servers, clients } = dataRef.current;
    const { zoom, panX, panY } = viewRef.current;

    updateAnimationStates(clients, timestamp, dt);

    // Clear
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom + pan to base map
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, panX * dpr, panY * dpr);
    ctx.drawImage(offscreen, 0, 0, offscreen.width / dpr, offscreen.height / dpr);

    // Project server positions, build region→server map
    const regionToServer = new Map();
    const serverPositions = [];
    for (const s of servers) {
      const p = projection([s.lon, s.lat]);
      if (!p) continue;
      const sp = { x: p[0], y: p[1], url: s.url, region: s.region };
      serverPositions.push(sp);
      regionToServer.set(s.region, sp);
    }

    // Project client positions + offset overlapping ones
    const OVERLAP_THRESHOLD = 15;
    const OFFSET_RADIUS = 18;

    // Group clients that overlap with their server
    const overlapCounts = new Map(); // region → count of overlapping clients
    const clientProjections = [];
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

    // Assign angular positions for overlapping clients
    const overlapIndices = new Map(); // region → next index
    for (const cp of clientProjections) {
      if (!cp.overlaps) continue;
      const sp = regionToServer.get(cp.client.region);
      const total = overlapCounts.get(cp.client.region);
      const idx = overlapIndices.get(cp.client.region) || 0;
      overlapIndices.set(cp.client.region, idx + 1);
      const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
      cp.x = sp.x + Math.cos(angle) * OFFSET_RADIUS;
      cp.y = sp.y + Math.sin(angle) * OFFSET_RADIUS;
    }

    // Draw arcs (only to own region's server)
    for (const cp of clientProjections) {
      const sp = regionToServer.get(cp.client.region);
      if (!sp) continue;
      renderArc(ctx, cp.x, cp.y, sp.x, sp.y, cp.client);
      renderFlowDot(ctx, cp.x, cp.y, sp.x, sp.y, cp.client);
    }

    // Draw ripples
    for (const cp of clientProjections) {
      renderRipple(ctx, cp.x, cp.y, cp.client);
    }

    // Draw servers
    for (const sp of serverPositions) {
      renderServer(ctx, sp.x, sp.y);
    }

    // Draw clients
    for (const cp of clientProjections) {
      renderClient(ctx, cp.x, cp.y, cp.client);
    }

    clientHitRef.current = clientProjections.map((cp) => ({
      x: cp.x,
      y: cp.y,
      count: cp.client.count || 1,
    }));

    ctx.restore();

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // --- Event handlers for zoom/pan ---

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const view = viewRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * factor));
    const scale = newZoom / view.zoom;

    // Zoom toward cursor
    view.panX = mx - scale * (mx - view.panX);
    view.panY = my - scale * (my - view.panY);
    view.zoom = newZoom;
  }, []);

  const handlePointerDown = useCallback((e) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
    canvasRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    const view = viewRef.current;
    view.panX += e.clientX - drag.lastX;
    view.panY += e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  }, []);

  const handlePointerUp = useCallback((e) => {
    dragRef.current.dragging = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoveredClient(null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  }, []);

  // Click on server dot → open URL in new tab
  const handleClick = useCallback((e) => {
    if (!projRef.current) return;
    const { projection, dpr } = projRef.current;
    const { zoom, panX, panY } = viewRef.current;
    const { servers } = dataRef.current;

    const rect = canvasRef.current.getBoundingClientRect();
    // Convert screen coords to map coords
    const mapX = (e.clientX - rect.left - panX) / zoom;
    const mapY = (e.clientY - rect.top - panY) / zoom;

    const HIT_RADIUS = 12;
    for (const s of servers) {
      const p = projection([s.lon, s.lat]);
      if (!p) continue;
      const dist = Math.hypot(p[0] - mapX, p[1] - mapY);
      if (dist <= HIT_RADIUS) {
        window.open(s.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }
  }, []);

  // Show pointer cursor when hovering over server dots
  const handleMouseMove = useCallback((e) => {
    if (!projRef.current || dragRef.current.dragging) return;
    const { projection } = projRef.current;
    const { zoom, panX, panY } = viewRef.current;
    const { servers } = dataRef.current;

    const rect = canvasRef.current.getBoundingClientRect();
    const mapX = (e.clientX - rect.left - panX) / zoom;
    const mapY = (e.clientY - rect.top - panY) / zoom;

    let overServer = false;
    let hoveredCount = null;
    const HIT_RADIUS = 12;
    for (const s of servers) {
      const p = projection([s.lon, s.lat]);
      if (!p) continue;
      if (Math.hypot(p[0] - mapX, p[1] - mapY) <= HIT_RADIUS) {
        overServer = true;
        break;
      }
    }
    for (const client of clientHitRef.current) {
      if (Math.hypot(client.x - mapX, client.y - mapY) <= HIT_RADIUS) {
        hoveredCount = client.count;
        break;
      }
    }
    setHoveredClient(
      hoveredCount == null
        ? null
        : { count: hoveredCount, x: e.clientX + 14, y: e.clientY + 14 },
    );
    canvasRef.current.style.cursor = overServer ? 'pointer' : hoveredCount != null ? 'default' : 'grab';
  }, []);

  useEffect(() => {
    setupMap();
    rafRef.current = requestAnimationFrame(animate);

    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const onResize = () => {
      viewRef.current = { zoom: 1, panX: 0, panY: 0 };
      setHoveredClient(null);
      setupMap();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', onResize);
    };
  }, [setupMap, animate, handleWheel]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="world-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => { handlePointerMove(e); handleMouseMove(e); }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />
      <StatusCard clientCount={counts.clients} serverCount={counts.servers} regions={regions} />
      <HeroOverlay />
      {hoveredClient && (
        <div
          className="map-tooltip"
          style={{ left: hoveredClient.x, top: hoveredClient.y }}
        >
          {hoveredClient.count} {hoveredClient.count === 1 ? 'client' : 'clients'}
        </div>
      )}
    </>
  );
}
