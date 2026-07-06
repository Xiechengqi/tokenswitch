import releaseData from "@/data/baked/release.json";
import type { BakedRelease } from "./types";

const RELEASES_API =
  "https://api.github.com/repos/xiechengqi/cc-switch/releases/latest";

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
      repo: "xiechengqi/cc-switch",
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

export function detectPlatform(): "macos-arm" | "macos-x64" | "windows" | "linux" | "unknown" {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform ?? "").toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac") || platform.includes("mac")) {
    return ua.includes("arm") || platform.includes("arm") ? "macos-arm" : "macos-x64";
  }
  if (ua.includes("linux") || platform.includes("linux")) return "linux";
  return "unknown";
}

export function pickAssetForPlatform(
  assets: BakedRelease["assets"],
  platform: ReturnType<typeof detectPlatform>,
): BakedRelease["assets"][number] | null {
  const patterns: Record<string, RegExp[]> = {
    "macos-arm": [/aarch64.*\.dmg$/i, /arm64.*\.dmg$/i, /aarch64/i],
    "macos-x64": [/x64.*\.dmg$/i, /x86_64.*\.dmg$/i, /\.dmg$/i],
    windows: [/\.msi$/i, /\.exe$/i],
    linux: [/\.AppImage$/i, /\.deb$/i, /linux/i],
  };
  if (platform === "unknown") return assets[0] ?? null;
  for (const pattern of patterns[platform] ?? []) {
    const hit = assets.find((a) => pattern.test(a.name));
    if (hit) return hit;
  }
  return assets[0] ?? null;
}
