"use client";

import { useEffect } from "react";

export default function RoutersRedirect() {
  useEffect(() => {
    const stored = localStorage.getItem("tokenswitch-locale");
    const locale = stored === "zh" ? "zh" : "en";
    window.location.replace(`/${locale}/network/`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Redirecting…
    </div>
  );
}
