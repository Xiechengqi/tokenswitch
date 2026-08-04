import { Check } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";

/* The security model is three parallel promises, but three equal cards is the
 * template shape. Rendered as rule-separated rows instead — denser, and the
 * items stay scannable at every width. */
export function TrustStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const groups = [t.securityPage.provider, t.securityPage.consumer, t.securityPage.platform];

  return (
    <section id="trust" className="bg-muted/30 pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.securityPage.title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.securityPage.subtitle}</p>

        <div className="mt-10 divide-y-2 divide-border-strong border-y-2 border-border-strong">
          {groups.map((group) => (
            <div key={group.title} className="py-7">
              <h3 className="font-heading text-xl font-bold">{group.title}</h3>
              <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
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
