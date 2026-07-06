"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import {
  CLIENT_REPO,
  DOCKER_COMMAND,
  UPSTREAM_CC_SWITCH,
} from "@/lib/constants";
import {
  detectPlatform,
  fetchLatestRelease,
  getBakedRelease,
  pickAssetForPlatform,
} from "@/lib/releases";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

type Tab = "desktop" | "docker" | "web";

export function DownloadPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [tab, setTab] = useState<Tab>("desktop");
  const [release, setRelease] = useState(getBakedRelease());
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>("unknown");

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setTab(p === "unknown" ? "docker" : "desktop");
  }, []);

  useEffect(() => {
    void fetchLatestRelease().then((live) => {
      if (live) setRelease(live);
    });
  }, []);

  const asset = pickAssetForPlatform(release.assets, platform);

  const tabs: { id: Tab; label: string }[] = [
    { id: "desktop", label: t.download.tabs.desktop },
    { id: "docker", label: t.download.tabs.docker },
    { id: "web", label: t.download.tabs.web },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.download.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.download.subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "rounded-full border-2 border-border-strong bg-accent px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <Card className="mt-6">
          {tab === "desktop" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{t.download.desktopDesc}</p>
              <p className="text-sm">
                {t.download.version}: <b className="font-mono">{release.tagName}</b>
              </p>
              {asset ? (
                <Button href={asset.downloadUrl} external>
                  {t.download.downloadBtn} ({asset.name})
                </Button>
              ) : (
                <Button href={CLIENT_REPO} external>
                  {t.download.allReleases}
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                <a href={UPSTREAM_CC_SWITCH} className="underline" target="_blank" rel="noopener noreferrer">
                  ccswitch.io
                </a>{" "}
                ·{" "}
                <a href={CLIENT_REPO} className="underline" target="_blank" rel="noopener noreferrer">
                  {t.download.allReleases}
                </a>
              </p>
            </div>
          )}
          {tab === "docker" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{t.download.dockerDesc}</p>
              <pre className="overflow-x-auto rounded-xl bg-terminal p-4 font-mono text-xs text-white">
                {DOCKER_COMMAND}
              </pre>
            </div>
          )}
          {tab === "web" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{t.download.webDesc}</p>
              <p className="text-sm text-muted-foreground">{t.download.webLoginHint}</p>
              <Button href="http://localhost:8008" external variant="secondary">
                http://localhost:8008
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.download.afterDownload}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {t.download.paths.map((path) => (
              <Card key={path.title}>
                <h3 className="font-heading text-lg font-bold">{path.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{path.desc}</p>
                {"href" in path && path.href && (
                  <Link href={localePath(locale, path.href)} className="mt-4 inline-block text-sm font-semibold text-accent">
                    →
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
