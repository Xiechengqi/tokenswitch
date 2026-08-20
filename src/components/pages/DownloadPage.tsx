"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDict, localePath } from "@/lib/i18n";
import { CLIENT_REPO } from "@/lib/constants";
import {
  detectServerArch,
  fetchLatestRelease,
  getBakedRelease,
  listBinaryAssets,
  pickServerAsset,
} from "@/lib/releases";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Explainer } from "@/components/Explainer";
import Link from "next/link";

export function DownloadPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [release, setRelease] = useState(getBakedRelease());
  const [arch, setArch] = useState<ReturnType<typeof detectServerArch>>("unknown");

  useEffect(() => {
    setArch(detectServerArch());
  }, []);

  useEffect(() => {
    void fetchLatestRelease().then((live) => {
      if (live) setRelease(live);
    });
  }, []);

  const binaries = listBinaryAssets(release.assets);
  const preferred = pickServerAsset(binaries.length ? binaries : release.assets, arch);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold">{t.download.h1}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.download.subtitle}</p>

        <Card className="mt-8 border-accent/40 bg-accent/5">
          <h2 className="font-heading text-2xl font-bold">{t.download.scriptTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t.download.scriptDesc}</p>
          <div className="mt-5">
            <Button href={localePath(locale) + "#install"}>
              {t.download.goInstall}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="font-heading text-xl font-bold">{t.download.binaryTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.download.binaryDesc}</p>
          <p className="mt-4 text-sm">
            {t.download.version}: <b className="font-mono">{release.tagName}</b>
          </p>
          {/* Asset filenames run ~28 mono chars — too long to sit inside a pill
           * without wrapping the label at 320px. The button label stays short;
           * the filename goes underneath where it is allowed to break. */}
          {preferred && (
            <div className="mt-4">
              <Button href={preferred.downloadUrl} external>
                {t.download.downloadBtn}
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
              <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                {preferred.name}
              </p>
            </div>
          )}
          {binaries.filter((a) => a.name !== preferred?.name).length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {binaries
                .filter((a) => a.name !== preferred?.name)
                .map((asset) => (
                  <li key={asset.name}>
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 break-all font-mono text-xs text-muted-foreground underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-out hover:text-foreground hover:underline"
                    >
                      <ArrowDown className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      {asset.name}
                    </a>
                  </li>
                ))}
            </ul>
          )}
          {!preferred && binaries.length === 0 && (
            <div className="mt-4">
              <Button href={`${CLIENT_REPO}/releases`} external>
                {t.download.allReleases}
              </Button>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            <a
              href={`${CLIENT_REPO}/releases`}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.download.allReleases}
            </a>
          </p>
        </Card>

        <Explainer title={t.download.explainer.title} items={t.download.explainer.items} />

        <div className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{t.download.afterDownload}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {t.download.paths.map((path) => (
              <Card key={path.title}>
                <h3 className="font-heading text-lg font-bold">{path.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{path.desc}</p>
                {"href" in path && path.href && (
                  <Link
                    href={localePath(locale, path.href)}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    {path.title}
                    <ArrowRight className="h-4 w-4" aria-hidden />
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
