#!/usr/bin/env node
/**
 * Hallmark · artifact: social card · theme: Playful Geometric (locked)
 * pre-emit critique: P4 H5 E5 S4 R4 V4
 * honest: pass (46) — regions, node coordinates and arcs are the baked live
 *   data, not decoration invented to look busy.
 * chrome: pass (47) · tokens: pass (48) — every colour resolves from tokens.css.
 *
 * Regenerates public/og.png — the 1536x1024 social card.
 *
 * The previous card was a bitmap with no source, so when the brand violet moved
 * from #8b5cf6 to #7c3aed it silently went stale. Everything visual here is READ
 * from the repo rather than typed in: colours from src/styles/tokens.css, the
 * profile mark from public/tokenswitch-logo.png, brand + tagline from src/lib/i18n.ts,
 * regions and node coordinates from src/data/baked/. Change a token, re-run
 * `pnpm og`, and the card follows.
 *
 * Rendering: an HTML page screenshotted by headless Chrome. Fonts are fetched
 * once and inlined as base64 so the render is deterministic and doesn't depend
 * on Chrome reaching fonts.gstatic.com at screenshot time.
 *
 * The card is authored at 1536x1024 — 2.56x the ~600px width social clients
 * actually display — so Playful Geometric's 2px border reads as 5px here. Every
 * "magic" size below is a design-system value times that scale.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import * as topojson from "topojson-client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1536;
const H = 1024;
/** Authored size ÷ displayed size. Multiply design-system px by this. */
const S = 2.56;
const CHROME = process.env.CHROME_BIN || "/usr/bin/google-chrome";

const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
const readJson = (p) => JSON.parse(read(p));

/* ---------- inputs ---------- */

/** Pull `--name: value` pairs out of the token sheet. */
function tokens() {
  const out = {};
  for (const [, name, value] of read("src/styles/tokens.css").matchAll(
    /--([\w-]+):\s*([^;]+);/g,
  )) {
    out[name] = value.trim();
  }
  return out;
}

/** First (English) occurrence in the dict — the card is one shared image. */
function copy() {
  const src = read("src/lib/i18n.ts");
  const pick = (key) => src.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1];
  const brand = pick("brand");
  const tagline = pick("tagline");
  if (!brand || !tagline) throw new Error("could not read brand/tagline from i18n.ts");
  return { brand, tagline };
}

/** Inline the local profile image so the screenshot has no network dependency. */
function logoDataUrl() {
  const png = readFileSync(path.join(ROOT, "public/tokenswitch-logo.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/* ---------- fonts ---------- */

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";

/** Fetch a Google Fonts stylesheet and inline every woff2 it points at. */
async function inlineFontCss(href) {
  const css = await (await fetch(href, { headers: { "User-Agent": UA } })).text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]))];
  const data = new Map(
    await Promise.all(
      urls.map(async (u) => {
        const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
        return [u, `data:font/woff2;base64,${buf.toString("base64")}`];
      }),
    ),
  );
  return css.replace(/url\((https:\/\/[^)]+\.woff2)\)/g, (m, u) => `url(${data.get(u) ?? u})`);
}

/* ---------- map ---------- */

