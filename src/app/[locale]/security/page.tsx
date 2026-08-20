import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { LOCALES } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/* The trust content is not here — it is the `#trust` section of the home page
 * (`TrustStrip` renders `t.securityPage` verbatim). Promoting this stub into a
 * real page would republish those same three lists at a second URL, which is a
 * duplicate, not a second entry point. So it stays a redirect: `noindex` so the
 * copy has exactly one indexable home, `follow` so the links still count, and a
 * meta refresh so it works with JavaScript off. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: `${t.securityPage.title} — ${t.brand}`,
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const target = `${localePath(locale)}#trust`;

  return (
    <>
      {/* `metadata.other` would render `<meta name="refresh">`, which is inert —
       * only the http-equiv form redirects. */}
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
        <p>{t.securityPage.subtitle}</p>
        <a href={target} className="font-semibold text-accent hover:underline">
          {t.securityPage.title}
        </a>
      </div>
    </>
  );
}
