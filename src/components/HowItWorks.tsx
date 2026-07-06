"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";

const CYCLE = 6000;
const P_REQ: [number, number] = [2000, 3000];
const P_ROUTE: [number, number] = [3000, 4000];
const P_TUNNEL: [number, number] = [2500, 3500];
const P_BACK: [number, number] = [4000, 5500];

export function HowItWorks({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const tunnelRef = useRef<SVGPathElement>(null);
  const reqRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const marketRef = useRef<SVGPathElement>(null);
  const dotReq = useRef<SVGCircleElement>(null);
  const dotRoute = useRef<SVGCircleElement>(null);
  const dotTunnel = useRef<SVGCircleElement>(null);
  const dotBack = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = performance.now();
    let raf = 0;

    const setDot = (el: SVGCircleElement | null, path: SVGPathElement | null, p: number, reverse = false) => {
      if (!el || !path) return;
      const len = path.getTotalLength();
      const tVal = reverse ? 1 - p : p;
      const pt = path.getPointAtLength(tVal * len);
      el.setAttribute("cx", String(pt.x));
      el.setAttribute("cy", String(pt.y));
      el.setAttribute("opacity", "1");
    };

    const hide = (el: SVGCircleElement | null) => el?.setAttribute("opacity", "0");

    const loop = (now: number) => {
      const elapsed = (now - start) % CYCLE;

      if (elapsed >= P_REQ[0] && elapsed < P_REQ[1]) {
        setDot(dotReq.current, reqRef.current, (elapsed - P_REQ[0]) / (P_REQ[1] - P_REQ[0]));
      } else hide(dotReq.current);

      if (elapsed >= P_TUNNEL[0] && elapsed < P_TUNNEL[1]) {
        setDot(
          dotTunnel.current,
          tunnelRef.current,
          (elapsed - P_TUNNEL[0]) / (P_TUNNEL[1] - P_TUNNEL[0]),
        );
      } else hide(dotTunnel.current);

      if (elapsed >= P_ROUTE[0] && elapsed < P_ROUTE[1]) {
        setDot(
          dotRoute.current,
          marketRef.current,
          (elapsed - P_ROUTE[0]) / (P_ROUTE[1] - P_ROUTE[0]),
        );
      } else hide(dotRoute.current);

      if (elapsed >= P_BACK[0] && elapsed < P_BACK[1]) {
        setDot(dotBack.current, backRef.current, (elapsed - P_BACK[0]) / (P_BACK[1] - P_BACK[0]));
      } else hide(dotBack.current);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="border-b-2 border-border py-16 sm:py-20" id="how-it-works">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.howItWorks.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.howItWorks.subtitle}</p>
        </div>

        <div className="mt-10 overflow-x-auto">
          <svg
            className="mx-auto min-w-[720px] max-w-full"
            viewBox="0 0 1100 300"
            role="img"
            aria-label={t.howItWorks.title}
          >
            <path ref={tunnelRef} className="stroke-accent" strokeWidth="2" fill="none" d="M 180 150 L 310 150" />
            <path ref={reqRef} className="stroke-secondary" strokeWidth="2" fill="none" d="M 860 130 Q 600 40 520 130" />
            <path ref={marketRef} className="stroke-tertiary" strokeWidth="2" fill="none" d="M 520 150 L 700 150" />
            <path ref={backRef} className="stroke-quaternary" strokeWidth="2" fill="none" d="M 310 170 Q 600 250 860 170" />

            <Node x={90} label={t.howItWorks.nodes.client} caption={t.howItWorks.nodes.clientCap} />
            <Node x={310} label={t.howItWorks.nodes.router} caption={t.howItWorks.nodes.routerCap} />
            <Node x={520} label={t.howItWorks.nodes.market} caption={t.howItWorks.nodes.marketCap} accent />
            <Node x={860} label={t.howItWorks.nodes.consumer} caption={t.howItWorks.nodes.consumerCap} />

            <circle ref={dotTunnel} r="6" className="fill-accent" opacity="0" />
            <circle ref={dotReq} r="6" className="fill-secondary" opacity="0" />
            <circle ref={dotRoute} r="6" className="fill-tertiary" opacity="0" />
            <circle ref={dotBack} r="6" className="fill-quaternary" opacity="0" />
          </svg>
        </div>

        <ol className="mx-auto mt-10 grid max-w-3xl gap-4">
          {t.howItWorks.steps.map((step, i) => (
            <li key={step.bold} className="flex gap-4 rounded-2xl border-2 border-border bg-card p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-accent text-sm font-bold text-white">
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

function Node({
  x,
  label,
  caption,
  accent,
}: {
  x: number;
  label: string;
  caption: string;
  accent?: boolean;
}) {
  return (
    <g transform={`translate(${x - 90}, 90)`}>
      <rect
        width="180"
        height="120"
        rx="16"
        className={accent ? "fill-accent/10 stroke-accent" : "fill-card stroke-border-strong"}
        strokeWidth="2"
      />
      <text x="90" y="58" textAnchor="middle" className="fill-foreground text-sm font-bold">
        {label}
      </text>
      <text x="90" y="78" textAnchor="middle" className="fill-muted-foreground text-xs">
        {caption}
      </text>
    </g>
  );
}
