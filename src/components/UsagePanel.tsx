"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AggregatedUsage, Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { regionLabel } from "@/lib/regions";
import { formatCompactTokens, formatFullTokens, splitModelRows } from "@/lib/usage";
import { cn } from "@/lib/cn";

/* Same rotation as StatsStrip, so a figure keeps its colour across the site. */
const RULES = ["bg-accent", "bg-secondary", "bg-tertiary", "bg-quaternary"] as const;

function Figure({
  label,
  value,
  rule,
}: {
  label: string;
  value: number;
  rule: string;
}) {
  return (
    <div className="min-w-0">
      <div
        className="font-heading text-2xl font-bold tabular-nums"
        title={formatFullTokens(value)}
      >
        {formatCompactTokens(value)}
      </div>
      <div className={cn("mt-2 h-0.5 w-8 rounded-full", rule)} aria-hidden />
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/** Cross-region 24h token usage. Each router publishes its own figure as an SVG
 * badge; this is the same data summed, with the per-model breakdown behind a
 * disclosure so the panel stays one figure tall until asked.
 *
 * `usage` is a prop rather than a hook call because the page also labels each
 * region card with its own share of the same aggregate — one poller, one set of
 * numbers, no chance of the panel and the cards disagreeing mid-refresh. */
export function UsagePanel({
  locale,
  usage,
}: {
  locale: Locale;
  usage: AggregatedUsage;
}) {
  const t = getDict(locale);
  const [open, setOpen] = useState(false);
  const modelsId = useId();

  // No region answered — an empty panel is more honest than a zero.
  if (usage.regionsReporting === 0) return null;

  const isSnapshot = usage.isSnapshot !== false;
  const { rows, otherCount, otherTokens, modelCount } = splitModelRows(usage.models);
  const maxRow = rows[0]?.totalTokens ?? 0;

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="font-heading text-xl font-bold">{t.usage.title}</h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isSnapshot ? "bg-muted-foreground/50" : "ts-heartbeat bg-quaternary",
            )}
            aria-hidden
          />
          {isSnapshot ? t.stats.snapshot : t.stats.live}
        </span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">{t.usage.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="min-w-0">
          <div
            className="font-heading text-5xl font-extrabold tabular-nums"
            title={formatFullTokens(usage.totalTokens)}
          >
            {formatCompactTokens(usage.totalTokens)}
          </div>
          <div className="mt-2 h-0.5 w-12 rounded-full bg-accent" aria-hidden />
          <div className="mt-2 text-sm text-muted-foreground">{t.usage.total}</div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-4">
          <Figure label={t.usage.input} value={usage.inputTokens} rule={RULES[1]} />
          <Figure label={t.usage.output} value={usage.outputTokens} rule={RULES[2]} />
          <Figure label={t.usage.cache} value={usage.cacheTokens} rule={RULES[3]} />
        </div>
      </div>

      {/* A missing region is not a zero. Say so, or the total reads as the whole
        * network when it is only part of it. */}
      {usage.partial && (
        <p className="mt-5 rounded-xl border-2 border-tertiary/50 bg-tertiary/10 px-3 py-2 text-xs text-muted-foreground">
          {t.usage.partial(usage.regionsReporting, usage.regionsTotal)}
          {usage.missingRegions.length > 0 && (
            <>
              {" "}
              {usage.missingRegions.map((name) => regionLabel(name, locale)).join(" · ")}
            </>
          )}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {usage.byRegion.map((row) => (
          <span
            key={row.region}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-medium",
              row.reporting
                ? "border-border"
                : "border-dashed border-border text-muted-foreground",
            )}
            title={row.reporting ? formatFullTokens(row.totalTokens) : undefined}
          >
            {regionLabel(row.region, locale)}
            <b className="tabular-nums">
              {row.reporting ? formatCompactTokens(row.totalTokens) : t.usage.noData}
            </b>
          </span>
        ))}
      </div>

      {rows.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={modelsId}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color] duration-[var(--dur-fast)] ease-out hover:border-accent hover:bg-accent/5"
          >
            {open ? t.usage.hideModels : t.usage.showModels(modelCount)}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-[var(--dur-base)] ease-out motion-reduce:transition-none",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {/* 0fr → 1fr keeps the transition on the grid track instead of a
            * hardcoded max-height that would clip a long model list. */}
          <div
            id={modelsId}
            className={cn(
              "grid transition-[grid-template-rows] duration-[var(--dur-slow)] ease-out motion-reduce:transition-none",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <ul className="mt-4 space-y-2.5" aria-hidden={!open}>
                {rows.map((row, i) => (
                  <li key={row.model} className="flex items-center gap-3">
                    <span className="w-1/2 shrink-0 truncate font-mono text-xs" title={row.model}>
                      {row.model}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                      <span
                        className={cn("block h-full rounded-full", RULES[i % RULES.length])}
                        style={{
                          width: `${maxRow > 0 ? Math.max(2, (row.totalTokens / maxRow) * 100) : 0}%`,
                        }}
                      />
                    </span>
                    <span
                      className="w-16 shrink-0 text-right font-mono text-xs tabular-nums"
                      title={formatFullTokens(row.totalTokens)}
                    >
                      {formatCompactTokens(row.totalTokens)}
                    </span>
                  </li>
                ))}
                {otherCount > 0 && (
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-1/2 shrink-0 truncate text-xs">
                      {t.usage.otherModels(otherCount)}
                    </span>
                    <span className="h-2 flex-1" aria-hidden />
                    <span
                      className="w-16 shrink-0 text-right font-mono text-xs tabular-nums"
                      title={formatFullTokens(otherTokens)}
                    >
                      {formatCompactTokens(otherTokens)}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
