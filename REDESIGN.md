# TokenSwitch 官网重构规划（v2 — GitHub Pages 纯静态架构）

> 基于对 client（cc-switch）、router（cc-switch-router）、tokenmarket（cc-switch-market）、sharemarket（cc-switch-share-market）四个项目源码的完整调研。
> v2 变更：邮箱验证码服务已退役，官网不再承担任何后端职责，整体迁移到 **GitHub Pages 纯静态托管**，Rust 服务全部下线。

---

## 0. 一句话结论

官网从「Rust 二进制 + 内嵌 SPA + VPS 部署」彻底重构为「**Next.js 静态导出 + GitHub Actions 自动部署到 GitHub Pages**」的零运维架构；原后端的两个职责一个退役（邮箱验证）、一个下放（map-points 聚合改为浏览器端直连各 region router 聚合）。同时把官网从「单一工具落地页」升级为**生态门户 + 网络实时状态 + 信任中心**，与 market / share-market 统一视觉语言，打通「官网 → 下载 / 进入市场」的转化漏斗。

---

## 1. 系统全景（调研结论）

### 1.1 四个组件与官网的关系

```text
                        ┌────────────────────────────────┐
                        │  官网 tokenswitch.org           │
                        │  GitHub Pages 纯静态             │
                        │  浏览器端直连各 region 聚合数据    │
                        └───────────────┬────────────────┘
                                        │ 浏览器 fetch（需 router 加 CORS）
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         │
   ┌─────────────────────┐   ┌─────────────────────┐              │
   │ router (japan)      │   │ router (singapore)  │   … regions 文件驱动
   │ jptokenswitch.cc    │   │ sgptokenswitch.cc   │
   │ HTTP+子域反代 :80    │   │                     │
   │ SSH 反向转发 :2222   │   │                     │
   └───┬─────────┬───────┘   └─────────────────────┘
       │ SSH tunnel │ market 子域 (market.*, market-*)
       ▼           ▼
 ┌───────────┐  ┌──────────────────┐   ┌───────────────────────┐
 │ client    │  │ tokenmarket       │   │ sharemarket            │
 │ cc-switch │  │ cc-switch-market  │   │ cc-switch-share-market │
 │ Tauri 桌面 │  │ 按量计费市场       │   │ 固定周期访问权撮合       │
 │ + Docker  │  │ 充值/API key/账本  │   │ 群聊+直付+确认后 grant   │
 │  Web 模式  │  │ Dodo/Gate.io 结算 │   │ 平台不碰钱              │
 └───────────┘  └──────────────────┘   └───────────────────────┘
```

- **client（cc-switch）**：Tauri 2 桌面应用 + Docker/Web 模式（`ghcr.io/xiechengqi/cc-switch`，:8008）。管理 Claude Code / Codex / Gemini CLI 等供应商配置；内置 tunnel client，把本机订阅通过 SSH 反向隧道分享出去。share 的出售类型互斥：`none / usage_paid / usage_free / share_market`。client 是 share 本体配置的事实源。
- **router（cc-switch-router）**：单二进制 Rust（axum + russh + rusqlite）。同进程承载 HTTP API + 子域反代、SSH 反向转发、SQLite 状态。是 share 元数据同步、market 注册、tunnel 和 share ACL 的**信任边界**。
- **tokenmarket（cc-switch-market）**：按 token/usage 计费的交易市场。链路 `API 用户 → market → router market proxy → client tunnel → 上游模型`。复式 ledger 记账，抽成 Market 10% + Router 5%，Dodo 充值、Gate.io 自动提现、工单、admin。前端 Next.js 静态导出，Playful Geometric 视觉。
- **sharemarket（cc-switch-share-market）**：share 固定周期访问权撮合。**平台零资金托管**：买家在订单群聊中直接向 share owner 转款，owner 确认收款后平台才触发 router grant（把买家 email 写入 `shared_with_emails`）。支持单人 / 拼车（默认 3 座、24h 成团），到期自动 revoke。同样是 Rust axum + Next.js 静态导出 + Playful Geometric。

