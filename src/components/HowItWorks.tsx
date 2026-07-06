"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";

/* Geometry — viewBox 0 0 960 212. Four evenly spaced nodes on one baseline. */
const NODE_W = 150;
const NODE_H = 112;
const NODE_TOP = 80;
const LINK_Y = NODE_TOP + NODE_H / 2;
const RX = 16;
/** Left x of: client, router, market, consumer. */
const LEFTS = [24, 278, 532, 786] as const;
/** [x0, x1] of the gap between node i and node i+1. LINKS[0] is the SSH tunnel. */
const LINKS = [0, 1, 2].map((i) => [LEFTS[i] + NODE_W, LEFTS[i + 1]] as const);

/* Timeline (ms). A request travels consumer → market → router → client hop by
 * hop, pausing at each node while it "processes" (ring pulse); the client
 * thinks a beat longer, then the response returns along the same links. */
const HOP = 650;
const DWELL = 320;
const CYCLE = 7200;

type Hop = { t0: number; t1: number; x0: number; x1: number };
const hop = (t0: number, link: readonly [number, number], toLeft: boolean): Hop => ({
  t0,
  t1: t0 + HOP,
  x0: toLeft ? link[1] : link[0],
  x1: toLeft ? link[0] : link[1],
});

const REQ: Hop[] = [
  hop(300, LINKS[2], true),
  hop(300 + (HOP + DWELL), LINKS[1], true),
  hop(300 + 2 * (HOP + DWELL), LINKS[0], true),
];
const RES_START = REQ[2].t1 + 810;
const RES: Hop[] = [
  hop(RES_START, LINKS[0], false),
  hop(RES_START + (HOP + DWELL), LINKS[1], false),
  hop(RES_START + 2 * (HOP + DWELL), LINKS[2], false),
];

/** Ring pulses: when a dot reaches a node (plus the initial "request born"). */
const PULSES = [
  { node: 3, t: 80, dur: 520 },
  { node: 2, t: REQ[0].t1, dur: 520 },
  { node: 1, t: REQ[1].t1, dur: 520 },
  { node: 0, t: REQ[2].t1, dur: 760 },
  { node: 1, t: RES[0].t1, dur: 420 },
  { node: 2, t: RES[1].t1, dur: 420 },
  { node: 3, t: RES[2].t1, dur: 640 },
] as const;

const easeInOut = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const easeOut = (p: number) => 1 - (1 - p) ** 3;

