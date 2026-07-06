"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { formatUsd, providerNetFromGross } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

export function EarnPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [monthly, setMonthly] = useState(500);
  const net = useMemo(() => providerNetFromGross(monthly), [monthly]);

  const rows = [
    t.earnPage.rows.billing,
    t.earnPage.rows.payout,
    t.earnPage.rows.fee,
    t.earnPage.rows.fit,
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.earnPage.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.earnPage.subtitle}</p>

        <h2 className="mt-12 font-heading text-2xl font-bold">{t.earnPage.compareTitle}</h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border-2 border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-semibold" />
                <th className="px-4 py-3 font-semibold">{t.earnPage.tokenMarket}</th>
                <th className="px-4 py-3 font-semibold">{t.earnPage.shareMarket}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{row.label}</th>
                  <td className="px-4 py-3">{row.token}</td>
                  <td className="px-4 py-3">{row.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card className="mt-10">
          <h2 className="font-heading text-xl font-bold">{t.earnPage.calculator.title}</h2>
          <label className="mt-6 block text-sm font-medium">
            {t.earnPage.calculator.label}
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="mt-3 w-full accent-accent"
            />
          </label>
          <p className="mt-4 font-mono text-2xl font-bold">{formatUsd(monthly, locale)}</p>
          <p className="mt-2 text-muted-foreground">
            {t.earnPage.calculator.net}:{" "}
            <span className="font-semibold text-foreground">{formatUsd(net, locale)}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t.earnPage.calculator.note}</p>
        </Card>

        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.earnPage.steps.title}</h2>
          <ol className="mt-6 space-y-3">
            {t.earnPage.steps.items.map((step, i) => (
              <li key={step} className="flex gap-3 rounded-xl border-2 border-border bg-card p-4 text-sm">
                <span className="font-bold text-accent">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
