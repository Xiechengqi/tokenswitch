import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { Button } from "./ui/Button";

export function EarnStrip({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <div className="rounded-3xl border-2 border-border-strong bg-card p-8 sm:p-10">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t.earn.title}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t.earn.subtitle}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-sm">
            <FlowPill label="$1.00" />
            <span>→</span>
            <FlowPill label="Provider $0.85" accent />
            <FlowPill label="Market $0.10" />
            <FlowPill label="Router $0.05" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t.earn.breakdown}</p>
          <div className="mt-6">
            <Button href={`${localePath(locale)}#install`}>{t.earn.cta} →</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowPill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className={
        accent
          ? "rounded-full border-2 border-accent bg-accent/10 px-3 py-1.5 font-semibold"
          : "rounded-full bg-muted/60 px-3 py-1.5"
      }
    >
      {label}
    </span>
  );
}
