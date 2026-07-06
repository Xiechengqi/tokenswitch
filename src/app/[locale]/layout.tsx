import { redirect } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/types";
import { getDict } from "@/lib/i18n";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!LOCALES.includes(raw as Locale)) {
    redirect("/en/");
  }
  const locale = raw as Locale;
  const t = getDict(locale);

  return (
    <div className="flex min-h-screen flex-col" data-locale={locale}>
      <a
        href="#main-content"
        className="sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-border-strong focus:[clip:auto]"
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
