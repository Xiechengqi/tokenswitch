import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";

export function FaqPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.faqPage.title}</h1>
        <div className="mt-10 space-y-4">
          {t.faqPage.items.map((item) => (
            <Card key={item.q}>
              <h2 className="font-heading text-lg font-bold">{item.q}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
