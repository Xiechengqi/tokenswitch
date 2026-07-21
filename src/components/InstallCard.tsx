"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { regionLabel } from "@/lib/regions";
import { buildInstallCommand, installCommandComplete } from "@/lib/install";
import { probeRegionHealth } from "@/lib/map-points";
import { useRegions } from "@/hooks/useRegions";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";

type HealthMap = Record<string, { healthy: boolean; latencyMs: number } | null>;

export function InstallCard({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const regions = useRegions();
  const [selected, setSelected] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
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
  const canCopy = !!region && !unhealthy && installCommandComplete(email, password);
  const command = region ? buildInstallCommand(region, email, password) : "";

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      id="install"
      className="overflow-hidden rounded-2xl border-2 border-border-strong bg-terminal text-white shadow-[8px_8px_0_0_#1e293b]"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <i className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <i className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <i className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-mono text-xs text-white/60">{t.install.badge}</span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            regionHealth == null
              ? "bg-white/10 text-white/60"
              : regionHealth.healthy
                ? "bg-quaternary/20 text-quaternary"
                : "bg-secondary/30 text-secondary",
          )}
        >
          {regionHealth == null
            ? "…"
            : regionHealth.healthy
              ? `${t.network.healthy}${regionHealth.latencyMs != null ? ` · ${regionHealth.latencyMs}ms` : ""}`
              : t.network.down}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm text-white/80">{t.install.linuxNote}</p>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/60">{t.install.region}</span>
          <select
            value={region?.name ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent"
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
            <span className="text-xs font-medium text-white/60">{t.install.email}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.install.emailPlaceholder}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/60">{t.install.password}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.install.passwordPlaceholder}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent"
            />
          </label>
        </div>
        <p className="text-[11px] text-white/50">{t.install.passwordHint}</p>

        <div className="rounded-xl bg-black/40 p-3">
          <div className="flex gap-2 font-mono text-[11px] leading-relaxed sm:text-xs">
            <span className="shrink-0 text-quaternary">$</span>
            <code className="break-all text-white/90">{command}</code>
          </div>
        </div>

        {unhealthy && <p className="text-xs text-secondary">{t.install.unavailable}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleCopy}
            disabled={!canCopy}
            className={cn(!canCopy && "pointer-events-none opacity-40")}
          >
            {copied ? t.install.copied : t.install.copy}
          </Button>
          <a
            href={localePath(locale, "download")}
            className="text-xs font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            {t.install.moreWays} →
          </a>
        </div>

        {copied && <p className="text-xs text-quaternary">{t.install.pasteHint}</p>}
      </div>
    </div>
  );
}
