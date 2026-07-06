import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import {
  CLIENT_REPO,
  DOCS_URL,
  GITHUB_REPO,
  MARKET_REPO,
  ROUTER_REPO,
  SHARE_MARKET_REPO,
} from "@/lib/constants";
import { getBakedRegions, regionLabel } from "@/lib/regions";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const { regions } = getBakedRegions();

  return (
    <footer className="border-t-2 border-border bg-muted/40">
      <div className="mx-auto grid max-w-[var(--container)] gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold">{t.brand}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>
          <p className="mt-4 text-sm text-muted-foreground">{t.footer.copyright}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">{t.footer.components}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={CLIENT_REPO} target="_blank" rel="noopener noreferrer">
                cc-switch (client)
              </a>
            </li>
            <li>
              <a href={ROUTER_REPO} target="_blank" rel="noopener noreferrer">
                cc-switch-router
              </a>
            </li>
            <li>
              <a href={MARKET_REPO} target="_blank" rel="noopener noreferrer">
                cc-switch-market
              </a>
            </li>
            <li>
              <a href={SHARE_MARKET_REPO} target="_blank" rel="noopener noreferrer">
                cc-switch-share-market
              </a>
            </li>
            <li>
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                tokenswitch.org
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">{t.footer.regions}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {regions.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  {regionLabel(r.name, locale)}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href={localePath(locale, "security")} className="text-muted-foreground hover:text-foreground">
              {t.footer.legal}
            </Link>
            <span className="mx-2 text-muted-foreground">·</span>
            <a href={DOCS_URL} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">
              {t.nav.docs}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
