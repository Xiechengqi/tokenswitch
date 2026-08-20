"use client";

import { useEffect } from "react";

/* Honours a locale the visitor picked themselves, and nothing else.
 *
 * The previous version of `/` sniffed `navigator.language` and bounced every
 * visitor, which made the canonical home a JS redirect with four words of body
 * copy — the one URL every inbound link points at, carrying no content. Language
 * targeting is hreflang's job and switching is the switcher's job; this only
 * replays an explicit earlier choice. */
export function StoredLocaleRedirect() {
  useEffect(() => {
    const stored = localStorage.getItem("tokenswitch-locale");
    if (stored === "zh" || stored === "ja") {
      window.location.replace(`/${stored}/`);
    }
  }, []);

  return null;
}