### 1.2 官网旧架构与本次退役范围

旧官网是一个 Rust axum 二进制（rust-embed 内嵌 Vite/React SPA），承担两个后端职责，**本次全部移除**：

| 旧职责 | 去向 |
|--------|------|
| `POST /v1/verification/email/{send,verify,redeem}`（Resend 验证码中心服务） | **已退役**。原为各 region router 登录验证码的发送后端；router 侧已不再使用。下线前按 §8 退役清单做最终确认 |
| `GET /api/map-points`（服务端每 60s 聚合各 region 的 `/v1/public/map-points`） | **下放到浏览器端**：页面直接并发 fetch 各 region router 的公共端点，在客户端聚合（原 `fetcher.rs` 的合并逻辑 ~60 行，平移为 TS）。前提是 router 给公共端点加 CORS（见 §6.3） |
| rust-embed 静态托管、regions 构建期嵌入（build.rs） | 由 GitHub Pages + Actions 构建流程取代；regions 列表构建期从 `raw.githubusercontent.com/Xiechengqi/cc-switch-router/.../regions` 拉取烘焙进静态产物，运行时同源 raw 地址作热更新兜底（raw.githubusercontent 自带 `Access-Control-Allow-Origin: *`） |

移除后本仓库不再包含任何 Rust 代码：`src/`、`build.rs`、`Cargo.toml`、`run.sh` 等整体删除（git 历史保留），仓库收敛为纯前端项目 + `.github/workflows/`。

### 1.3 现状问题诊断

| 维度 | 问题 |
|------|------|
| 架构 | 为一个纯展示型站点维护 VPS + Rust 服务 + 数据库，运维成本与价值不匹配；验证服务退役后后端已无存在必要 |
| 定位 | 只讲 tunnel 分享，market / share-market / 收益模型完全没有呈现；生态四组件在官网上不可见 |
| 转化 | 没有任何通往 market、share-market、router dashboard 的入口；Hero 唯一 CTA 是 docker 命令；nav 的 Docs 是死链 `#` |
| 内容 | 无收益说明（provider 为什么要分享）、无安全模型说明（为什么敢分享）、无 FAQ、无下载页（桌面版 releases 未覆盖） |
| 视觉 | Apple 极简风与 market / share-market 的 Playful Geometric 断裂，跳转后像换了个产品 |
| 国际化 | 纯英文；share-market 界面是中文，核心用户群中英混合，无 i18n |
| SEO | 纯 CSR SPA，无 per-page meta / OG / sitemap / robots / 结构化数据，搜索引擎基本抓不到内容 |
| 工程 | 手写路由撑不起多页面；1000 行单文件 CSS 无 token 体系；与姊妹项目技术栈（Next.js + TS + Tailwind）不一致 |

---

## 2. 重构定位与目标

**官网 = 生态的第一入口**，服务三类用户旅程：

1. **Consumer（用 AI 的人）**：想便宜/稳定地用 Claude、Codex → 引导进 tokenmarket（按量）或 sharemarket（包周期/拼车）。
2. **Provider（有订阅的人）**：想把闲置订阅变现 → 讲清两种变现模式和收益分成（净额 = 消费 − 10% market − 5% router），引导下载 client 开启 share。
3. **Self-hoster / Developer**：想自己跑一套 → docker 一行命令 + 自部署 router 文档。

**北极星指标**：官网 → 「下载 client / 进入 market / 进入 share-market」的点击转化。
**次级目标**：实时网络数据可视化（现有地图是最大资产，保留并放大）、SEO 自然流量、品牌信任、**零运维零成本托管**。

**品牌注意**：上游 farion1231/cc-switch 官网是 ccswitch.io。官网文案应把 **TokenSwitch 定位为网络/生态品牌**（"the network"），cc-switch 是其 client 组件，避免与上游官网产生混淆或冒充感。

