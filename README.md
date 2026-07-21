# TokenSwitch Website

Static marketing site for the [TokenSwitch](https://tokenswitch.org) network — built with **Next.js 15** (static export), TypeScript, and Tailwind CSS v4.

## Stack

- **Framework**: Next.js 15 (`output: "export"`) → GitHub Pages
- **Locales**: English (`/en/`), Chinese (`/zh/`), Japanese (`/ja/`)
- **Data**: Build-time baked snapshots + browser live refresh from public router/market APIs

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm bake         # refresh src/data/baked/*.json only
pnpm build        # bake + static export → out/
pnpm typecheck
```

## Data baking

`scripts/bake-data.mjs` fetches from live regions at build time (and daily via GitHub Actions cron):

| File | Source |
|------|--------|
| `regions.json` | Router repo `regions` file (local checkout or GitHub raw) |
| `map-points.json` | Router `/v1/public/map-points` |
| `network-stats.json` | Router `/v1/public/network-stats` + market KPIs + share-market listings |
| `release.json` | GitHub releases API (`cc-switch-server`) |

Failed fetches keep the previous baked file.

## Live refresh (browser)

At runtime, client components poll public endpoints every 60s (paused when tab is hidden):

- Region membership → GitHub raw `cc-switch-router` `regions` file (shared by install card, map, and stats)
- Map points & region health → router `/v1/public/map-points`, `/v1/healthz`
- Network stats → router `/v1/public/network-stats`, market `/v1/public/dashboard/kpis`, share-market `/v1/listings`

Map `clients[]` are country-centroid aggregates from the router; `clientCount` is the true active installation count.

Requires CORS on router public routes (deployed in `cc-switch-router`).

## Deployment (GitHub Pages + Cloudflare)

### GitHub

1. Repository **Settings → Pages → Source**: **Deploy from a branch**
2. Branch: `gh-pages` / `/ (root)`
3. Push to `main` — workflow `.github/workflows/deploy.yml` builds `out/` and pushes to `gh-pages` with `CNAME=tokenswitch.org`
4. Enable **Enforce HTTPS** after the first deploy

### Cloudflare DNS

```
类型    名称    内容                      代理
CNAME   @       <user>.github.io          开启（橙云）
```

- SSL/TLS: **Full (strict)** (or per GitHub Pages docs)
- Optional: cache `_next/static/*` with long TTL; HTML short TTL

### Post-cutover checklist

- [ ] Verify `https://tokenswitch.org/en/`, `/zh/`, `/ja/` and all subpages
- [ ] Verify `/sitemap.xml`, `/robots.txt`, OG image
- [ ] Verify live stats strip after router CORS deploy (japan + singapore)
- [ ] Confirm old VPS verification service has zero traffic for ≥ 1 week
- [ ] Stop old VPS Rust process + systemd
- [ ] Revoke Resend API key used only for legacy verification
- [ ] Optional: clear `verification_service_base_url` in router config

## Project layout

```
src/
  app/[locale]/     # Static pages per locale
  components/       # UI + page sections
  data/baked/       # Build-time JSON snapshots
  hooks/            # Client data polling
  lib/              # i18n, regions, map-points, network-stats, seo
scripts/bake-data.mjs
public/CNAME        # tokenswitch.org
```

## Related repos

| Component | Repository |
|-----------|------------|
| Client (`cc-switch-server`) | [xiechengqi/cc-switch-server](https://github.com/xiechengqi/cc-switch-server) |
| Router | [xiechengqi/cc-switch-router](https://github.com/xiechengqi/cc-switch-router) |
| Token Market | [xiechengqi/cc-switch-market](https://github.com/xiechengqi/cc-switch-market) |
| Share Market | [xiechengqi/cc-switch-share-market](https://github.com/xiechengqi/cc-switch-share-market) |
| Docs | [tokenswitch-docsify](https://github.com/Xiechengqi/tokenswitch-docsify) → docs.tokenswitch.org |

## License

See repository license file.
