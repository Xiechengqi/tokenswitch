/** Canvas cannot consume CSS custom properties directly, so the map palette is
 * read once from the document and cached. Tokens live in src/styles/tokens.css
 * alongside every other colour; the fallbacks below exist only for the server
 * render pass, where there is no document to read from. */

export interface MapPalette {
  land: string;
  landEdge: string;
  server: string;
  serverRing: string;
  client: string;
}

const FALLBACK: MapPalette = {
  land: "#e8e8ed",
  landEdge: "#d2d2d7",
  server: "#2563eb",
  serverRing: "#1d4ed8",
  client: "#22c55e",
};

let cached: MapPalette | null = null;

export function mapPalette(): MapPalette {
  if (cached) return cached;
  if (typeof document === "undefined") return FALLBACK;

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  cached = {
    land: read("--map-land", FALLBACK.land),
    landEdge: read("--map-land-edge", FALLBACK.landEdge),
    server: read("--map-server", FALLBACK.server),
    serverRing: read("--map-server-ring", FALLBACK.serverRing),
    client: read("--map-client", FALLBACK.client),
  };
  return cached;
}

/** `#rrggbb` (or `#rgb`) → `rgba(r, g, b, a)`. Canvas has no opacity channel on
 * fillStyle, and globalAlpha is already spoken for by the enter/exit fades. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (full.length !== 6) return color;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return color;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
