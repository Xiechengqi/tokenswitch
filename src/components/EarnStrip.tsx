import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";

export function EarnStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t.earn.title}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.earn.subtitle}</p>

          {/* The path a payment actually takes. The platform is not a step in
           * this chain — it holds no funds and takes no cut, so the last link
           * is the provider, not a settlement queue. */}
          <div className="mt-8 rounded-2xl bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {t.earn.flow.map((step, i) => (
                <Fragment key={step}>
                  {i > 0 && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span
                    className={
                      i === t.earn.flow.length - 1
                        ? "rounded-full border-2 border-accent bg-accent/10 px-3 py-1.5 font-semibold text-accent"
                        : "rounded-full border-2 border-border px-3 py-1.5 font-semibold"
                    }
                  >
                    {step}
                  </span>
                </Fragment>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.earn.breakdown}</p>
          </div>

          <div className="mt-6">
            <Button href={`${localePath(locale)}#install`}>
              {t.earn.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