/** Same projection the live map uses, bled slightly past the frame. */
function buildMap(palette) {
  const topology = readJson("node_modules/world-atlas/land-110m.json");
  const land = topojson.feature(topology, topology.objects.land);
  const projection = geoNaturalEarth1()
    .fitExtent(
      [
        [-70, -48],
        [W + 70, H + 48],
      ],
      land,
    )
    .precision(0.1);
  const d = geoPath(projection)(land);

  const points = readJson("src/data/baked/map-points.json");
  const at = ({ lon, lat }) => projection([lon, lat]);
  const servers = points.servers.map((s) => ({ ...s, xy: at(s) })).filter((s) => s.xy);
  const clients = points.clients.map((c) => ({ ...c, xy: at(c) })).filter((c) => c.xy);

  // Client -> its region's server, on the same quadratic curve as renderer.ts.
  const arcs = clients
    .map((c) => {
      const server = servers.find((s) => s.region === c.region);
      if (!server) return null;
      const [x1, y1] = c.xy;
      const [x2, y2] = server.xy;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 - dist * 0.3;
      return `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
    })
    .filter(Boolean);

  const dot = (xy, r, fill, opacity = 1) =>
    `<circle cx="${xy[0].toFixed(1)}" cy="${xy[1].toFixed(1)}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;

  return `<svg class="map" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path d="${d}" fill="${palette.land}" stroke="${palette.landEdge}" stroke-width="${1.2}"/>
      ${arcs.map((a) => `<path d="${a}" fill="none" stroke="${palette.client}" stroke-width="${2.5}" opacity="0.35"/>`).join("\n      ")}
      ${clients.map((c) => dot(c.xy, 9, palette.client)).join("\n      ")}
      ${servers.map((s) => dot(s.xy, 26, palette.server, 0.16)).join("\n      ")}
      ${servers.map((s) => dot(s.xy, 12, palette.server)).join("\n      ")}
    </svg>`;
}

/* ---------- page ---------- */

/** English display names, lifted from regionLabel()'s table in src/lib/regions.ts. */
function regionNames() {
  const src = read("src/lib/regions.ts");
  return readJson("src/data/baked/regions.json").regions.map((r) => {
    const label = src.match(new RegExp(`${r.name}:\\s*\\{\\s*en:\\s*"([^"]+)"`))?.[1];
    return label ?? r.name.charAt(0).toUpperCase() + r.name.slice(1);
  });
}

function buildHtml({ t, text, logo, map, fontCss }) {
  const meta = ["tokenswitch.org", ...regionNames()].join(" · ");

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
${fontCss}
:root{
  --background:${t.background}; --foreground:${t.foreground};
  --muted-foreground:${t["muted-foreground"]}; --accent:${t.accent};
  --secondary:${t.secondary}; --tertiary:${t.tertiary}; --quaternary:${t.quaternary};
  --border-strong:${t["border-strong"]};
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:var(--background);color:var(--foreground);
  font-family:"Plus Jakarta Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.card{position:relative;width:${W}px;height:${H}px;overflow:hidden;
  border:${5 * 1}px solid var(--border-strong)}
.map{position:absolute;inset:0}

/* Confetti — none of it lands on the Asia-Pacific node cluster or the text
 * block. The top shape bleeds off the corner; the rest sit inside y 110-914 so
 * a 1.91:1 centre crop (Twitter/Facebook) keeps them. Own-hue borders, no shadow. */
.confetti{position:absolute;border-width:${5}px;border-style:solid}
.c1{top:${-52}px;left:${-52}px;width:${196}px;height:${196}px;transform:rotate(12deg);
  border-color:var(--tertiary);background:color-mix(in srgb,var(--tertiary) 25%,transparent);
  border-radius:0 ${24 * 1.6}px ${24 * 1.6}px ${24 * 1.6}px}
.c2{top:${126}px;right:${92}px;width:${70}px;height:${70}px;transform:rotate(45deg);
  border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,transparent)}
.c3{bottom:${118}px;right:${132}px;width:${150}px;height:${150}px;border-radius:999px;
  border-color:var(--quaternary);background:color-mix(in srgb,var(--quaternary) 22%,transparent)}
.c4{bottom:${134}px;left:${150}px;width:${124}px;height:${124}px;transform:rotate(-18deg);
  border-color:var(--secondary);background:color-mix(in srgb,var(--secondary) 22%,transparent);
  border-radius:${16 * 1.6}px}

/* Everything below sits inside y 110-914 so a 1.91:1 centre crop loses nothing. */
.content{position:absolute;left:${104}px;top:${300}px;width:${1040}px}
.lockup{display:flex;align-items:center;gap:${32}px}
.mark{width:${108}px;height:${108}px;display:block;border-radius:999px;object-fit:cover}
.wordmark{font-family:"Outfit",system-ui,sans-serif;font-weight:800;font-size:${132}px;
  line-height:1;letter-spacing:-0.035em}
.tagline{margin-top:${36}px;font-size:${46}px;font-weight:500;line-height:1.25;
  color:var(--muted-foreground);letter-spacing:-0.01em}
.rule{margin-top:${52}px;width:${560}px;height:${5}px;background:var(--border-strong)}
.meta{margin-top:${26}px;font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:600;
  font-size:${24}px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted-foreground)}
</style></head>
<body><div class="card">
  ${map}
  <span class="confetti c1"></span>
  <span class="confetti c2"></span>
  <span class="confetti c3"></span>
  <span class="confetti c4"></span>
  <div class="content">
    <div class="lockup">
      <img class="mark" src="${logo}" alt="" aria-hidden="true">
      <p class="wordmark">${text.brand}</p>
    </div>
    <p class="tagline">${text.tagline}</p>
    <div class="rule"></div>
    <p class="meta">${meta}</p>
  </div>
</div></body></html>`;
}

/* ---------- run ---------- */

const t = tokens();
const palette = {
  land: t["map-land"],
  landEdge: t["map-land-edge"],
  server: t["map-server"],
  client: t["map-client"],
};

const fontCss = await inlineFontCss(
  "https://fonts.googleapis.com/css2?family=Outfit:wght@800&family=Plus+Jakarta+Sans:wght@500&family=JetBrains+Mono:wght@600&display=swap",
);

const html = buildHtml({
  t,
  text: copy(),
  logo: logoDataUrl(),
  map: buildMap(palette),
  fontCss,
});

const work = mkdtempSync(path.join(tmpdir(), "ts-og-"));
try {
  const page = path.join(work, "og.html");
  const shot = path.join(work, "og.png");
  writeFileSync(page, html);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${W},${H}`,
      "--virtual-time-budget=10000",
      `--user-data-dir=${path.join(work, "profile")}`,
      `--screenshot=${shot}`,
      `file://${page}`,
    ],
    { stdio: "ignore" },
  );
  const png = readFileSync(shot);
  writeFileSync(path.join(ROOT, "public/og.png"), png);
  console.log(`og.png written — ${W}x${H}, ${(png.length / 1024).toFixed(0)} KB`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
