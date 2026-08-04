import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";
import { InstallCard } from "./InstallCard";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="relative overflow-hidden">
      {/* Stable grid, wild decoration. These are absolutely positioned, so the
       * content grid below needs its own stacking context — otherwise the
       * shapes paint on top of the headline. */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-secondary/50 bg-secondary/20 sm:-right-16 sm:-top-16 sm:h-64 sm:w-64"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-8 hidden h-24 w-24 rotate-12 rounded-2xl border-2 border-tertiary/60 bg-tertiary/20 lg:block"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-[var(--container)] gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-20">
        <div className="min-w-0">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-balance [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.hero.subtitle}</p>
          <p className="mt-3 text-sm font-medium text-foreground/80">{t.hero.linuxNote}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#install">
              {t.hero.ctaJoin}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href={localePath(locale, "markets")} variant="secondary">
              {t.hero.ctaMarkets}
            </Button>
          </div>
        </div>
        <InstallCard locale={locale} />
      </div>
    </section>
  );
}
