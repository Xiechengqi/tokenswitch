import type { Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

/* Shared by both root layouts. The English home lives at the bare domain and
 * every other page under `/[locale]/`, which means two `<html>` roots — but one
 * chrome, so the nav and colophon cannot drift apart between them. */
export function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = getDict(locale);

  return (
    <div className="flex min-h-screen flex-col" data-locale={locale}>
      <a
        href="#main-content"
        className="sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:rounded-full focus:border-2 focus:border-border-strong focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:[clip:auto]"
      >
        {t.a11y.skipToContent}
      </a>
      <TopNav locale={locale} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
