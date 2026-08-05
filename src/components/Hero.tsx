import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";
import { InstallCard } from "./InstallCard";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="relative overflow-hidden">
      {/* One decorative anchor only — a second shape competed with the install card. */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-secondary/40 bg-secondary/15 sm:-right-16 sm:-top-16 sm:h-64 sm:w-64"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-[var(--container)] gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-20">
        <div className="min-w-0">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-balance [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.hero.subtitle}</p>
          <p className="mt-3 text-sm font-medium text-foreground/80">{t.hero.linuxNote}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="#install">
              {t.hero.ctaJoin}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Link
              href={localePath(locale, "markets")}
              className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-out hover:text-foreground hover:underline"
            >
              {t.hero.ctaMarkets}
            </Link>
          </div>
        </div>
        <InstallCard locale={locale} />
      </div>
    </section>
  );
}
