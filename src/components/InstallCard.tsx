"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { regionLabel } from "@/lib/regions";
import { buildInstallCommand, installCommandComplete } from "@/lib/install";
import { probeRegionHealth } from "@/lib/map-points";
import { useRegions } from "@/hooks/useRegions";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";

type HealthMap = Record<string, { healthy: boolean; latencyMs: number } | null>;
type CopyState = "idle" | "copied" | "error";

const field =
  "w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground " +
  "transition-colors duration-[var(--dur-fast)] ease-out placeholder:text-muted-foreground/60 focus:border-accent";

export function InstallCard({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const regions = useRegions();
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [health, setHealth] = useState<HealthMap>({});

  useEffect(() => {
    if (!regions.length) return;
    setSelected((prev) => (regions.some((r) => r.name === prev) ? prev : regions[0].name));
  }, [regions]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      regions.map(async (region) => {
        const result = await probeRegionHealth(region.url);
        return [region.name, result] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setHealth(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [regions]);

  const region = useMemo(
    () => regions.find((r) => r.name === selected) ?? regions[0],
    [regions, selected],
  );

  const regionHealth = region ? health[region.name] : null;
  const unhealthy = regionHealth?.healthy === false;
  const incomplete = !installCommandComplete(email, password);
  const canCopy = !!region && !unhealthy && !incomplete;
  const command = region ? buildInstallCommand(region, email, password) : "";

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div
      id="install"
      className="overflow-hidden rounded-2xl bg-card text-foreground"
    >
      {/* A typographic label, not a re-drawn terminal window — the reader
       * already owns a terminal; the page's job is the command. */}
      <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-2.5">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t.install.badge}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-[11px] font-medium",
            // Mint on cream is 1.9:1 and hot pink 2.6:1 — the hue lives on
            // the border and the dot; the label stays ink.
            regionHealth == null
              ? "border-border text-muted-foreground"
              : regionHealth.healthy
                ? "border-quaternary text-foreground"
                : "border-secondary text-foreground",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              regionHealth == null
                ? "bg-muted-foreground/50"
                : regionHealth.healthy
                  ? "ts-heartbeat bg-quaternary"
                  : "bg-secondary",
            )}
            aria-hidden
          />
          {regionHealth == null
            ? "…"
            : regionHealth.healthy
              ? `${t.network.healthy}${regionHealth.latencyMs != null ? ` · ${regionHealth.latencyMs}ms` : ""}`
              : t.network.down}
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">{t.install.linuxNote}</p>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">{t.install.region}</span>
          <select
            value={region?.name ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className={field}
          >
            {regions.map((r) => {
              const h = health[r.name];
              const status = h == null ? "" : h.healthy ? "" : ` (${t.network.down})`;
              return (
                <option key={r.name} value={r.name}>
                  {regionLabel(r.name, locale)}
                  {status}
                </option>
              );
            })}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">{t.install.email}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.install.emailPlaceholder}
              className={field}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">{t.install.password}</span>
            <input
              type="password"
              autoComplete="new-password"
              aria-describedby="install-password-hint"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.install.passwordPlaceholder}
              className={field}
            />
          </label>
        </div>
        <p id="install-password-hint" className="text-[11px] text-muted-foreground">
          {t.install.passwordHint}
        </p>

        <div className="rounded-xl border-2 border-border bg-muted/40 p-3">
          <div className="flex gap-2 font-mono text-[11px] leading-relaxed sm:text-xs">
            <span className="shrink-0 select-none text-accent" aria-hidden>
              $
            </span>
            <code className="min-w-0 break-all text-foreground/90">{command}</code>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Button type="button" onClick={handleCopy} disabled={!canCopy}>
            {copyState === "copied" && <Check className="h-4 w-4" aria-hidden />}
            {copyState === "copied" ? t.install.copied : t.install.copy}
          </Button>
          <a
            href={localePath(locale, "download")}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-out hover:text-foreground hover:underline"
          >
            {t.install.moreWays}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </a>
        </div>

        {/* Never leave a disabled control unexplained. */}
        <p aria-live="polite" className="min-h-[1lh] text-xs">
          {unhealthy ? (
            <span className="font-medium text-foreground">{t.install.unavailable}</span>
          ) : copyState === "error" ? (
            <span className="font-medium text-foreground">{t.install.copyFailed}</span>
          ) : incomplete ? (
            <span className="text-muted-foreground">{t.install.incomplete}</span>
          ) : copyState === "copied" ? (
            <span className="font-medium text-foreground">{t.install.pasteHint}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
