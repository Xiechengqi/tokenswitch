import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";

export function EarnStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-border-strong bg-card p-6 sm:p-10">
          <span
            className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rotate-12 rounded-full border-2 border-quaternary/50 bg-quaternary/10"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t.earn.title}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t.earn.subtitle}</p>

            {/* Split of one dollar of routed usage. The 10 % / 5 % figures are
             * the commission defaults in tokens.css, not illustrative. */}
            <div className="mt-8 rounded-2xl border-2 border-border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm tabular-nums">
                <span className="rounded-full border-2 border-border-strong bg-background px-3 py-1.5 font-semibold">
                  $1.00
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="rounded-full border-2 border-accent bg-accent/10 px-3 py-1.5 font-semibold text-accent">
                  Provider $0.85
                </span>
                <span className="rounded-full border-2 border-border px-3 py-1.5 text-muted-foreground">
                  Market $0.10
                </span>
                <span className="rounded-full border-2 border-border px-3 py-1.5 text-muted-foreground">
                  Router $0.05
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.earn.breakdown}</p>
            </div>

            <div className="mt-6">
              <Button href={`${localePath(locale)}#install`}>
                {t.earn.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