---

## 3. 信息架构（Sitemap）

```text
/                    首页：生态总览 + 双漏斗 CTA
/network             实时网络：全幅地图 + region 卡片（合并现 /routers）+ 各 region dashboard/market 入口
/download            获取 client：Desktop(GitHub releases) / Docker / Web 三 tab，平台自动检测
/earn                Provider 故事：两种变现模式对比 + 收益流向图 + 收益计算器 + 开始分享步骤
/markets             市场门户：token market（按量）与 share market（包周期）介绍 + region 选择跳转
/security            信任中心：key 不出本机、短期 lease、ledger 审计、平台不托管资金
/faq                 常见问题
/docs → docsify      文档（docs.tokenswitch.org 子域，同样可用 GitHub Pages 托管，见 §6.5）
```

顶部导航（≤5 项 + 右侧功能区）：

```text
[◆ TokenSwitch]   Network   Markets   Earn   Docs        [中/EN]  [GitHub]  [Get Started →]
```

`Get Started` 主按钮进 `/download`。Footer 补全：四组件 GitHub 仓库、各 region dashboard、security、联系方式。

---

## 4. 页面级方案

### 4.1 首页 `/`

```text
┌──────────────────────────────────────────────────────────┐
│ HERO                                                      │
│  H1: Share your AI. Power the network.                    │
│  Sub: 把 Claude / Codex / Gemini 订阅接入全球网络——         │
│       自己用、分享给朋友、或者直接变现。                      │
│  [Get the client →]   [Browse markets]                    │
│  右侧：TerminalCard（保留 docker 命令 + copy + 视频）        │
├──────────────────────────────────────────────────────────┤
│ LIVE STRIP（保留 StatsStrip，数据升级）                     │
│  N regions · N servers · N live connections · N shares    │
│  背景嵌小号地图预览，整条可点 → /network                     │
├──────────────────────────────────────────────────────────┤
│ HOW THE NETWORK WORKS（现有 SVG 动画升级为 4 节点）          │
│  client ──SSH──► router ──proxy──► market ──► consumer    │
│  三步文案改写：Share / Route / Earn                         │
├──────────────────────────────────────────────────────────┤
│ ECOSYSTEM 四卡（新增，核心区块）                             │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐      │
│  │ Client  │ │ Router  │ │  Token   │ │   Share   │      │
│  │ 管理+分享│ │ 全球边缘 │ │  Market  │ │  Market   │      │
│  │Download→│ │Network →│ │ 按量购买 → │ │ 拼车/包月 → │      │
│  └─────────┘ └─────────┘ └──────────┘ └───────────┘      │
├──────────────────────────────────────────────────────────┤
│ EARN 区块：资金流向图（借鉴 market 的 MoneyFlow）            │
│  消费 $1.00 → provider 得 $0.85 · market $0.10 · router   │
│  $0.05，全程 ledger 可查   [Start earning →]               │
├──────────────────────────────────────────────────────────┤
│ TRUST 三点：Keys never leave / Short-lived leases /       │
│  Ledger everything（→ /security）                          │
├──────────────────────────────────────────────────────────┤
│ 全幅世界地图（保留 WorldMap，作为压轴视觉）+ Final CTA        │
└──────────────────────────────────────────────────────────┘
```

### 4.2 `/network`

- 全幅地图置顶，client 点位聚合气泡（现有 d3-geo 实现迁移）。
- Region 卡片：浏览器直连该 region `/v1/healthz` 做健康探测 + 计时，显示 `healthy/down` 与**访客视角的真实延迟**（比旧服务端探测更有价值）+ 该 region 在线 client 数 + 三个链接（Dashboard / Token Market / Share Market 子域）。
- 「Run your own region」区块：链接 router 自部署文档，生态开放性叙事。

### 4.3 `/download`

