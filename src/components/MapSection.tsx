import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { WorldMapLazy } from "./WorldMapLazy";
import { Button } from "./ui/Button";

export function MapSection({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold">{t.map.title}</h2>
            <p className="mt-2 text-muted-foreground">{t.map.subtitle}</p>
          </div>
          <Button href={localePath(locale, "network")} variant="secondary">
            {t.nav.network} →
          </Button>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl bg-card shadow-sm">
          <WorldMapLazy locale={locale} className="relative h-[360px] w-full sm:h-[480px]" />
        </div>
      </div>
    </section>
  );
}
