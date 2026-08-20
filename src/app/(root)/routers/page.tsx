import type { Metadata } from "next";

const TARGET = "/en/network/";

/* Legacy URL from the pre-locale site. It stays resolvable for whatever still
 * links to it, but it is a redirect and nothing else: `noindex` keeps the stub
 * out of the index, `follow` lets the link equity reach the real page, and the
 * meta refresh works without JavaScript — which the previous `useEffect`
 * version did not. No canonical: Google ignores one on a noindexed page. */
export const metadata: Metadata = {
  title: "TokenSwitch",
  robots: { index: false, follow: true },
};

export default function RoutersRedirect() {
  return (
    <>
      {/* `metadata.other` would render `<meta name="refresh">`, which is inert —
       * only the http-equiv form redirects. */}
      <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
        <p>This page moved.</p>
        <a href={TARGET} className="font-semibold text-accent hover:underline">
          Continue to the network page
        </a>
      </div>
    </>
  );
}
