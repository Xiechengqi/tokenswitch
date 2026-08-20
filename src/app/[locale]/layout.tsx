import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import { LOCALES, type Locale } from "@/lib/types";
import { HTML_LANG, SITE_ICONS } from "@/lib/seo";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  icons: SITE_ICONS,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/* One of two root layouts (the other is `app/(root)/layout.tsx`). It owns
 * `<html>` so that `lang` can follow the segment: a single shared root could
 * only hardcode one language, which is how `/zh/` and `/ja/` ended up declaring
 * `lang="en"` while their own hreflang said otherwise. */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!LOCALES.includes(raw as Locale)) {
    notFound();
  }
  const locale = raw as Locale;

  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