- UA 检测默认选中平台 tab：**Desktop**（macOS arm64/x64、Windows、Linux，按钮直链 GitHub release 资产）／**Docker**（现有命令卡）／**Web**（说明 Docker 模式即 Web UI，:8008，默认账号提示改为「首次登录后请修改密码」）。
- 版本号与资产直链：构建期由 Actions 调 GitHub API 烘焙进页面（保底数据），运行时浏览器再 fetch `api.github.com/repos/.../releases/latest` 刷新（匿名限额 60 次/h/IP，单访客一次足够；失败静默回退烘焙值）。
- 下载后引导三选一：只自己用 / 分享给朋友（free share）/ 变现（→ /earn）。

### 4.4 `/earn`（转化关键页）

- 两种变现模式对比表：

| | Token Market（按量） | Share Market（包周期） |
|---|---|---|
| 计费 | 按 token 用量自动扣费 | 固定周期一口价 / 拼车 |
| 收款 | 平台结算，Gate.io 自动提现 | 买家直接转账给你 |
| 抽成 | 10% + 5% | 平台不经手资金 |
| 适合 | 想躺赚、不想沟通 | 想自主定价、熟人/社群交易 |

- **收益计算器**（交互亮点）：滑杆输入「预计月消费 $X」→ 实时显示 provider 净收入（bps 常量与 market 对齐，纯前端计算）。
- 四步上手：装 client → 登录邮箱 → 开启 share 并选择变现模式 → 在 market 看收益。每步配 client 截图。

### 4.5 `/markets`

- 两大市场并列介绍 + region 选择器（数据来自烘焙的 regions 列表）→ 跳 `market.{region-domain}` / share-market 子域。
- Phase 3 增强：展示实时在售 listing 数、支持的模型列表（浏览器直连 market 的 public stats 端点，需跨仓新增 + CORS，见 §7 Phase 3）。

### 4.6 `/security`、`/faq`

静态内容页。security 按角色分三栏（Provider / Consumer / 平台边界——尤其要写清 share-market「平台不托管资金、不验证转账、不担保退款」，这既是免责也是信任叙事）。FAQ 首批 10 条覆盖：和直接用官方 API 的区别、封号风险、free share 的 IP 并发限制、提现方式、拼车规则等。

---

## 5. 视觉与设计系统

**决策：采用「Playful Geometric 的克制版」，与 market / share-market 共享 token，官网降低装饰密度。**

理由：官网 → market 是核心转化路径，视觉断裂直接损伤信任；生态内已有两个产品沉淀了完整的 Playful Geometric 规范（见 cc-switch-market/CLAUDE.md），官网跟随成本最低。官网作为 infra 门户，把「Memphis 装饰」收敛到 Hero 背景几何形状和强调色词，正文区保持干净。

```text
颜色（与 market 对齐）
  background   #FFFDF5  暖米白
  foreground   #1E293B  Slate 800
  accent       #8B5CF6  Violet（现官网 #7C3AED 靠拢至此）
  secondary    #F472B6 / tertiary #FBBF24 / quaternary #34D399（点缀轮换）
  地图/终端区   保留深色 #0F172A 底——官网独有的「深色网络层」，
               作为与两个 market 的差异化记忆点

字体
  标题  Outfit 700/800
  正文  Plus Jakarta Sans 400/500
  代码  JetBrains Mono（terminal 卡、命令、坐标）
  自托管 woff2 + font-display: swap + preload

形状/深度（Playful Geometric 规则）
  2px 边框、radius 8/16/24/full、无投影，深度靠边框对比与叠层几何
  hover: scale(1.01~1.02) 或 ±0.5deg rotate；焦点用高对比 ring

动效
  保留并尊重 prefers-reduced-motion（现有 HowItWorks 已做，延续）
  数字滚动（StatsStrip）、地图 client 点呼吸、路径流动动画

响应式断点  640 / 1024 / 1280；地图在移动端降级为静态 SVG + 数字
无障碍      文本对比 ≥ 4.5:1，所有交互元素可键盘达，SVG 图配 aria-label
```

