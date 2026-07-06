import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";

export function SecurityPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const columns = [t.securityPage.provider, t.securityPage.consumer, t.securityPage.platform];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.securityPage.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.securityPage.subtitle}</p>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <Card key={col.title}>
              <h2 className="font-heading text-xl font-bold">{col.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-accent">◆</span>
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
