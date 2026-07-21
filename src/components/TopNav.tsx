"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";
import { LOCALES } from "@/lib/types";
import { getDict, localePath, switchLocalePath } from "@/lib/i18n";
import { DOCS_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";
import { SocialIconLinks } from "./SocialLinks";

export function TopNav({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const pathname = usePathname();

  const links = [
    { href: localePath(locale, "network"), label: t.nav.network },
    { href: localePath(locale, "markets"), label: t.nav.markets },
    { href: localePath(locale, "earn"), label: t.nav.earn },
    { href: DOCS_URL, label: t.nav.docs, external: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--container)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={localePath(locale)} className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="text-accent" aria-hidden>
            ◆
          </span>
          {t.brand}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex rounded-full bg-muted/50 p-0.5 text-xs font-medium">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={switchLocalePath(locale, l, pathname)}
                onClick={() => localStorage.setItem("tokenswitch-locale", l)}
                className={cn(
                  "rounded-full px-2.5 py-1.5 uppercase transition-colors",
                  l === locale
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.lang[l]}
              </Link>
            ))}
          </div>
          <SocialIconLinks
            labels={{ telegram: t.nav.telegram, x: t.nav.x, github: t.nav.github }}
            className="hidden sm:flex"
          />
          <Button href={localePath(locale, "earn")} className="hidden sm:inline-flex">
            {t.nav.getStarted}
          </Button>
        </div>
      </div>
    </header>
  );
}
