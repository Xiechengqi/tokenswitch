import type { Locale } from "./types";

export type Dict = (typeof dict)[Locale];

const dict = {
  en: {
    brand: "TokenSwitch",
    tagline: "The network for shared AI subscriptions",
    nav: {
      network: "Network",
      markets: "Markets",
      earn: "Earn",
      docs: "Docs",
      getStarted: "Start earning",
      github: "GitHub",
      telegram: "Telegram",
      x: "X",
    },
    hero: {
      title: "Share your AI. Power the network.",
      subtitle:
        "Run the TokenSwitch client on a Linux server, open a share, and monetize idle Claude, Codex & Gemini access — or buy routed usage on the markets.",
      linuxNote: "Providers need a Linux host (amd64 or arm64).",
      ctaJoin: "Join the network",
      ctaMarkets: "I'm a user — browse markets",
    },
    install: {
      badge: "install",
      linuxNote: "One-line install on Linux (amd64 / arm64).",
      region: "Region",
      email: "Owner email",
      emailPlaceholder: "you@example.com",
      password: "Web UI password",
      passwordPlaceholder: "Choose a password",
      passwordHint: "Used for your provider node Web UI login. Never sent to this website.",
      copy: "Copy install command",
      copied: "Copied",
      pasteHint: "Paste and run it on your Linux server.",
      unavailable: "This region is currently unreachable. Pick another region to install.",
      moreWays: "More install options",
    },
    stats: {
      regions: "Regions",
      servers: "Servers",
      connections: "Connections",
      shares: "Shares",
      live: "Live",
      snapshot: "Snapshot",
    },
    ecosystem: {
      title: "Four pieces, one network",
      subtitle:
        "TokenSwitch is the ecosystem brand. The open-source client runtime is cc-switch-server.",
      client: {
        title: "Client",
        desc: "Linux provider runtime with Web UI — manage providers, shares, and tunnels.",
        cta: "Install",
      },
      router: {
        title: "Router",
        desc: "Global edge routing, SSH tunnels, share ACL.",
        cta: "Network",
      },
      tokenMarket: {
        title: "Token Market",
        desc: "Pay-per-token API access with platform settlement.",
        cta: "Buy usage",
      },
      shareMarket: {
        title: "Share Market",
        desc: "Fixed-period access & carpool — zero custody.",
        cta: "Browse listings",
      },
    },
    howItWorks: {
      title: "How the network works",
      subtitle:
        "Providers run the client on a server they control. Routers route traffic. Markets connect consumers — upstream keys stay on your provider node.",
      steps: [
        {
          bold: "Share.",
          text: "Install the client, register to a router, and open an outbound SSH tunnel.",
        },
        {
          bold: "Route.",
          text: "Public requests hit a subdomain on the router and proxy back through the tunnel.",
        },
        {
          bold: "Earn.",
          text: "List on Token Market (usage) or Share Market (period) and collect revenue.",
        },
      ],
      labels: {
        tunnel: "SSH tunnel",
        request: "API request",
        response: "Response",
      },
      nodes: {
        client: "client",
        clientCap: "your provider node",
        router: "router",
        routerCap: "global edge",
        market: "market",
        marketCap: "billing layer",
        consumer: "consumer",
        consumerCap: "anywhere",
      },
    },
    earn: {
      title: "Provider revenue flow",
      subtitle: "On Token Market, $1.00 of usage yields ~$0.85 net to the provider after platform fees.",
      breakdown: "Market 10% · Router 5% · fully ledgered",
      cta: "Start earning",
    },
    map: {
      title: "Live network",
      subtitle: "Click a region node to explore the network.",
      clients: (n: number) => (n === 1 ? "1 client" : `${n} clients`),
      legendServer: "Router",
      legendClient: "Provider (by country)",
    },
    network: {
      title: "Network",
      subtitle: "Real-time edge nodes where provider tunnels connect and shares go live.",
      healthy: "Healthy",
      down: "Down",
      latency: "Latency",
      clients: "Clients online",
      dashboard: "Dashboard",
      tokenMarket: "Token Market",
      shareMarket: "Share Market",
      selfHost: "Run your own region",
      selfHostDesc: "Deploy cc-switch-router on your own domain and join the open network.",
      selfHostCta: "Router deploy docs",
      loading: "Loading regions…",
    },
    download: {
      title: "Install the client",
      subtitle:
        "The TokenSwitch client is cc-switch-server — a Linux provider runtime with an embedded Web UI. Desktop builds are discontinued.",
      scriptTitle: "Recommended: one-line install",
      scriptDesc: "Use the homepage install card, or copy the same flow here after picking a region.",
      goInstall: "Open install card",
      binaryTitle: "Linux binary",
      binaryDesc:
        "Download the amd64 or arm64 binary from GitHub Releases when you cannot run the install script.",
      version: "Version",
      downloadBtn: "Download",
      allReleases: "All releases on GitHub",
      afterDownload: "What next?",
      paths: [
        { title: "Personal use", desc: "Point Claude, Codex & Gemini CLIs at your provider node." },
        { title: "Share with friends", desc: "Free or private shares via email whitelist." },
        { title: "Monetize", desc: "List on Token Market or Share Market.", href: "earn" },
      ],
    },
    earnPage: {
      title: "Earn from your subscriptions",
      subtitle: "Two ways to monetize idle Claude, Codex & Gemini access.",
      compareTitle: "Choose your model",
      tokenMarket: "Token Market",
      shareMarket: "Share Market",
      rows: {
        billing: { label: "Billing", token: "Per-token usage, auto-deducted", share: "Fixed period / carpool price" },
        payout: {
          label: "Payout",
          token: "Platform settlement, Gate.io auto-withdraw",
          share: "Buyer pays you directly",
        },
        fee: { label: "Platform fee", token: "10% market + 5% router", share: "Zero custody — no platform cut" },
        fit: { label: "Best for", token: "Passive income, no negotiation", share: "Custom pricing, community trades" },
      },
      steps: {
        title: "Get started in four steps",
        items: [
          "Install the client (cc-switch-server) on a Linux host.",
          "Complete setup and bind your owner email on the router.",
          "Create a share and pick Token Market or Share Market.",
          "Track earnings on the market dashboard.",
        ],
      },
    },
    marketsPage: {
      title: "Markets",
      subtitle: "Buy AI usage or fixed-period access across regions.",
      tokenTitle: "Token Market",
      tokenDesc: "OpenAI / Anthropic compatible API. Top up balance, get an API key, pay per token.",
      shareTitle: "Share Market",
      shareDesc: "Buy fixed-period share access or join a carpool. Pay the owner directly in chat.",
      pickRegion: "Pick a region",
      open: "Open",
      comingSoon: "Coming soon",
      stats: {
        onlineShares: "Online shares",
        listings: "Active listings",
        models: "Popular models",
      },
    },
    securityPage: {
      title: "Trust center",
      subtitle: "How TokenSwitch protects providers, consumers, and platform boundaries.",
      provider: {
        title: "Provider",
        items: [
          "Upstream API keys stay on your provider node — never sent to markets or this website.",
          "Shares sync metadata only — router stores subdomain & ACL, not secrets.",
          "Token Market revenue is ledgered; withdrawals are auditable.",
        ],
      },
      consumer: {
        title: "Consumer",
        items: [
          "Token Market API keys are market-issued, separate from provider keys.",
          "Usage is metered and visible in your dashboard.",
          "Share Market: access granted only after the owner confirms payment.",
        ],
      },
      platform: {
        title: "Platform boundary",
        items: [
          "Share Market does not hold funds, verify transfers, or guarantee refunds.",
          "Router is the trust boundary for routing and ACL — not a payment processor.",
          "Token Market uses double-entry ledger; admin cannot silently edit balances.",
        ],
      },
    },
    faqPage: {
      title: "FAQ",
      items: [
        {
          q: "How is this different from official Claude / Codex APIs?",
          a: "Consumers buy routed access through provider shares. Providers keep subscriptions and keys on their own node; the network handles routing and (on Token Market) billing.",
        },
        {
          q: "Can I get banned for sharing?",
          a: "You are responsible for complying with upstream provider terms. TokenSwitch routes traffic but does not bypass provider policies.",
        },
        {
          q: "What is a free share?",
          a: "A public share with forSale=Free. Routers may enforce per-IP concurrency limits on free shares.",
        },
        {
          q: "How do Token Market payouts work?",
          a: "Earnings accrue in your provider balance. Withdraw via Gate.io auto-payout or a manual ticket for other methods.",
        },
        {
          q: "How does Share Market carpool work?",
          a: "Listings can offer multiple seats (default 3) with a 24h formation window. Access is granted after the owner confirms payment.",
        },
        {
          q: "Does Share Market hold my money?",
          a: "No. Buyers pay owners directly in the order chat. The platform only triggers router ACL grants after owner confirmation.",
        },
        {
          q: "What is the client vs TokenSwitch?",
          a: "TokenSwitch is the network/ecosystem brand. The provider client runtime is cc-switch-server (desktop cc-switch is discontinued).",
        },
        {
          q: "Do I need a public IP?",
          a: "No. The client uses SSH reverse tunnels to connect to routers.",
        },
        {
          q: "Can I self-host a router?",
          a: "Yes. Deploy cc-switch-router on your own domain. See docs for DNS, TLS, and market registration.",
        },
        {
          q: "Where is live network data from?",
          a: "The site loads a baked snapshot at build time and refreshes from public router endpoints and the regions file when available.",
        },
      ],
    },
    footer: {
      copyright: "© 2026 TokenSwitch",
      components: "Components",
      regions: "Regions",
      security: "Security",
      faq: "FAQ",
      telegram: "Telegram",
      x: "X",
      clientRepo: "cc-switch-server (client)",
    },
    lang: { en: "EN", zh: "中文", ja: "日本語" },
    notFound: { title: "Page not found", back: "Back home" },
    a11y: { skipToContent: "Skip to content" },
  },
  zh: {
    brand: "TokenSwitch",
    tagline: "共享 AI 订阅的全球网络",
    nav: {
      network: "网络",
      markets: "市场",
      earn: "变现",
      docs: "文档",
      getStarted: "开始变现",
      github: "GitHub",
      telegram: "Telegram",
      x: "X",
    },
    hero: {
      title: "分享你的 AI，驱动全球网络",
      subtitle:
        "在 Linux 服务器上运行 TokenSwitch 客户端、开启 Share，把闲置的 Claude / Codex / Gemini 变现——或在市场购买路由用量。",
      linuxNote: "Provider 需要一台 Linux 主机（amd64 或 arm64）。",
      ctaJoin: "接入网络，开始变现",
      ctaMarkets: "我是使用者，去市场",
    },
    install: {
      badge: "install",
      linuxNote: "Linux（amd64 / arm64）一键安装。",
      region: "区域",
      email: "Owner 邮箱",
      emailPlaceholder: "you@example.com",
      password: "Web UI 密码",
      passwordPlaceholder: "设置登录密码",
      passwordHint: "用于你的 Provider 节点 Web UI 登录，不会发送给本网站。",
      copy: "复制安装命令",
      copied: "已复制",
      pasteHint: "到你的 Linux 服务器上粘贴运行。",
      unavailable: "该区域当前不可达，请换一个区域再安装。",
      moreWays: "更多安装方式",
    },
    stats: {
      regions: "区域",
      servers: "节点",
      connections: "连接",
      shares: "在线 Share",
      live: "实时",
      snapshot: "快照",
    },
    ecosystem: {
      title: "四组件，一张网",
      subtitle: "TokenSwitch 是生态品牌；开源客户端运行时是 cc-switch-server。",
      client: {
        title: "Client",
        desc: "Linux Provider 运行时 + Web UI：管理供应商、Share 与隧道。",
        cta: "安装",
      },
      router: {
        title: "Router",
        desc: "全球边缘路由、SSH 隧道、Share ACL。",
        cta: "网络",
      },
      tokenMarket: {
        title: "Token Market",
        desc: "按 Token 计费的 API 市场，平台结算。",
        cta: "按量购买",
      },
      shareMarket: {
        title: "Share Market",
        desc: "固定周期 / 拼车访问权，平台零托管。",
        cta: "浏览挂牌",
      },
    },
    howItWorks: {
      title: "网络如何运作",
      subtitle:
        "Provider 在自己控制的服务器上运行客户端；Router 路由流量；Market 连接消费者——上游密钥只留在你的 Provider 节点。",
      steps: [
        { bold: "分享。", text: "安装客户端，注册到 Router，并打开出站 SSH 隧道。" },
        { bold: "路由。", text: "公网请求命中 Router 子域，经隧道回传到你的节点。" },
        { bold: "变现。", text: "上架 Token Market（按量）或 Share Market（包周期）获取收益。" },
      ],
      labels: {
        tunnel: "SSH 隧道",
        request: "API 请求",
        response: "响应",
      },
      nodes: {
        client: "client",
        clientCap: "你的 Provider 节点",
        router: "router",
        routerCap: "全球边缘",
        market: "market",
        marketCap: "计费层",
        consumer: "消费者",
        consumerCap: "任何地方",
      },
    },
    earn: {
      title: "Provider 收益流向",
      subtitle: "Token Market 上，每 $1.00 消费约 $0.85 净收入归 Provider。",
      breakdown: "Market 10% · Router 5% · 全程 ledger 可查",
      cta: "开始变现",
    },
    map: {
      title: "实时网络",
      subtitle: "点击区域节点，进入网络页探索。",
      clients: (n: number) => `${n} 个客户端`,
      legendServer: "Router",
      legendClient: "Provider（按国家聚合）",
    },
    network: {
      title: "网络",
      subtitle: "Provider 隧道接入的全球边缘节点，Share 在此上线。",
      healthy: "正常",
      down: "离线",
      latency: "延迟",
      clients: "在线客户端",
      dashboard: "Dashboard",
      tokenMarket: "Token Market",
      shareMarket: "Share Market",
      selfHost: "自建 Region",
      selfHostDesc: "在你自己的域名部署 cc-switch-router，加入开放网络。",
      selfHostCta: "Router 部署文档",
      loading: "加载区域中…",
    },
    download: {
      title: "安装客户端",
      subtitle:
        "TokenSwitch 客户端即 cc-switch-server——带内嵌 Web UI 的 Linux Provider 运行时。桌面版已停用。",
      scriptTitle: "推荐：一键安装",
      scriptDesc: "请使用首页安装卡；或选好区域后按同样流程复制命令。",
      goInstall: "打开安装卡",
      binaryTitle: "Linux 二进制",
      binaryDesc: "无法使用安装脚本时，从 GitHub Releases 下载 amd64 / arm64 二进制。",
      version: "版本",
      downloadBtn: "下载",
      allReleases: "GitHub 全部版本",
      afterDownload: "安装后做什么？",
      paths: [
        { title: "自己用", desc: "把 Claude、Codex、Gemini CLI 指向你的 Provider 节点。" },
        { title: "分享给朋友", desc: "Free 或私有 Share，邮箱白名单控制。" },
        { title: "变现", desc: "上架 Token Market 或 Share Market。", href: "earn" },
      ],
    },
    earnPage: {
      title: "把订阅变成收入",
      subtitle: "两种模式变现闲置的 Claude、Codex、Gemini 访问权。",
      compareTitle: "选择变现模式",
      tokenMarket: "Token Market（按量）",
      shareMarket: "Share Market（包周期）",
      rows: {
        billing: { label: "计费", token: "按 Token 用量自动扣费", share: "固定周期一口价 / 拼车" },
        payout: { label: "收款", token: "平台结算，Gate.io 自动提现", share: "买家在群聊中直接转给你" },
        fee: { label: "抽成", token: "Market 10% + Router 5%", share: "平台不经手资金" },
        fit: { label: "适合", token: "想躺赚、不想沟通", share: "自主定价、熟人/社群交易" },
      },
      steps: {
        title: "四步上手",
        items: [
          "在 Linux 主机上安装客户端（cc-switch-server）。",
          "完成 setup，并在 Router 绑定 Owner 邮箱。",
          "创建 Share 并选择 Token Market 或 Share Market。",
          "在市场 Dashboard 查看收益。",
        ],
      },
    },
    marketsPage: {
      title: "市场",
      subtitle: "按量购买 AI 用量，或购买固定周期访问权。",
      tokenTitle: "Token Market",
      tokenDesc: "OpenAI / Anthropic 兼容 API。充值余额、获取 API Key、按 Token 计费。",
      shareTitle: "Share Market",
      shareDesc: "购买固定周期 Share 或拼车席位。在订单群聊中直接向 Owner 付款。",
      pickRegion: "选择区域",
      open: "打开",
      comingSoon: "即将开放",
      stats: {
        onlineShares: "在线 Share",
        listings: "活跃挂牌",
        models: "热门模型",
      },
    },
    securityPage: {
      title: "信任中心",
      subtitle: "TokenSwitch 如何保护 Provider、Consumer 与平台边界。",
      provider: {
        title: "Provider",
        items: [
          "上游 API Key 只留在你的 Provider 节点——不会发给市场或本网站。",
          "Share 仅同步元数据——Router 存子域与 ACL，不存密钥。",
          "Token Market 收益写入 ledger，提现可审计。",
        ],
      },
      consumer: {
        title: "Consumer",
        items: [
          "Token Market API Key 由市场签发，与 Provider 密钥无关。",
          "用量在 Dashboard 可见、可核对。",
          "Share Market：Owner 确认收款后才授予访问权。",
        ],
      },
      platform: {
        title: "平台边界",
        items: [
          "Share Market 不托管资金、不验证转账、不担保退款。",
          "Router 是路由与 ACL 的信任边界——不是支付处理方。",
          "Token Market 使用复式 ledger，Admin 无法静默改余额。",
        ],
      },
    },
    faqPage: {
      title: "常见问题",
      items: [
        {
          q: "和直接用官方 API 有什么区别？",
          a: "消费者通过 Provider Share 购买路由访问。Provider 在自己的节点持有订阅与密钥；网络负责路由，Token Market 负责计费。",
        },
        {
          q: "分享会被封号吗？",
          a: "你需自行遵守上游服务商条款。TokenSwitch 负责路由，不绕过服务商政策。",
        },
        {
          q: "什么是 Free Share？",
          a: "forSale=Free 的公开 Share。Router 可能对 Free Share 实施单 IP 并发限制。",
        },
        {
          q: "Token Market 如何提现？",
          a: "收益计入 Provider 余额。可通过 Gate.io 自动提现，或提交人工工单使用其他收款方式。",
        },
        {
          q: "Share Market 拼车规则？",
          a: "挂牌可设多席位（默认 3 座），24 小时成团窗口。Owner 确认收款后授予访问权。",
        },
        {
          q: "Share Market 会托管我的钱吗？",
          a: "不会。买家在订单群聊直接向 Owner 转账。平台仅在 Owner 确认后触发 Router ACL grant。",
        },
        {
          q: "客户端和 TokenSwitch 是什么关系？",
          a: "TokenSwitch 是网络/生态品牌。Provider 客户端运行时是 cc-switch-server（桌面版 cc-switch 已停用）。",
        },
        {
          q: "需要公网 IP 吗？",
          a: "不需要。客户端通过 SSH 反向隧道连接 Router。",
        },
        {
          q: "可以自建 Router 吗？",
          a: "可以。在你自己的域名部署 cc-switch-router，参见文档中的 DNS、TLS 与市场注册说明。",
        },
        {
          q: "官网的网络数据从哪来？",
          a: "构建时烘焙快照保底；浏览器在可用时从 Router 公共端点与 regions 文件刷新。",
        },
      ],
    },
    footer: {
      copyright: "© 2026 TokenSwitch",
      components: "组件",
      regions: "区域",
      security: "安全",
      faq: "FAQ",
      telegram: "Telegram",
      x: "X",
      clientRepo: "cc-switch-server（客户端）",
    },
    lang: { en: "EN", zh: "中文", ja: "日本語" },
    notFound: { title: "页面未找到", back: "返回首页" },
    a11y: { skipToContent: "跳到主要内容" },
  },
  ja: {
    brand: "TokenSwitch",
    tagline: "共有 AI サブスクリプションのグローバルネットワーク",
    nav: {
      network: "ネットワーク",
      markets: "マーケット",
      earn: "収益化",
      docs: "ドキュメント",
      getStarted: "収益化を始める",
      github: "GitHub",
      telegram: "Telegram",
      x: "X",
    },
    hero: {
      title: "AI を共有し、ネットワークを動かす",
      subtitle:
        "Linux サーバーで TokenSwitch クライアントを動かし Share を開いて、遊休の Claude / Codex / Gemini を収益化——またはマーケットでルーティング利用量を購入。",
      linuxNote: "プロバイダーには Linux ホスト（amd64 または arm64）が必要です。",
      ctaJoin: "ネットワークに参加",
      ctaMarkets: "利用者です — マーケットへ",
    },
    install: {
      badge: "install",
      linuxNote: "Linux（amd64 / arm64）ワンラインインストール。",
      region: "リージョン",
      email: "オーナーメール",
      emailPlaceholder: "you@example.com",
      password: "Web UI パスワード",
      passwordPlaceholder: "パスワードを設定",
      passwordHint: "プロバイダーノードの Web UI ログイン用。このサイトには送信されません。",
      copy: "インストールコマンドをコピー",
      copied: "コピー済み",
      pasteHint: "Linux サーバーに貼り付けて実行してください。",
      unavailable: "このリージョンは現在到達できません。別のリージョンを選んでください。",
      moreWays: "その他のインストール方法",
    },
    stats: {
      regions: "リージョン",
      servers: "サーバー",
      connections: "接続",
      shares: "Share",
      live: "ライブ",
      snapshot: "スナップショット",
    },
    ecosystem: {
      title: "4 つのコンポーネント、1 つのネットワーク",
      subtitle: "TokenSwitch はエコシステムブランド。オープンソースのクライアントランタイムは cc-switch-server です。",
      client: {
        title: "Client",
        desc: "Linux プロバイダーランタイム + Web UI。プロバイダー、Share、トンネルを管理。",
        cta: "インストール",
      },
      router: {
        title: "Router",
        desc: "グローバルエッジルーティング、SSH トンネル、Share ACL。",
        cta: "ネットワーク",
      },
      tokenMarket: {
        title: "Token Market",
        desc: "トークン従量 API、プラットフォーム決済。",
        cta: "利用量を購入",
      },
      shareMarket: {
        title: "Share Market",
        desc: "固定期間アクセス＆相乗り——非保管。",
        cta: "リスティングを見る",
      },
    },
    howItWorks: {
      title: "ネットワークの仕組み",
      subtitle:
        "プロバイダーは自分が制御するサーバーでクライアントを実行。Router がトラフィックをルーティング。Market が利用者と接続——上流キーはプロバイダーノードに留まります。",
      steps: [
        {
          bold: "共有。",
          text: "クライアントをインストールし、Router に登録して出方向 SSH トンネルを開く。",
        },
        {
          bold: "ルート。",
          text: "公開リクエストは Router サブドメインに当たり、トンネル経由でノードへプロキシ。",
        },
        {
          bold: "収益。",
          text: "Token Market（従量）または Share Market（期間）に出品して収益を得る。",
        },
      ],
      labels: {
        tunnel: "SSH トンネル",
        request: "API リクエスト",
        response: "レスポンス",
      },
      nodes: {
        client: "client",
        clientCap: "プロバイダーノード",
        router: "router",
        routerCap: "グローバルエッジ",
        market: "market",
        marketCap: "課金レイヤ",
        consumer: "利用者",
        consumerCap: "どこでも",
      },
    },
    earn: {
      title: "プロバイダー収益フロー",
      subtitle: "Token Market では $1.00 の利用のうち約 $0.85 が手数料控除後にプロバイダーへ。",
      breakdown: "Market 10% · Router 5% · すべて ledger 記録",
      cta: "収益化を始める",
    },
    map: {
      title: "ライブネットワーク",
      subtitle: "リージョンノードをクリックしてネットワークを探索。",
      clients: (n: number) => `${n} クライアント`,
      legendServer: "Router",
      legendClient: "Provider（国別集計）",
    },
    network: {
      title: "ネットワーク",
      subtitle: "プロバイダートンネルが接続し Share が稼働するリアルタイムエッジノード。",
      healthy: "正常",
      down: "ダウン",
      latency: "レイテンシ",
      clients: "オンラインクライアント",
      dashboard: "ダッシュボード",
      tokenMarket: "Token Market",
      shareMarket: "Share Market",
      selfHost: "独自リージョンを運用",
      selfHostDesc: "独自ドメインに cc-switch-router をデプロイし、オープンネットワークに参加。",
      selfHostCta: "Router デプロイドキュメント",
      loading: "リージョン読み込み中…",
    },
    download: {
      title: "クライアントをインストール",
      subtitle:
        "TokenSwitch クライアントは cc-switch-server——組み込み Web UI 付き Linux プロバイダーランタイムです。デスクトップ版は終了しました。",
      scriptTitle: "推奨：ワンラインインストール",
      scriptDesc: "ホームページのインストールカードを使うか、同じ手順でコマンドをコピー。",
      goInstall: "インストールカードを開く",
      binaryTitle: "Linux バイナリ",
      binaryDesc: "インストールスクリプトを使えない場合は GitHub Releases から amd64 / arm64 バイナリを取得。",
      version: "バージョン",
      downloadBtn: "ダウンロード",
      allReleases: "GitHub の全リリース",
      afterDownload: "次は？",
      paths: [
        { title: "個人利用", desc: "Claude、Codex、Gemini CLI をプロバイダーノードに向ける。" },
        { title: "友人と共有", desc: "Free またはプライベート Share、メールホワイトリスト。" },
        { title: "収益化", desc: "Token Market または Share Market に出品。", href: "earn" },
      ],
    },
    earnPage: {
      title: "サブスクを収益に",
      subtitle: "遊休の Claude、Codex、Gemini アクセスを収益化する 2 つの方法。",
      compareTitle: "モデルを選ぶ",
      tokenMarket: "Token Market",
      shareMarket: "Share Market",
      rows: {
        billing: { label: "課金", token: "トークン従量、自動控除", share: "固定期間 / 相乗り価格" },
        payout: { label: "支払い", token: "プラットフォーム決済、Gate.io 自動出金", share: "購入者が直接支払い" },
        fee: { label: "手数料", token: "Market 10% + Router 5%", share: "非保管——プラットフォーム手数料なし" },
        fit: { label: "向いている人", token: "受動的収入、交渉不要", share: "カスタム価格、コミュニティ取引" },
      },
      steps: {
        title: "4 ステップで開始",
        items: [
          "Linux ホストにクライアント（cc-switch-server）をインストール。",
          "セットアップを完了し、Router でオーナーメールを紐付け。",
          "Share を作成し Token Market または Share Market を選択。",
          "マーケットダッシュボードで収益を確認。",
        ],
      },
    },
    marketsPage: {
      title: "マーケット",
      subtitle: "リージョン横断で AI 利用量または固定期間アクセスを購入。",
      tokenTitle: "Token Market",
      tokenDesc: "OpenAI / Anthropic 互換 API。残高チャージ、API キー取得、トークン従量課金。",
      shareTitle: "Share Market",
      shareDesc: "固定期間 Share アクセスまたは相乗りを購入。チャットでオーナーに直接支払い。",
      pickRegion: "リージョンを選択",
      open: "開く",
      comingSoon: "近日公開",
      stats: {
        onlineShares: "オンライン Share",
        listings: "アクティブリスティング",
        models: "人気モデル",
      },
    },
    securityPage: {
      title: "トラストセンター",
      subtitle: "TokenSwitch がプロバイダー、利用者、プラットフォーム境界をどう保護するか。",
      provider: {
        title: "プロバイダー",
        items: [
          "上流 API キーはプロバイダーノードに留まり、マーケットや本サイトには送られません。",
          "Share はメタデータのみ同期——Router はサブドメインと ACL のみ保存。",
          "Token Market 収益は ledger 記録、出金は監査可能。",
        ],
      },
      consumer: {
        title: "利用者",
        items: [
          "Token Market API キーはマーケット発行、プロバイダーキーとは別。",
          "利用量はダッシュボードで可視化・照合可能。",
          "Share Market：オーナーが支払い確認後にアクセス付与。",
        ],
      },
      platform: {
        title: "プラットフォーム境界",
        items: [
          "Share Market は資金を預からず、送金を検証せず、返金を保証しません。",
          "Router はルーティングと ACL の信頼境界——決済処理者ではありません。",
          "Token Market は複式 ledger、Admin は残高を黙って変更できません。",
        ],
      },
    },
    faqPage: {
      title: "FAQ",
      items: [
        {
          q: "公式 Claude / Codex API との違いは？",
          a: "利用者はプロバイダー Share 経由でルーティングアクセスを購入。プロバイダーはノード上にサブスクとキーを保持。ネットワークがルーティングと（Token Market では）課金を担当。",
        },
        {
          q: "共有で BAN される？",
          a: "上流プロバイダー規約の遵守は自己責任。TokenSwitch はトラフィックをルーティングするだけで、ポリシー回避はしません。",
        },
        {
          q: "Free Share とは？",
          a: "forSale=Free の公開 Share。Router は Free Share に IP あたり同時接続制限を設ける場合があります。",
        },
        {
          q: "Token Market の出金は？",
          a: "収益はプロバイダー残高に計上。Gate.io 自動出金または手動チケットで他の方法も可能。",
        },
        {
          q: "Share Market の相乗りは？",
          a: "リスティングは複数席（デフォルト 3）と 24 時間成約ウィンドウ。オーナーが支払い確認後にアクセス付与。",
        },
        {
          q: "Share Market はお金を預かる？",
          a: "いいえ。購入者はオーダーチャットでオーナーに直接支払い。プラットフォームはオーナー確認後に Router ACL grant をトリガーするのみ。",
        },
        {
          q: "クライアントと TokenSwitch の関係は？",
          a: "TokenSwitch はネットワーク/エコシステムブランド。プロバイダークライアントランタイムは cc-switch-server（デスクトップ版 cc-switch は終了）。",
        },
        {
          q: "パブリック IP は必要？",
          a: "不要。クライアントは SSH リバーストンネルで Router に接続。",
        },
        {
          q: "Router を自前ホストできる？",
          a: "はい。独自ドメインに cc-switch-router をデプロイ。DNS、TLS、マーケット登録はドキュメント参照。",
        },
        {
          q: "ライブネットワークデータの出所は？",
          a: "ビルド時にスナップショットをベイクし、利用可能なら Router 公開エンドポイントと regions ファイルから更新。",
        },
      ],
    },
    footer: {
      copyright: "© 2026 TokenSwitch",
      components: "コンポーネント",
      regions: "リージョン",
      security: "セキュリティ",
      faq: "FAQ",
      telegram: "Telegram",
      x: "X",
      clientRepo: "cc-switch-server（クライアント）",
    },
    lang: { en: "EN", zh: "中文", ja: "日本語" },
    notFound: { title: "ページが見つかりません", back: "ホームに戻る" },
    a11y: { skipToContent: "本文へスキップ" },
  },
} as const;

export function getDict(locale: Locale): Dict {
  return dict[locale];
}

export function localePath(locale: Locale, path = ""): string {
  const base = `/${locale}`;
  if (!path || path === "/") return `${base}/`;
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}/${clean}${clean.endsWith("/") ? "" : "/"}`;
}

export function switchLocalePath(currentLocale: Locale, target: Locale, pathname: string): string {
  const rest = pathname.replace(new RegExp(`^/${currentLocale}`), "") || "/";
  return localePath(target, rest === "/" ? "" : rest.replace(/^\//, ""));
}