产出物：`src/styles/tokens.css`（CSS variables）+ Tailwind 主题映射，作为唯一 token 源；同时把 token 表回写到 docsify 文档，供四个项目对齐。

---

## 6. 技术方案（GitHub Pages 纯静态）

### 6.1 框架与仓库结构

**Next.js 15 App Router + `output: 'export'` + TypeScript + Tailwind**——与 router / market / share-market 前端完全同构，单人维护四个项目的心智统一价值最高；组件（Button/Card/Badge）与 `lib/i18n.ts` 模式可直接复制。

重构后仓库结构（Rust 全部删除，前端提升到仓库根）：

```text
tokenswitch/
  .github/workflows/deploy.yml    # 构建 + 部署 Pages
  public/                          # 静态资产（CNAME、favicon、视频、og 图、.nojekyll）
  src/
    app/                           # (en|zh)/{page,network,download,earn,markets,security,faq}
    components/                    # WorldMap、TerminalCard、HowItWorks、StatsStrip… 迁移为 TS
    lib/
      regions.ts                   # 烘焙 regions + 运行时 raw.githubusercontent 兜底
      map-points.ts                # 浏览器端并发拉取各 region 并聚合（原 fetcher.rs 平移）
      releases.ts                  # GitHub releases 烘焙 + 运行时刷新
      i18n.ts
    styles/tokens.css
  scripts/bake-data.mjs            # 构建期拉 regions / releases / map-points 快照 → JSON
  next.config.mjs                  # output:'export', trailingSlash:true, images.unoptimized
```

GitHub Pages 关键配置：`public/CNAME`（`tokenswitch.org`）、`public/.nojekyll`（防 Jekyll 吞 `_next/`）、`trailingSlash: true`（每页导出为 `dir/index.html`，Pages 原生支持）、自定义 404 页（Next 的 `not-found` 导出为 `404.html`）。

### 6.2 数据层：三级数据源（静态站的核心设计）

站点是静态的，但数据是活的。每类动态数据按「烘焙保底 → 运行时直连 → 优雅降级」三级设计：

| 数据 | 构建期烘焙（Actions） | 运行时（浏览器） | 降级表现 |
|------|----------------------|-----------------|---------|
| regions 列表 | 从 raw.githubusercontent 的 regions 文件拉取 → JSON | 同地址热更新（raw 自带 CORS `*`） | 用烘焙值 |
| 地图点位/连接数 | 构建时拉一次快照，保证首屏有数据 | 每 60s 并发 fetch 各 region `/v1/public/map-points`，客户端聚合；`document.visibilityState` 隐藏时暂停 | 显示快照 + 「snapshot」角标 |
| region 健康/延迟 | 无 | fetch 各 region `/v1/healthz` 计时（访客真实延迟） | 卡片隐藏延迟徽标 |
| client 版本/下载链接 | GitHub API releases/latest → 烘焙 | 同 API 刷新（匿名 60/h/IP 足够） | 用烘焙值 |
| market 统计（Phase 3） | 可选快照 | 直连 market public stats 端点 | 隐藏该数字 |

可选增强：Actions 加 `schedule` cron（如每天一次）重跑烘焙，让快照保底数据不至于陈旧；不引入提交噪音（`actions/deploy-pages` 直接部署构建产物，不 commit）。

### 6.3 跨仓前置依赖：router 加 CORS（小改动，Phase 0）

现状确认：router **未配置任何 CORS 层**（api.rs:3911 的注释即因此做过后端中转）。浏览器直连方案的前置条件：

- 给 `GET /v1/public/map-points`、`GET /v1/healthz`（及未来 public stats 端点）加 `Access-Control-Allow-Origin: *`。仅 GET、无凭据、本就公开的数据，安全上无新增暴露。
- 实现建议：`tower-http` `CorsLayer::permissive()` 仅套在 public 路由子树上，或 handler 手动加响应头（三行）。两个 region 滚动升级后官网方可切换。
- 官网开发期可先用烘焙快照开发，不被此项阻塞。

