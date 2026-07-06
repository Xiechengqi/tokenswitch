import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Card } from "./ui/Card";

export function TrustStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="border-b-2 border-border py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-bold">{t.trust.title}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.trust.items.map((item) => (
            <Card key={item.title}>
              <h3 className="font-heading text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href={localePath(locale, "security")} className="font-semibold text-accent hover:underline">
            {t.trust.cta} →
          </Link>
        </p>
      </div>
    </section>
  );
}