export function HowItWorks({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const svgRef = useRef<SVGSVGElement>(null);
  const tunnelRef = useRef<SVGLineElement>(null);
  const dotReq = useRef<SVGCircleElement>(null);
  const trailReq = useRef<SVGCircleElement>(null);
  const dotRes = useRef<SVGCircleElement>(null);
  const trailRes = useRef<SVGCircleElement>(null);
  const pillReq = useRef<SVGTextElement>(null);
  const pillRes = useRef<SVGTextElement>(null);
  const ringRefs = useRef<Array<SVGRectElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const svg = svgRef.current;
    if (!svg) return;

    const start = performance.now();
    let raf = 0;
    let running = false;

    const placeDot = (
      dot: SVGCircleElement | null,
      trail: SVGCircleElement | null,
      hops: Hop[],
      elapsed: number,
    ) => {
      if (!dot || !trail) return;
      const seg = hops.find((h) => elapsed >= h.t0 && elapsed < h.t1);
      if (!seg) {
        dot.setAttribute("opacity", "0");
        trail.setAttribute("opacity", "0");
        return;
      }
      const p = (elapsed - seg.t0) / HOP;
      const fade = Math.min(1, p / 0.18, (1 - p) / 0.18);
      dot.setAttribute("cx", String(seg.x0 + (seg.x1 - seg.x0) * easeInOut(p)));
      dot.setAttribute("opacity", String(fade));
      const pTrail = p - 90 / HOP;
      if (pTrail <= 0) {
        trail.setAttribute("opacity", "0");
      } else {
        trail.setAttribute("cx", String(seg.x0 + (seg.x1 - seg.x0) * easeInOut(pTrail)));
        trail.setAttribute("opacity", String(fade * 0.35));
      }
    };

    const phaseOpacity = (elapsed: number, a: number, b: number) =>
      elapsed < a || elapsed > b ? 0 : Math.min(1, (elapsed - a) / 200, (b - elapsed) / 200);

    const loop = (now: number) => {
      if (!running) return;
      const total = now - start;
      const elapsed = total % CYCLE;

      placeDot(dotReq.current, trailReq.current, REQ, elapsed);
      placeDot(dotRes.current, trailRes.current, RES, elapsed);

      for (let i = 0; i < 4; i++) {
        const ring = ringRefs.current[i];
        if (!ring) continue;
        let opacity = 0;
        let pad = 0;
        for (const ev of PULSES) {
          if (ev.node !== i) continue;
          const dt = elapsed - ev.t;
          if (dt < 0 || dt >= ev.dur) continue;
          const k = dt / ev.dur;
          pad = 3 + 9 * easeOut(k);
          opacity = Math.max(opacity, 0.9 * (1 - k));
        }
        if (opacity > 0) {
          ring.setAttribute("x", String(LEFTS[i] - pad));
          ring.setAttribute("y", String(NODE_TOP - pad));
          ring.setAttribute("width", String(NODE_W + 2 * pad));
          ring.setAttribute("height", String(NODE_H + 2 * pad));
          ring.setAttribute("rx", String(RX + pad * 0.6));
        }
        ring.setAttribute("opacity", String(opacity));
      }

      pillReq.current?.setAttribute("opacity", String(phaseOpacity(elapsed, REQ[0].t0, REQ[2].t1)));
      pillRes.current?.setAttribute("opacity", String(phaseOpacity(elapsed, RES[0].t0, RES[2].t1)));

      // Slow dash drift on the persistent tunnel link (client → router).
      tunnelRef.current?.setAttribute("stroke-dashoffset", String(-((total * 0.02) % 14)));

      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(svg);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const tunnelMid = (LINKS[0][0] + LINKS[0][1]) / 2;

  return (
    <section className="py-16 sm:py-20" id="how-it-works">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.howItWorks.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.howItWorks.subtitle}</p>
        </div>

        <div className="mt-10 overflow-x-auto">
          <svg
            ref={svgRef}
            className="mx-auto block w-full max-w-[950px] min-w-[720px]"
            viewBox="0 0 960 212"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={t.howItWorks.title}
          >
            {/* Links: neutral baselines; the tunnel link is a dashed accent line. */}
            {LINKS.slice(1).map(([x0, x1]) => (
              <line
                key={x0}
                x1={x0}
                y1={LINK_Y}
                x2={x1}
                y2={LINK_Y}
                stroke="var(--border-strong)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.25"
              />
            ))}
            <line
              ref={tunnelRef}
              x1={LINKS[0][0]}
              y1={LINK_Y}
              x2={LINKS[0][1]}
              y2={LINK_Y}
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 8"
            />
            <text
              x={tunnelMid}
              y={LINK_Y + 26}
              textAnchor="middle"
              className="fill-accent font-mono text-[10px] font-semibold"
            >
              {t.howItWorks.labels.tunnel}
            </text>

            {/* Phase captions (at most one visible at a time). */}
            <g aria-hidden="true">
              <text
                ref={pillReq}
                x={480}
                y={40}
                textAnchor="middle"
                opacity="0"
                className="fill-secondary text-[12px] font-bold uppercase tracking-widest"
              >
                {t.howItWorks.labels.request}
              </text>
              <text
                ref={pillRes}
                x={480}
                y={40}
                textAnchor="middle"
                opacity="0"
                className="fill-quaternary text-[12px] font-bold uppercase tracking-widest"
              >
                {t.howItWorks.labels.response}
              </text>
            </g>

            {/* Node pulse rings (attributes driven per frame). */}
            <g aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  ref={(el) => {
                    ringRefs.current[i] = el;
                  }}
                  x={LEFTS[i]}
                  y={NODE_TOP}
                  width={NODE_W}
                  height={NODE_H}
                  rx={RX}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  opacity="0"
                />
              ))}
            </g>

            <Node left={LEFTS[0]} kind="client" label={t.howItWorks.nodes.client} caption={t.howItWorks.nodes.clientCap} />
            <Node left={LEFTS[1]} kind="router" label={t.howItWorks.nodes.router} caption={t.howItWorks.nodes.routerCap} />
            <Node left={LEFTS[2]} kind="market" label={t.howItWorks.nodes.market} caption={t.howItWorks.nodes.marketCap} accent />
            <Node left={LEFTS[3]} kind="consumer" label={t.howItWorks.nodes.consumer} caption={t.howItWorks.nodes.consumerCap} />

            {/* Traveling dots with comet trails. */}
            <g aria-hidden="true">
              <circle ref={trailReq} cy={LINK_Y} r="4" fill="var(--secondary)" opacity="0" />
              <circle ref={dotReq} cy={LINK_Y} r="6" fill="var(--secondary)" opacity="0" />
              <circle ref={trailRes} cy={LINK_Y} r="4" fill="var(--quaternary)" opacity="0" />
              <circle ref={dotRes} cy={LINK_Y} r="6" fill="var(--quaternary)" opacity="0" />
            </g>
          </svg>
        </div>

        <ol className="mx-auto mt-10 grid max-w-3xl gap-4">
          {t.howItWorks.steps.map((step, i) => (
            <li key={step.bold} className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border-strong)] bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed sm:text-base">
                <b>{step.bold}</b> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type NodeKind = "client" | "router" | "market" | "consumer";

function Node({
  left,
  kind,
  label,
  caption,
  accent,
}: {
  left: number;
  kind: NodeKind;
  label: string;
  caption: string;
  accent?: boolean;
}) {
  return (
    <g transform={`translate(${left}, ${NODE_TOP})`}>
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={RX}
        fill={accent ? "color-mix(in srgb, var(--accent) 10%, var(--card))" : "var(--card)"}
        stroke={accent ? "var(--accent)" : "var(--border-strong)"}
        strokeWidth="2"
      />
      <g transform={`translate(${NODE_W / 2}, 38)`} className="text-foreground">
        <NodeIcon kind={kind} />
      </g>
      <text x={NODE_W / 2} y={76} textAnchor="middle" className="fill-foreground font-heading text-sm font-bold">
        {label}
      </text>
      <text x={NODE_W / 2} y={94} textAnchor="middle" className="fill-muted-foreground text-xs">
        {caption}
      </text>
    </g>
  );
}

function NodeIcon({ kind }: { kind: NodeKind }) {
  switch (kind) {
    case "client":
      return (
        <>
          <rect x="-17" y="-13" width="34" height="21" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="-23" y="10" width="46" height="3" rx="1.5" fill="currentColor" />
          <path d="M 2 -9 L -5 0 L 0 0 L -3 7 L 6 -3 L 1 -3 Z" fill="var(--accent)" />
        </>
      );
    case "router":
      return (
        <>
          <circle r="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <ellipse rx="6" ry="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M -14 0 L 14 0" stroke="currentColor" strokeWidth="1.5" />
          <circle r="2.5" fill="var(--accent)" />
        </>
      );
    case "market":
      return (
        <>
          <circle r="13" fill="none" stroke="currentColor" strokeWidth="2" />
          <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" className="fill-accent font-mono">
            $
          </text>
        </>
      );
    case "consumer":
      return (
        <>
          <circle cy="-6" r="5.5" fill="currentColor" />
          <path d="M -10 12 Q -10 1 0 1 Q 10 1 10 12 Z" fill="currentColor" />
        </>
      );
  }
}