### 6.4 部署流水线（`.github/workflows/deploy.yml`)

```yaml
on:
  push: { branches: [main] }
  schedule: [{ cron: '17 3 * * *' }]   # 每日重烘焙快照（错开整点）
  workflow_dispatch:
jobs:
  build:
    - checkout → setup-node(pnpm) → pnpm install
    - node scripts/bake-data.mjs        # regions/releases/map-points 快照，失败用上次产物兜底
    - pnpm build                        # next build (output: export) → out/
    - actions/upload-pages-artifact (out/)
  deploy:
    - actions/deploy-pages
```

域名：`tokenswitch.org` DNS → GitHub Pages（A/AAAA apex 记录 + HTTPS enforced）。**建议 DNS 放 Cloudflare 并开代理**：一是 GitHub Pages 在中国大陆直连不稳定，CF 前置可显著改善核心中文用户群的可达性；二是免费拿到边缘缓存与统计。

### 6.5 i18n 与文档

- 静态导出下无法做服务端 Accept-Language 跳转：`/` 输出一个极轻的语言检测页（`navigator.language` → 跳 `/en/` 或 `/zh/`，选择持久化 localStorage），所有实际内容页在 `/en/*`、`/zh/*` 路由段下，互相加 `hreflang`。ja 放 Phase 4。
- 文档：docsify 站（`/data/projects/tokenswitch-docsify`，已有 intro/provider/market/router/reference 内容）本身就是纯静态，**同样部署为 GitHub Pages 项目站**，绑 `docs.tokenswitch.org`，与官网 nav 互链。全家零服务器。

### 6.6 旧服务退役清单（谨慎项）

1. **下线前最终确认**：router 代码中 `verification_service_base_url` 仍默认指向 `https://tokenswitch.org`（config.rs:144）。确认两个 region 的 router 已升级到不再调用验证服务的版本（或配置已置空），并观察旧服务访问日志 ≥ 一周无 `/v1/verification/*` 流量。
2. DNS 切换：`tokenswitch.org` 从 VPS 指向 GitHub Pages。切换前新站已在 `*.github.io` 预览验收。
3. 停止 VPS 上的 tokenswitch 进程与 systemd 单元；SQLite 验证码库归档后删除（含用户邮箱，注意留存合规）。
4. 仓库删除 Rust 代码（`src/ build.rs Cargo.* run.sh build.sh`），README 重写为前端项目说明。
5. Resend 上专用于官网验证服务的 API key 吊销（router 自身发信用的是 router 自己的 key，互不影响）。

---

## 7. 实施路线图

### Phase 0 — 地基与流水线（1 天）
- [ ] 确认视觉决策（§5）与 IA（§3）
- [ ] 仓库重构：删 Rust，Next.js 15 + TS + Tailwind 脚手架提升到根目录，`output: 'export'` + `trailingSlash` + `.nojekyll` + `CNAME`
- [ ] `tokens.css` + Tailwind 主题；自托管三套字体
- [ ] `scripts/bake-data.mjs` + `deploy.yml`，跑通 push → Pages 的完整链路（先用 `*.github.io` 验收）
- [ ] **跨仓**：router 公共端点加 CORS 的 PR（三行改动 + 部署两个 region）
- **验收**：`*.github.io` 能访问预渲染多页；Actions 全绿；CORS 生效（浏览器 console 直连 region 成功）。

### Phase 1 — 骨架与首页（2–3 天）
- [ ] TopNav / Footer 新信息架构 + 语言切换 + i18n 框架（zh/en）
- [ ] 首页全部区块（§4.1）；WorldMap / HowItWorks / TerminalCard / StatsStrip 迁移为 TS client component 并换肤
- [ ] `lib/map-points.ts`：浏览器端聚合 + 60s 轮询 + visibility 暂停 + 快照降级
- [ ] `/network` 页（合并现 /routers）+ healthz 延迟探测
- **验收**：Lighthouse Performance/SEO ≥ 90；断网/CORS 失败时页面仍完整（显示快照）；移动端无横向滚动。

