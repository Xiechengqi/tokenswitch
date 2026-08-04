import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import {
  CLIENT_REPO,
  DOCS_URL,
  GITHUB_REPO,
  MARKET_REPO,
  ROUTER_REPO,
} from "@/lib/constants";
import { getBakedRegions, regionLabel } from "@/lib/regions";
import { SocialTextLinks } from "@/components/SocialLinks";
import { BrandMark } from "@/components/BrandMark";

/* Ft4 dense colophon — the ecosystem is four repos and a handful of regions,
 * which is a colophon's worth of metadata, not a four-column sitemap. Runs wrap
 * inline instead of stacking into columns nobody reads. */
export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const { regions } = getBakedRegions();

  const components = [
    { label: t.footer.clientRepo, href: CLIENT_REPO },
    { label: "cc-switch-router", href: ROUTER_REPO },
    { label: "cc-switch-market", href: MARKET_REPO },
    { label: "tokenswitch.org", href: GITHUB_REPO },
  ];

  return (
    <footer className="border-t-2 border-border-strong bg-muted/40">
      <div className="mx-auto max-w-[var(--container)] px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2.5 font-heading text-2xl font-extrabold">
              <BrandMark className="h-8 w-8" />
              {t.brand}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{t.tagline}</p>
          </div>
          <span
            className="hidden h-10 w-10 rotate-12 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl border-2 border-tertiary bg-tertiary/25 sm:block"
            aria-hidden
          />
        </div>

        <div className="mt-10 space-y-6 border-t-2 border-border-strong pt-8">
          <Run label={t.footer.components}>
            {components.map((c) => (
              <ColophonLink key={c.href} href={c.href} external>
                {c.label}
              </ColophonLink>
            ))}
          </Run>

          <Run label={t.footer.regions}>
            {regions.map((r) => (
              <ColophonLink key={r.name} href={r.url} external>
                {regionLabel(r.name, locale)}
              </ColophonLink>
            ))}
          </Run>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-6 text-sm">
          <p className="text-muted-foreground">{t.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ColophonLink href={`${localePath(locale)}#trust`}>{t.footer.security}</ColophonLink>
            <ColophonLink href={localePath(locale, "faq")} internal>
              {t.footer.faq}
            </ColophonLink>
            <ColophonLink href={DOCS_URL} external>
              {t.nav.docs}
            </ColophonLink>
            <SocialTextLinks labels={{ telegram: t.footer.telegram, x: t.footer.x }} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function Run({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">{children}</p>
    </div>
  );
}

function ColophonLink({
  href,
  external,
  internal,
  children,
}: {
  href: string;
  external?: boolean;
  internal?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "whitespace-nowrap text-muted-foreground underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-out hover:text-foreground hover:underline";

  if (internal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
