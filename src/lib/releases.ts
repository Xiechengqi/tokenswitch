import releaseData from "@/data/baked/release.json";
import type { BakedRelease } from "./types";

const RELEASES_API =
  "https://api.github.com/repos/xiechengqi/cc-switch-server/releases/latest";

export function getBakedRelease(): BakedRelease {
  return releaseData as BakedRelease;
}

export async function fetchLatestRelease(): Promise<BakedRelease | null> {
  try {
    const res = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const release = await res.json();
    return {
      bakedAt: new Date().toISOString(),
      tagName: release.tag_name,
      name: release.name,
      publishedAt: release.published_at,
      repo: "xiechengqi/cc-switch-server",
      assets: (release.assets ?? []).map(
        (a: {
          name: string;
          browser_download_url: string;
          size: number;
          content_type: string;
        }) => ({
          name: a.name,
          downloadUrl: a.browser_download_url,
          size: a.size,
          contentType: a.content_type,
        }),
      ),
    };
  } catch {
    return null;
  }
}

export type ServerArch = "linux-amd64" | "linux-arm64" | "unknown";

export function detectServerArch(): ServerArch {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform ?? "").toLowerCase();
  if (ua.includes("aarch64") || ua.includes("arm64") || platform.includes("arm")) {
    return "linux-arm64";
  }
  if (ua.includes("linux") || platform.includes("linux") || ua.includes("x86_64") || ua.includes("amd64")) {
    return "linux-amd64";
  }
  return "unknown";
}

export function pickServerAsset(
  assets: BakedRelease["assets"],
  arch: ServerArch,
): BakedRelease["assets"][number] | null {
  const patterns: Record<Exclude<ServerArch, "unknown">, RegExp[]> = {
    "linux-amd64": [/linux-amd64/i, /x86_64/i, /amd64/i],
    "linux-arm64": [/linux-arm64/i, /aarch64/i, /arm64/i],
  };
  if (arch === "unknown") {
    return (
      assets.find((a) => /linux-amd64/i.test(a.name)) ??
      assets.find((a) => /linux/i.test(a.name)) ??
      assets[0] ??
      null
    );
  }
  for (const pattern of patterns[arch]) {
    const hit = assets.find((a) => pattern.test(a.name));
    if (hit) return hit;
  }
  return assets[0] ?? null;
}

/** Prefer binary assets; skip checksum sidecar files in the primary button. */
export function listBinaryAssets(assets: BakedRelease["assets"]): BakedRelease["assets"] {
  return assets.filter(
    (a) =>
      /cc-switch-server-linux-(amd64|arm64)/i.test(a.name) && !/\.sha256$/i.test(a.name),
  );
}
