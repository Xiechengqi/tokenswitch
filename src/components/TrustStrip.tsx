import { Check } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";

/* Provider promise leads; consumer + platform sit denser underneath — not three
 * equal checklist columns (template tell). */
export function TrustStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const { provider, consumer, platform } = t.securityPage;

  return (
    <section id="trust" className="pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.securityPage.title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.securityPage.subtitle}</p>

        <div className="mt-10 rounded-2xl bg-card p-6 sm:p-8">
          <h3 className="font-heading text-2xl font-bold">{provider.title}</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
            {provider.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
          {[consumer, platform].map((group) => (
            <div key={group.title}>
              <h3 className="font-heading text-lg font-bold">{group.title}</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
