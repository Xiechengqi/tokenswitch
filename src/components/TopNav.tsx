"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/types";
import { LOCALES } from "@/lib/types";
import { getDict, localePath, switchLocalePath } from "@/lib/i18n";
import { DOCS_URL } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";
import { SocialIconLinks } from "./SocialLinks";
import { BrandMark } from "./BrandMark";

export function TopNav({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The sheet is a navigation surface, so it closes the moment navigation
  // happens — and on Escape, like every other dismissible layer.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: localePath(locale, "network"), label: t.nav.network },
    { href: localePath(locale, "markets"), label: t.nav.markets },
    { href: localePath(locale, "earn"), label: t.nav.earn },
    { href: DOCS_URL, label: t.nav.docs, external: true },
  ];

  const linkClass =
    "whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-out hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border-strong bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--container)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={localePath(locale)}
          className="flex items-center gap-2.5 whitespace-nowrap font-heading text-lg font-bold"
        >
          <BrandMark />
          {t.brand}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Below sm the bar is brand + menu only — three locale pills plus a
           * menu button overflow a 320px viewport, and "日本語" wraps to two
           * lines when squeezed. The switcher lives in the sheet instead. */}
          <LocaleSwitcher locale={locale} pathname={pathname} labels={t.lang} className="hidden sm:inline-flex" />
          <SocialIconLinks
            labels={{ telegram: t.nav.telegram, x: t.nav.x, github: t.nav.github }}
            className="hidden lg:flex"
          />
          <Button href={localePath(locale, "earn")} className="hidden md:inline-flex">
            {t.nav.getStarted}
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.a11y.closeMenu : t.a11y.menu}
            className="inline-flex items-center justify-center rounded-full border-2 border-border-strong bg-card p-2 text-foreground transition-[transform,background-color] duration-[var(--dur-fast)] ease-out hover:scale-[1.02] hover:bg-muted active:scale-100 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet — below 768px this is the site's only route to /network,
       * /markets, /earn and the docs. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t-2 border-border-strong bg-background md:hidden"
      >
        <nav className="mx-auto flex max-w-[var(--container)] flex-col px-4 py-2 sm:px-6">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="border-b border-border py-3 text-base font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-border py-3 text-base font-medium"
              >
                {link.label}
              </Link>
            ),
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <Button href={localePath(locale, "earn")}>{t.nav.getStarted}</Button>
            <SocialIconLinks
              labels={{ telegram: t.nav.telegram, x: t.nav.x, github: t.nav.github }}
            />
          </div>
          <div className="border-t border-border py-4 sm:hidden">
            <LocaleSwitcher locale={locale} pathname={pathname} labels={t.lang} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function LocaleSwitcher({
  locale,
  pathname,
  labels,
  className,
}: {
  locale: Locale;
  pathname: string;
  labels: Record<Locale, string>;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-full border-2 border-border p-0.5 text-xs font-medium", className)}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(locale, l, pathname)}
          onClick={() => localStorage.setItem("tokenswitch-locale", l)}
          className={cn(
            "whitespace-nowrap rounded-full px-2.5 py-1 uppercase transition-colors duration-[var(--dur-fast)] ease-out",
            // Ink-on-paper for the selected chip: white on violet is only
            // 4.23:1, which fails AA at this size.
            l === locale
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {labels[l]}
        </Link>
      ))}
    </div>
  );
}