### Phase 2 — 转化页与内容（2 天）
- [ ] `/download`（UA 检测 + releases 烘焙/运行时刷新）
- [ ] `/earn`（对比表 + 收益计算器 + 四步上手截图）
- [ ] `/markets`（region 选择器跳转）
- [ ] `/security`、`/faq`；docsify 部署到 `docs.tokenswitch.org`（Pages 项目站）并在 nav 打通
- **验收**：三类用户旅程各自从首页 ≤2 次点击到达目标动作；死链为零。

### Phase 3 — 数据纵深（1–2 天，含跨仓改动）
- [ ] router 新增 public 端点：在线 share 数（脱敏聚合）；market 新增 public 端点：在售 listing 数 / 支持模型（均带 CORS）
- [ ] 首页 Live Strip、/markets 页消费上述数据（降级隐藏）
- **验收**：首页统计涵盖「regions / servers / connections / shares online」；region 卡片能真实反映 down 状态。

### Phase 4 — 切换与打磨（1 天）
- [ ] 全站 metadata / OG image / JSON-LD（SoftwareApplication + FAQPage）/ sitemap / robots / hreflang
- [ ] ja locale；a11y 审查；视频加 poster、地图 lazy-load
- [ ] **DNS 切换到 Pages（建议经 Cloudflare 代理）+ 按 §6.6 退役旧服务**
- **验收**：tokenswitch.org 由 Pages 提供服务且 HTTPS 正常；Lighthouse 四项 ≥ 90；旧 VPS 进程停止后无任何告警/回调失败。

---

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 验证服务实际仍有调用方（router 默认配置仍指向 tokenswitch.org） | §6.6 退役清单第 1 条：先看日志再拔线；DNS 切换后旧服务可在备用端口再挂两周观察 |
| router 未加 CORS 前浏览器直连全挂 | 三级数据源设计天然降级到烘焙快照；CORS 改动放 Phase 0 最先做 |
| GitHub Pages 在中国大陆可达性差（核心用户群含大量中文用户） | Cloudflare 代理前置；docs 与官网同策略。若仍不达标，Pages 产物可无改动地迁 Cloudflare Pages（备选托管） |
| 每个访客直接轮询 region router，流量与滥用面 | 公共只读端点、数据量小（KB 级）；60s 间隔 + 页面隐藏暂停；router 侧如有压力可对 public 路由加简单 IP 限流 |
| GitHub API 匿名限额 60/h/IP | 仅 /download 页触发一次 + 烘焙保底，实际不可能触顶 |
| rust-embed 时代的旧 URL（/routers、/api/map-points）失效 | `/routers` 建静态跳转页 → `/network`；`/api/map-points` 无外部消费方（原仅前端自用），确认后直接废弃 |
| 品牌与上游 cc-switch（ccswitch.io）混淆 | 文案统一用 TokenSwitch 作为网络品牌；提及 cc-switch 时注明 based on the open-source cc-switch |
| 收益计算器数字与 market 实际抽成漂移 | bps 常量单点定义并注释来源（`MARKET_PLATFORM_COMMISSION_BPS` 等），market 调整时同步 |

## 9. 明确不做（本次范围外）

- 官网不做登录/用户系统、不做任何需要服务端的功能（表单、评论、统计后端）。
- 不把 market / share-market 前端合并进官网（保持各自独立部署，官网只做门户跳转）。
- 不做 docsify → Next.js 的文档迁移（仅同为 Pages 部署并打通入口）。
- 不改 client / router 的核心协议；跨仓改动仅限：public 端点 CORS + 只读公共统计端点。
