"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/types";

export default function SecurityRedirect() {
  const params = useParams();
  const raw = params.locale;
  const locale: Locale =
    typeof raw === "string" && LOCALES.includes(raw as Locale)
      ? (raw as Locale)
      : DEFAULT_LOCALE;

  useEffect(() => {
    window.location.replace(`/${locale}/#trust`);
  }, [locale]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting…
    </div>
  );
}
