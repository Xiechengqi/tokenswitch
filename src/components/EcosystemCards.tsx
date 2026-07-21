import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Card } from "./ui/Card";

export function EcosystemCards({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const cards = [
    { ...t.ecosystem.client, href: `${localePath(locale)}#install`, color: "bg-accent/15 border-accent" },
    { ...t.ecosystem.router, href: localePath(locale, "network"), color: "bg-secondary/15 border-secondary" },
    { ...t.ecosystem.tokenMarket, href: localePath(locale, "markets"), color: "bg-tertiary/20 border-tertiary" },
    { ...t.ecosystem.shareMarket, href: localePath(locale, "markets"), color: "bg-quaternary/15 border-quaternary" },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t.ecosystem.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.ecosystem.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card hover className={`h-full border-2 ${card.color}`}>
                <h3 className="font-heading text-xl font-bold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
                <p className="mt-4 text-sm font-semibold text-accent">{card.cta} →</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
