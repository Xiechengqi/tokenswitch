import type { Metadata } from "next";
import "@/styles/globals.css";
import { SITE_ICONS } from "@/lib/seo";

/* Root layout for the bare domain. `app/[locale]/layout.tsx` is the second root
 * layout — there is no shared `app/layout.tsx`, because a shared one could only
 * hardcode a single `<html lang>` and the site is trilingual. */
export const metadata: Metadata = {
  icons: SITE_ICONS,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
