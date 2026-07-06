"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/types";

const STORAGE_KEY = "tokenswitch-locale";

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("ja")) return "ja";
  return DEFAULT_LOCALE;
}

export default function RootPage() {
  useEffect(() => {
    const locale = detectLocale();
    window.location.replace(`/${locale}/`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
