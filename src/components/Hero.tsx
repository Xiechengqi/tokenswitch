import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";
import { TerminalCard } from "./TerminalCard";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="relative overflow-hidden border-b-2 border-border">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 rotate-12 rounded-2xl border-2 border-tertiary/60 bg-tertiary/20"
        aria-hidden
      />

      <div className="mx-auto grid max-w-[var(--container)] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={localePath(locale, "download")}>{t.hero.ctaClient} →</Button>
            <Button href={localePath(locale, "markets")} variant="secondary">
              {t.hero.ctaMarkets}
            </Button>
          </div>
        </div>
        <TerminalCard locale={locale} />
      </div>
    </section>
  );
}
