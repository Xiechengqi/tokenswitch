"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { DOCKER_COMMAND } from "@/lib/constants";

export function TerminalCard({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DOCKER_COMMAND);
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
          <span className="font-mono text-xs text-white/60">bash</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-white/15 px-2 py-1 font-mono text-xs hover:bg-white/10"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex gap-2 font-mono text-xs sm:text-sm">
          <span className="text-quaternary">$</span>
          <code className="break-all text-white/90">{DOCKER_COMMAND}</code>
        </div>
        <p className="text-xs text-white/60">
          <a href="http://localhost:8008" className="underline" target="_blank" rel="noopener noreferrer">
            http://localhost:8008
          </a>
          <span className="mx-2">·</span>
          {t.download.webLoginHint}
        </p>
        <video
          className="aspect-video w-full rounded-lg border border-white/10 bg-black/30 object-cover"
          src="/tokenswitch-use.mp4"
          poster="/og.png"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="cc-switch web UI walkthrough"
        />
      </div>
    </div>
  );
}
