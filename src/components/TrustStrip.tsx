import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { Card } from "./ui/Card";

export function TrustStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const columns = [t.securityPage.provider, t.securityPage.consumer, t.securityPage.platform];

  return (
    <section id="trust" className="border-b-2 border-border py-16 sm:py-20">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.securityPage.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.securityPage.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <Card key={col.title}>
              <h3 className="font-heading text-xl font-bold">{col.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-accent" aria-hidden>
                      ◆
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
