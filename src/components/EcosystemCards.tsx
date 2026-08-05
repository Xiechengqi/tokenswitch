import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Card } from "./ui/Card";

/* Four ecosystem components, deliberately NOT four equal columns: the client
 * and the share market carry the wide tiles, router and token market the
 * narrow ones. Only the Client tile keeps a primary CTA voice — other tiles
 * are quiet navigation into secondary paths. */
export function EcosystemCards({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const cards = [
    {
      ...t.ecosystem.client,
      href: `${localePath(locale)}#install`,
      tone: "border-accent bg-accent/10",
      chip: "bg-accent/25 border-accent",
      span: "lg:col-span-3",
      primary: true,
    },
    {
      ...t.ecosystem.router,
      href: localePath(locale, "network"),
      tone: "border-secondary bg-secondary/10",
      chip: "bg-secondary/25 border-secondary",
      span: "lg:col-span-2",
      primary: false,
    },
    {
      ...t.ecosystem.tokenMarket,
      href: localePath(locale, "markets"),
      tone: "border-tertiary bg-tertiary/15",
      chip: "bg-tertiary/30 border-tertiary",
      span: "lg:col-span-2",
      primary: false,
    },
    {
      ...t.ecosystem.shareMarket,
      href: localePath(locale, "markets"),
      tone: "border-quaternary bg-quaternary/10",
      chip: "bg-quaternary/25 border-quaternary",
      span: "lg:col-span-3",
      primary: false,
    },
  ];

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.ecosystem.title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.ecosystem.subtitle}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group block ${card.span} rounded-2xl`}
            >
              <Card hover className={`relative h-full overflow-hidden border-2 ${card.tone}`}>
                <span
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full border-2 ${card.chip}`}
                  aria-hidden
                />
                <h3 className="relative font-heading text-xl font-bold">{card.title}</h3>
                <p className="relative mt-2 max-w-md text-sm text-muted-foreground">{card.desc}</p>
                {card.primary ? (
                  <p className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {card.cta}
                    <ArrowRight
                      className="h-4 w-4 text-accent transition-transform duration-[var(--dur-fast)] ease-out group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </p>
                ) : (
                  <p className="relative mt-4 text-sm text-muted-foreground group-hover:text-foreground">
                    {card.cta}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
