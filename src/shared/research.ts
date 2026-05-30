export type CostType = "free" | "freemium" | "paid" | "enterprise" | "brokerage";
export type TrailingStopSupport = "yes" | "partial" | "emulated" | "unknown" | "no";

export interface DataProvider {
  id: string;
  name: string;
  category: string;
  assets: string[];
  dataTypes: string[];
  aiReadyFormats: string[];
  freeTier: string;
  paidFrom: string;
  realtime: string;
  bestFor: string;
  limitations: string;
  sourceUrl: string;
  priority: "core" | "strong" | "optional" | "enterprise";
}

export interface BrokerApi {
  id: string;
  name: string;
  region: string;
  assets: string[];
  apiStyle: string;
  automaticTrading: boolean;
  nativeTrailingStop: TrailingStopSupport;
  sandbox: string;
  pricing: string;
  bestFor: string;
  limitations: string;
  setup: string;
  sourceUrl: string;
  adapterStatus: "preview-ready" | "paper-ready" | "excel-or-local" | "planned";
}

export interface StrategyMethod {
  id: string;
  name: string;
  family: string;
  signals: string[];
  requiredData: string[];
  defaultHorizon: "intraday" | "swing" | "long" | "multi";
  automationLevel: "low" | "medium" | "high";
  strengths: string;
  risks: string;
  uiPreset: string;
}

export const marketDataProviders: DataProvider[] = [
  {
    id: "alpha-vantage",
    name: "Alpha Vantage",
    category: "株価・FX・暗号資産・指標・ニュース",
    assets: ["US equities", "global equities", "ETF", "FX", "crypto", "commodities", "macro"],
    dataTypes: ["historical prices", "intraday", "fundamentals", "technical indicators", "news sentiment", "options"],
    aiReadyFormats: ["JSON", "CSV", "Excel", "MCP"],
    freeTier: "無料枠あり。公式サポートFAQでは多くのデータセットが1日25リクエストまで利用可能。",
    paidFrom: "Premiumはおおむね$49.99/月から。上位はリクエスト頻度増。",
    realtime: "米国リアルタイム・一部イントラデイはプレミアム対象。",
    bestFor: "AIエージェントから広い資産クラスを一括で読む最初のデータ源。",
    limitations: "無料枠は実運用には少ない。取引所由来のリアルタイムデータは規制・契約条件に注意。",
    sourceUrl: "https://www.alphavantage.co/",
    priority: "core"
  },
  {
    id: "finnhub",
    name: "Finnhub",
    category: "株価・ファンダメンタル・代替データ",
    assets: ["US equities", "global equities", "FX", "crypto", "economic data"],
    dataTypes: ["quotes", "candles", "company fundamentals", "earnings", "estimates", "news", "alternative data"],
    aiReadyFormats: ["JSON", "WebSocket"],
    freeTier: "無料プランあり。個人利用中心。",
    paidFrom: "個別データパッケージや有料プランは月額$49.99前後から、企業向けは高額。",
    realtime: "リアルタイム株価・WebSocket系あり。市場・契約により制限。",
    bestFor: "株価、企業情報、ニュース、経済データを同じAPI体系で取得。",
    limitations: "無料枠・商用利用・国際市場はライセンス条件確認が必要。",
    sourceUrl: "https://finnhub.io/pricing",
    priority: "strong"
  },
  {
    id: "financial-modeling-prep",
    name: "Financial Modeling Prep (FMP)",
    category: "決算書・株価・スクリーナー",
    assets: ["US equities", "global equities", "ETF", "crypto", "FX"],
    dataTypes: ["income statement", "balance sheet", "cash flow", "ratios", "prices", "calendar", "screeners"],
    aiReadyFormats: ["JSON", "CSV"],
    freeTier: "無料枠あり。公式料金表ではFree/Basicがあり、呼び出し数制限あり。",
    paidFrom: "$19/月、$49/月、$99/月などの個人向けプランが表示される。",
    realtime: "上位プランでリアルタイムや高頻度取得。",
    bestFor: "AI決算分析、財務指標、スクリーニング。",
    limitations: "商用・再配信・リアルタイムは契約確認が必要。",
    sourceUrl: "https://site.financialmodelingprep.com/pricing-plans",
    priority: "core"
  },
  {
    id: "massive-polygon",
    name: "Massive / Polygon market data",
    category: "米国株・オプション・FX・暗号資産のマーケットデータ",
    assets: ["US equities", "options", "indices", "FX", "crypto"],
    dataTypes: ["trades", "quotes", "aggregates", "tick", "reference", "fundamentals", "corporate actions"],
    aiReadyFormats: ["JSON", "CSV", "WebSocket"],
    freeTier: "無料のBasic枠あり。",
    paidFrom: "Stocks Starter $29/月、Developer $79/月、Advanced $199/月など。",
    realtime: "プランによりリアルタイム、WebSocket、履歴範囲が変わる。",
    bestFor: "米国市場の実運用に近い価格データ、板・約定・集計足。",
    limitations: "取引所データの利用目的、個人/商用、再配信制限に注意。",
    sourceUrl: "https://massive.com/pricing",
    priority: "core"
  },
  {
    id: "twelve-data",
    name: "Twelve Data",
    category: "グローバル株価・FX・暗号資産・テクニカル指標",
    assets: ["global equities", "ETF", "FX", "crypto", "commodities", "indices"],
    dataTypes: ["time series", "technical indicators", "fundamentals", "WebSocket", "reference"],
    aiReadyFormats: ["JSON", "CSV", "WebSocket", "SDK"],
    freeTier: "Basic無料枠。サポート情報では8 credits/min、800/dayの目安。",
    paidFrom: "Growは$29/月から。",
    realtime: "US、FX、暗号資産のリアルタイム対応。市場により遅延。",
    bestFor: "多国籍銘柄とテクニカル指標を手早く統合。",
    limitations: "クレジット制のため複数銘柄一括取得時は消費量管理が必要。",
    sourceUrl: "https://twelvedata.com/pricing",
    priority: "strong"
  },
  {
    id: "tiingo",
    name: "Tiingo",
    category: "EOD株価・ニュース・暗号資産",
    assets: ["US equities", "ETF", "crypto", "news"],
    dataTypes: ["EOD", "IEX intraday", "fundamentals", "news", "corporate actions"],
    aiReadyFormats: ["JSON", "REST"],
    freeTier: "Starter無料枠あり。",
    paidFrom: "個人向けPower $30/月、年払い$300など。",
    realtime: "IEXベースのイントラデイなど。リアルタイム本番は契約確認。",
    bestFor: "品質重視のEOD・ニュース連携。",
    limitations: "超高速トレードや板情報よりも研究・分析向け。",
    sourceUrl: "https://www.tiingo.com/pricing",
    priority: "strong"
  },
  {
    id: "eodhd",
    name: "EODHD",
    category: "EOD・ファンダメンタル・リアルタイム・ニュース",
    assets: ["global equities", "ETF", "funds", "options", "FX", "crypto"],
    dataTypes: ["EOD", "intraday", "fundamentals", "live prices", "WebSocket", "options", "news"],
    aiReadyFormats: ["JSON", "CSV", "WebSocket", "Python library"],
    freeTier: "無料プランあり。EODの履歴深度は無料だと限定的。",
    paidFrom: "包括的なデータアクセスは$19.99/月からと案内。オプションAPIなどは別価格。",
    realtime: "Live/Delayed、WebSocketあり。市場により遅延。",
    bestFor: "世界株のEOD、ファンダメンタル、ニュースを一体で保存。",
    limitations: "リアルタイムやオプションは追加プランが必要。",
    sourceUrl: "https://eodhd.com/",
    priority: "strong"
  },
  {
    id: "nasdaq-data-link",
    name: "Nasdaq Data Link",
    category: "金融・代替・経済データマーケットプレイス",
    assets: ["equities", "futures", "fundamentals", "alternative data", "macro"],
    dataTypes: ["datasets", "time series", "tables", "bulk data", "Excel add-in"],
    aiReadyFormats: ["API", "Python SDK", "R", "Excel"],
    freeTier: "無料データセットと無料トライアルあり。",
    paidFrom: "データセットごとの個別価格。多くは有料・問い合わせ。",
    realtime: "Nasdaq Data Link Real-Timeなどデータセットに依存。",
    bestFor: "代替データや専門データの調達。",
    limitations: "価格・権利がデータセット単位。大量利用は契約管理が必要。",
    sourceUrl: "https://docs.data.nasdaq.com/",
    priority: "optional"
  },
  {
    id: "sec-edgar",
    name: "SEC EDGAR APIs",
    category: "米国開示・XBRL・ファンダメンタル原データ",
    assets: ["US equities", "SEC registrants"],
    dataTypes: ["submissions", "companyfacts", "XBRL facts", "filing metadata"],
    aiReadyFormats: ["JSON", "XBRL", "bulk files"],
    freeTier: "無料。SEC公式API。",
    paidFrom: "無料。商用サービスが加工データを有料提供する場合あり。",
    realtime: "提出後の開示取得。秒単位売買よりファンダメンタル分析向け。",
    bestFor: "10-K/10-Q/8-K、財務項目、原典ベースのAI決算分析。",
    limitations: "User-Agent設定、アクセスマナー、XBRLタグ名寄せが必要。",
    sourceUrl: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
    priority: "core"
  },
  {
    id: "j-quants",
    name: "J-Quants API",
    category: "日本株・財務・JPX公式データ",
    assets: ["Japan equities", "TOPIX", "indices", "derivatives", "short selling", "margin"],
    dataTypes: ["daily OHLCV", "financial summary", "listed issues", "trading calendar", "margin", "short selling", "dividends", "BS/PL/CF"],
    aiReadyFormats: ["JSON", "CSV on paid plans", "CLI"],
    freeTier: "Free ¥0。APIのみ。取得期間はプランにより制限。",
    paidFrom: "Light ¥1,650/月、Standard ¥3,300/月、Premium上位。TDnet文書アドオンは月額¥11,000。",
    realtime: "無料・通常プランは主に履歴/日次。TDnetアドオンは数分〜数十分遅延の適時開示取得。",
    bestFor: "日本株バックテスト、財務分析、JPX公式データ。",
    limitations: "FreeはCSV不可・期間制限。リアルタイム発注データではない。",
    sourceUrl: "https://jpx-jquants.com/",
    priority: "core"
  },
  {
    id: "edinet",
    name: "EDINET API",
    category: "日本の有価証券報告書・XBRL",
    assets: ["Japan public companies", "funds"],
    dataTypes: ["filing list", "documents", "XBRL", "PDF", "metadata"],
    aiReadyFormats: ["JSON", "XBRL", "ZIP", "PDF"],
    freeTier: "無料。金融庁EDINET公式。",
    paidFrom: "無料。加工・名寄せサービスは別途有料の可能性。",
    realtime: "開示文書取得。決算短信の即時性はTDnet/J-Quantsアドオンも検討。",
    bestFor: "日本語有報、注記、監査、セグメント情報のAI解析。",
    limitations: "XBRLの名寄せ、会計基準差、文脈ID処理が必要。",
    sourceUrl: "https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/WZEK0110.html",
    priority: "core"
  },
  {
    id: "tdnet-api",
    name: "JPX TDnet API Service",
    category: "日本適時開示",
    assets: ["Japan listed companies"],
    dataTypes: ["timely disclosure", "PDF", "XBRL", "index"],
    aiReadyFormats: ["API", "PDF", "XBRL"],
    freeTier: "JPXの有料情報サービス。J-Quants TDnet文書アドオン経由の個人向け選択肢も登場。",
    paidFrom: "J-Quants TDnet文書アドオンは月額¥11,000。TDnet API本体は個別契約。",
    realtime: "適時開示を直接配信。J-Quantsアドオンは数分〜数十分程度の遅延を想定。",
    bestFor: "決算短信・修正・IRイベント駆動の日本株分析。",
    limitations: "料金・用途・再配信条件の確認が必要。",
    sourceUrl: "https://www.jpx.co.jp/english/markets/paid-info-listing/tdnet/02.html",
    priority: "strong"
  },
  {
    id: "fred",
    name: "FRED API",
    category: "米国マクロ経済",
    assets: ["macro", "rates", "inflation", "labor", "GDP", "credit"],
    dataTypes: ["economic time series", "releases", "categories", "vintage data"],
    aiReadyFormats: ["JSON", "XML"],
    freeTier: "無料APIキーが必要。",
    paidFrom: "無料。",
    realtime: "経済指標更新に追随。市場データではない。",
    bestFor: "金利、CPI、雇用、景気レジームを戦略選定に使う。",
    limitations: "APIキー管理と指標の改定履歴に注意。",
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/overview.html",
    priority: "core"
  },
  {
    id: "world-bank",
    name: "World Bank Indicators API",
    category: "国際マクロ・国別データ",
    assets: ["macro", "country indicators"],
    dataTypes: ["time series indicators", "country metadata", "development indicators"],
    aiReadyFormats: ["JSON", "XML"],
    freeTier: "無料。約16,000系列の指標にアクセス可能。",
    paidFrom: "無料。",
    realtime: "低頻度。長期ファンダメンタル・国別分析向け。",
    bestFor: "海外ETF、国別配分、マクロレジーム分析。",
    limitations: "更新頻度は高くない。短期売買より中長期配分向け。",
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    priority: "optional"
  },
  {
    id: "oecd-sdmx",
    name: "OECD SDMX API",
    category: "先進国マクロ・統計",
    assets: ["macro", "country indicators"],
    dataTypes: ["SDMX data", "economic statistics", "metadata"],
    aiReadyFormats: ["SDMX", "JSON", "CSV"],
    freeTier: "無料。OECD公式API。",
    paidFrom: "無料。",
    realtime: "低頻度。マクロ分析向け。",
    bestFor: "景気循環、国別ファクター、金利・インフレ分析。",
    limitations: "SDMXのキー構造理解が必要。",
    sourceUrl: "https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html",
    priority: "optional"
  },
  {
    id: "coingecko",
    name: "CoinGecko API",
    category: "暗号資産マーケットデータ",
    assets: ["crypto", "DEX", "NFT", "exchanges"],
    dataTypes: ["prices", "market cap", "volume", "historical", "exchange data", "on-chain categories"],
    aiReadyFormats: ["JSON"],
    freeTier: "Demo無料。公式料金では100 calls/min、月10,000 callsの無料枠。",
    paidFrom: "$35/月から。",
    realtime: "価格・市場データ。取引所別の約定や発注APIではない。",
    bestFor: "暗号資産の横断スクリーニングとAI分析。",
    limitations: "実売買は取引所APIかCCXTと組み合わせる。",
    sourceUrl: "https://www.coingecko.com/en/api/pricing",
    priority: "core"
  },
  {
    id: "coinmarketcap",
    name: "CoinMarketCap API",
    category: "暗号資産マーケットデータ",
    assets: ["crypto", "DEX", "exchanges"],
    dataTypes: ["latest quotes", "historical", "metadata", "market pairs", "DEX data"],
    aiReadyFormats: ["JSON"],
    freeTier: "Basic無料。",
    paidFrom: "Hobbyist $29/月、Startup $79/月、Standard $299/月、Professional $699/月など。",
    realtime: "多くのプランで高頻度更新。履歴範囲はプラン依存。",
    bestFor: "時価総額ランキング、セクター、トークン発見。",
    limitations: "完全履歴や商用は上位プラン。実売買APIではない。",
    sourceUrl: "https://coinmarketcap.com/api/pricing/",
    priority: "strong"
  },
  {
    id: "cryptocompare",
    name: "CryptoCompare",
    category: "暗号資産データ・ニュース",
    assets: ["crypto", "exchanges", "news"],
    dataTypes: ["prices", "histominute", "histoday", "exchange data", "news", "indices"],
    aiReadyFormats: ["JSON", "WebSocket"],
    freeTier: "無料キーあり。商用・高負荷は有料。",
    paidFrom: "商用プランは個別または有料プラン。RapidAPI経由の無料枠もあり。",
    realtime: "ストリーミング/低遅延データあり。",
    bestFor: "暗号資産ニュース、価格、取引所横断データ。",
    limitations: "公式料金の表示・契約条件は用途ごとに確認。",
    sourceUrl: "https://www.cryptocompare.com/coins/guides/how-to-use-our-api/",
    priority: "optional"
  },
  {
    id: "ccxt",
    name: "CCXT",
    category: "暗号資産取引所の統一APIライブラリ",
    assets: ["crypto exchanges"],
    dataTypes: ["market data", "balances", "orders", "trades", "positions"],
    aiReadyFormats: ["JavaScript", "TypeScript", "Python", "PHP", "Go", "C#"],
    freeTier: "OSSライブラリは無料。取引所側の手数料・制限は別。",
    paidFrom: "CCXT ProなどWebSocket系は有料の場合あり。",
    realtime: "RESTは取引所依存。WebSocketはCCXT Proまたは取引所SDK。",
    bestFor: "複数暗号資産取引所の売買・残高・注文を統一する。",
    limitations: "取引所ごとに注文型・トレーリング対応差があるためadapter別検証が必要。",
    sourceUrl: "https://github.com/ccxt/ccxt",
    priority: "core"
  },
  {
    id: "newsapi",
    name: "News API",
    category: "一般ニュースAPI",
    assets: ["news", "sentiment input"],
    dataTypes: ["top headlines", "everything search", "sources"],
    aiReadyFormats: ["JSON"],
    freeTier: "Developer $0。開発用途、100 requests/day、記事遅延あり。",
    paidFrom: "Business $449/月など。",
    realtime: "無料は制限あり。商用は有料。",
    bestFor: "銘柄名・テーマのニュース収集、AI要約、センチメント前処理。",
    limitations: "無料枠は商用不可/制限あり。金融専用ではない。",
    sourceUrl: "https://newsapi.org/pricing",
    priority: "optional"
  },
  {
    id: "gdelt",
    name: "GDELT Project",
    category: "グローバルニュース・イベント",
    assets: ["news", "geopolitics", "sentiment"],
    dataTypes: ["DOC 2.0", "events", "GKG", "TV", "BigQuery export"],
    aiReadyFormats: ["JSON", "CSV", "BigQuery", "raw files"],
    freeTier: "100% free and open。",
    paidFrom: "無料。BigQuery利用料は利用側で発生する可能性。",
    realtime: "ほぼリアルタイムに近いグローバルニュース監視に使える。",
    bestFor: "地政学、テーマ、国際ニュースを投資シグナル化。",
    limitations: "金融専用ニュースではないためノイズ除去が重要。",
    sourceUrl: "https://www.gdeltproject.org/data.html",
    priority: "strong"
  },
  {
    id: "benzinga",
    name: "Benzinga APIs",
    category: "金融ニュース・アナリスト・決算・センチメント",
    assets: ["US equities", "crypto", "news", "analyst ratings", "earnings"],
    dataTypes: ["stock news", "earnings", "analyst insights", "ratings", "transcripts", "why moving"],
    aiReadyFormats: ["API", "FTP", "TCP", "JSON"],
    freeTier: "Free API Key/サンプル案内あり。商用は問い合わせ。",
    paidFrom: "多くは問い合わせ/法人向け。",
    realtime: "市場向けニュース配信。",
    bestFor: "ニュース駆動、決算イベント、アナリスト改定の自動検出。",
    limitations: "価格は公開範囲が限られ、契約確認が必要。",
    sourceUrl: "https://www.benzinga.com/apis/",
    priority: "enterprise"
  },
  {
    id: "stooq",
    name: "Stooq CSV",
    category: "無料EOD株価CSV",
    assets: ["US equities", "Japan equities", "ETF", "indices", "FX"],
    dataTypes: ["daily OHLCV", "historical CSV"],
    aiReadyFormats: ["CSV"],
    freeTier: "無料でCSV取得可能。既存アプリのデフォルトデータ源。",
    paidFrom: "無料。",
    realtime: "遅延/EOD中心。実売買には不十分。",
    bestFor: "無料バックテスト、教育、デモ。",
    limitations: "公式API契約ではなく、欠損・遅延・銘柄カバレッジに注意。",
    sourceUrl: "https://stooq.com/",
    priority: "optional"
  },
  {
    id: "yfinance",
    name: "Yahoo Finance / yfinance unofficial",
    category: "非公式マーケットデータ",
    assets: ["global equities", "ETF", "FX", "crypto"],
    dataTypes: ["prices", "financials", "actions", "metadata"],
    aiReadyFormats: ["Python", "DataFrame"],
    freeTier: "非公式ライブラリは無料。",
    paidFrom: "公式商用データではない。",
    realtime: "遅延・仕様変更リスクあり。",
    bestFor: "プロトタイプ、研究、補助的なデータ取得。",
    limitations: "本番・商用・高頻度用途ではライセンスと安定性の観点で非推奨。",
    sourceUrl: "https://github.com/ranaroussi/yfinance",
    priority: "optional"
  },
  {
    id: "enterprise-terminal-data",
    name: "Bloomberg / LSEG / FactSet / S&P Capital IQ",
    category: "機関投資家向け総合データ",
    assets: ["multi-asset", "fundamentals", "estimates", "news", "ownership", "analytics"],
    dataTypes: ["terminal APIs", "enterprise feeds", "estimates", "filings", "news", "reference"],
    aiReadyFormats: ["API", "bulk feed", "Excel", "Python connectors"],
    freeTier: "基本的に無料枠なし。",
    paidFrom: "個別見積もり。高額な法人契約。",
    realtime: "機関投資家向けの高品質・低遅延データ。",
    bestFor: "プロ運用、コンプライアンス、再配信、網羅性が必要な場合。",
    limitations: "個人開発の初期費用としては重い。契約・利用範囲管理が必須。",
    sourceUrl: "https://www.lseg.com/en/data-analytics",
    priority: "enterprise"
  }
];

export const brokerApis: BrokerApi[] = [
  {
    id: "interactive-brokers",
    name: "Interactive Brokers (IBKR)",
    region: "Global",
    assets: ["stocks", "options", "futures", "FX", "bonds", "funds"],
    apiStyle: "TWS API / IB Gateway / Client Portal API",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Paper Trading account",
    pricing: "口座・市場データ・取引手数料は地域と商品に依存。API自体は口座利用の一部。",
    bestFor: "本格的なマルチアセット自動売買、海外株・先物・FX。",
    limitations: "TWS/IB Gatewayの稼働、セッション管理、マーケットデータ契約が必要。",
    setup: "IB Gateway/TWSを起動し、API接続許可、Paperで検証後にLiveへ移行。",
    sourceUrl: "https://www.interactivebrokers.com/campus/ibkr-api-page/trader-workstation-api/",
    adapterStatus: "preview-ready"
  },
  {
    id: "alpaca",
    name: "Alpaca Markets",
    region: "US / supported jurisdictions",
    assets: ["stocks", "ETF", "options", "crypto"],
    apiStyle: "REST / WebSocket / SDK",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Paper Trading API",
    pricing: "Brokerage/APIプランと市場データプランに依存。Paperは開発向け。",
    bestFor: "API-firstの米国株・暗号資産自動売買。",
    limitations: "居住国、口座開設条件、PDT、取引時間、データ契約に注意。",
    setup: "Paper APIキーをSecretsへ入れ、発注プレビュー→Paper→Liveの順に有効化。",
    sourceUrl: "https://docs.alpaca.markets/us/docs/orders-at-alpaca",
    adapterStatus: "preview-ready"
  },
  {
    id: "tradestation",
    name: "TradeStation",
    region: "US",
    assets: ["stocks", "options", "futures", "crypto"],
    apiStyle: "REST API / EasyLanguage",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Simulated / brokerage environment",
    pricing: "口座・データ・取引手数料は商品別。API利用条件を確認。",
    bestFor: "米国株・先物・オプションとTradeStation環境の自動化。",
    limitations: "OAuth、口座権限、商品ごとの注文仕様確認が必要。",
    setup: "Developer登録、OAuth設定、Sim環境で注文型を検証。",
    sourceUrl: "https://api.tradestation.com/docs/",
    adapterStatus: "preview-ready"
  },
  {
    id: "charles-schwab",
    name: "Charles Schwab Trader API",
    region: "US",
    assets: ["stocks", "ETF", "options"],
    apiStyle: "Developer Portal / REST",
    automaticTrading: true,
    nativeTrailingStop: "partial",
    sandbox: "Developer app flow",
    pricing: "口座・市場データ・取引条件に依存。",
    bestFor: "旧TD Ameritrade/thinkorswim系の米国株・オプション自動化。",
    limitations: "公式APIでの高度注文対応は実アカウント・ドキュメント確認が必要。UIではトレーリングストップあり。",
    setup: "Schwab Developer Portalでアプリ登録、OAuth、少額/ペーパー相当で検証。",
    sourceUrl: "https://developer.schwab.com/products/trader-api--individual",
    adapterStatus: "planned"
  },
  {
    id: "tradier",
    name: "Tradier",
    region: "US",
    assets: ["stocks", "ETF", "options"],
    apiStyle: "REST API",
    automaticTrading: true,
    nativeTrailingStop: "emulated",
    sandbox: "Sandbox available",
    pricing: "Brokerage/market data/partner termsに依存。",
    bestFor: "米国株・オプションの注文APIを簡潔に使う。",
    limitations: "公式注文型はmarket/limit/stop/stop_limit中心。トレーリングは自前エミュレーションが現実的。",
    setup: "Sandboxで注文・変更・取消をテストし、トレーリングは監視ループで実装。",
    sourceUrl: "https://docs.tradier.com/docs/orders",
    adapterStatus: "preview-ready"
  },
  {
    id: "tastytrade",
    name: "tastytrade Open API",
    region: "US",
    assets: ["stocks", "ETF", "options", "futures", "crypto"],
    apiStyle: "REST / Streamer",
    automaticTrading: true,
    nativeTrailingStop: "unknown",
    sandbox: "Sandbox account",
    pricing: "口座・商品・市場データに依存。",
    bestFor: "オプション中心の自動化、ポジション・注文管理。",
    limitations: "トレーリングストップのAPI対応は要実機確認。未確認時はエミュレーション。",
    setup: "Sandboxでログイン、残高、注文、ストリームを検証。",
    sourceUrl: "https://tastytrade.com/api/",
    adapterStatus: "planned"
  },
  {
    id: "oanda",
    name: "OANDA v20 API",
    region: "Global FX/CFD jurisdictions",
    assets: ["FX", "CFD", "indices", "commodities"],
    apiStyle: "REST / Streaming",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Practice account",
    pricing: "スプレッド、口座条件、地域規制に依存。",
    bestFor: "FXの自動売買、トレーリングストップ付き注文。",
    limitations: "CFD/FXのレバレッジ、地域規制、スリッページリスク。",
    setup: "Practice API tokenで実装後、Live tokenへ切替。",
    sourceUrl: "https://developer.oanda.com/rest-live-v20/order-df/",
    adapterStatus: "preview-ready"
  },
  {
    id: "ig",
    name: "IG API",
    region: "Global where supported",
    assets: ["FX", "CFD", "indices", "commodities", "shares", "crypto CFDs"],
    apiStyle: "REST / Streaming API",
    automaticTrading: true,
    nativeTrailingStop: "partial",
    sandbox: "Demo account",
    pricing: "スプレッド、データ、口座条件に依存。",
    bestFor: "CFD/FXの自動取引とストップ管理。",
    limitations: "地域・商品によってAPI/トレーリング可否が異なるためDemoで検証必須。",
    setup: "Demo APIキー取得、取引チケットでtrailing指定の検証。",
    sourceUrl: "https://labs.ig.com/",
    adapterStatus: "planned"
  },
  {
    id: "kabu-station",
    name: "三菱UFJ eスマート証券 kabuステーションAPI",
    region: "Japan",
    assets: ["Japan stocks", "margin", "futures", "options"],
    apiStyle: "Local REST / PUSH API / Excel add-in",
    automaticTrading: true,
    nativeTrailingStop: "partial",
    sandbox: "検証環境/本番ツール起動が前提",
    pricing: "API利用料は原則無料。取引手数料・信用金利等は商品別。",
    bestFor: "日本株でREST形式の個人向け自動売買。",
    limitations: "kabuステーション起動PCが必要。GUIのトレーリングストップは確認済みだがAPI経由の注文型は都度仕様確認。",
    setup: "kabuステーションAPI利用設定、APIパスワード、localhost接続、少額検証。",
    sourceUrl: "https://kabu.com/company/lp/lp90.html",
    adapterStatus: "preview-ready"
  },
  {
    id: "tachibana-e-shiten",
    name: "立花証券 e支店 API",
    region: "Japan",
    assets: ["Japan stocks", "margin"],
    apiStyle: "REST API",
    automaticTrading: true,
    nativeTrailingStop: "emulated",
    sandbox: "本番口座ベース。検証は少額・非発注モードで実施。",
    pricing: "個人向け日本株APIは無料と案内。取引手数料・金利は別。",
    bestFor: "クラウド/サーバー側から日本株APIを直接呼ぶ構成。",
    limitations: "トレーリングは自前監視でエミュレーション。口座・認証・利用開始条件を確認。",
    setup: "e支店口座、API利用設定、注文発注は最小単位で段階確認。",
    sourceUrl: "https://www.e-shiten.jp/api/",
    adapterStatus: "preview-ready"
  },
  {
    id: "rakuten-rss",
    name: "楽天証券 MarketSpeed II RSS",
    region: "Japan",
    assets: ["Japan stocks", "margin", "futures", "options", "commodity futures"],
    apiStyle: "Excel RSS functions / VBA / macro",
    automaticTrading: true,
    nativeTrailingStop: "partial",
    sandbox: "Excel/PCローカル運用",
    pricing: "ツール利用条件と取引手数料に依存。",
    bestFor: "Excelを中心にした日本株自動売買。",
    limitations: "Python/クラウド直結ではなくExcel/Windows寄り。RSSでのトレーリング注文可否は関数仕様確認。",
    setup: "MarketSpeed IIとRSSアドインを設定し、Excelマクロで発注制御。",
    sourceUrl: "https://marketspeed.jp/ms2_rss/",
    adapterStatus: "excel-or-local"
  },
  {
    id: "sbi-neotrade-excel",
    name: "SBIネオトレード証券 ネオトレAPI for Excel",
    region: "Japan",
    assets: ["Japan stocks", "indices", "FX rates"],
    apiStyle: "Excel add-in / VBA / macro",
    automaticTrading: true,
    nativeTrailingStop: "emulated",
    sandbox: "Excel/PCローカル運用",
    pricing: "無料提供。取引手数料・金利等は別。",
    bestFor: "Excelで情報取得・注文・残高照会まで完結する個人向け運用。",
    limitations: "高度なPC/Excelスキルが必要。トレーリングはVBA側で監視・訂正/発注を組む。",
    setup: "口座開設、利用申請、Excelアドイン、注文上限と確認画面設定。",
    sourceUrl: "https://www.sbineotrade.jp/tool/api/",
    adapterStatus: "excel-or-local"
  },
  {
    id: "moomoo-jp",
    name: "moomoo Japan OpenAPI / API Skill",
    region: "Japan / US stocks",
    assets: ["US stocks"],
    apiStyle: "OpenAPI / AI Skill / agent workflow",
    automaticTrading: true,
    nativeTrailingStop: "unknown",
    sandbox: "デモ取引→本番取引の3段階管理と案内",
    pricing: "利用条件・口座条件に依存。",
    bestFor: "AIエージェントから米国株の分析・デモ・本番取引へつなぐ。",
    limitations: "日本市場では米国株自動売買対応と案内。トレーリングのAPI仕様は要検証。",
    setup: "Moomoo OpenAPI/API Skillの利用条件確認、デモで検証。",
    sourceUrl: "https://www.moomoo.com/jp/newsroom/moomoo-api-skill",
    adapterStatus: "planned"
  },
  {
    id: "gmo-coin-fx",
    name: "GMOコイン 外国為替FX API",
    region: "Japan",
    assets: ["FX"],
    apiStyle: "Public/Private API",
    automaticTrading: true,
    nativeTrailingStop: "emulated",
    sandbox: "本番/トライアル条件確認",
    pricing: "API経由の約定に別途手数料が発生する場合あり。30日無料トライアル案内あり。",
    bestFor: "日本国内のFX API自動売買。",
    limitations: "トレーリングは価格監視と注文変更/取消でエミュレーションする前提。",
    setup: "FX口座、APIキー、Public/Private API、注文通知を設定。",
    sourceUrl: "https://coin.z.com/jp/corp/product/info/fx/api/",
    adapterStatus: "preview-ready"
  },
  {
    id: "binance",
    name: "Binance API",
    region: "Global where supported",
    assets: ["crypto spot", "margin", "futures", "options"],
    apiStyle: "REST / WebSocket / FIX / Testnet",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Spot/Futures testnet",
    pricing: "取引手数料・VIPレベルに依存。API利用自体はキー発行。",
    bestFor: "暗号資産の高頻度データ取得と発注。",
    limitations: "居住国制限、APIキー権限、署名、レート制限、清算リスク。",
    setup: "Testnet APIキー、IP制限、読み取り/取引権限分離、少額でLive検証。",
    sourceUrl: "https://developers.binance.com/docs/binance-spot-api-docs/faqs/trailing-stop-faq",
    adapterStatus: "preview-ready"
  },
  {
    id: "bybit",
    name: "Bybit API",
    region: "Global where supported",
    assets: ["crypto spot", "margin", "perpetual", "futures", "options"],
    apiStyle: "REST / WebSocket / Testnet",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Testnet",
    pricing: "取引手数料・VIPレベルに依存。",
    bestFor: "暗号資産デリバティブのTP/SL/トレーリング制御。",
    limitations: "レバレッジ、強制決済、APIキー権限、地域制限。",
    setup: "TestnetでSet Trading Stopを検証し、ポジション単位のトレーリングを確認。",
    sourceUrl: "https://bybit-exchange.github.io/docs/v5/position/trading-stop",
    adapterStatus: "preview-ready"
  },
  {
    id: "okx",
    name: "OKX API",
    region: "Global where supported",
    assets: ["crypto spot", "margin", "futures", "perpetual", "options"],
    apiStyle: "REST / WebSocket / Demo trading",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "Demo trading",
    pricing: "取引手数料・VIPレベルに依存。",
    bestFor: "暗号資産の高度注文、グリッド/アルゴ注文、トレーリング。",
    limitations: "地域制限、署名、サブアカウント、証拠金設定に注意。",
    setup: "Demoでmove_order_stop/attachAlgoOrds等を検証。",
    sourceUrl: "https://www.okx.com/docs-v5/en/",
    adapterStatus: "preview-ready"
  },
  {
    id: "kraken",
    name: "Kraken API",
    region: "Global where supported",
    assets: ["crypto spot", "margin", "futures"],
    apiStyle: "REST / WebSocket / FIX",
    automaticTrading: true,
    nativeTrailingStop: "yes",
    sandbox: "API key with restricted permissions; demo availability depends on product",
    pricing: "取引手数料・取引量に依存。",
    bestFor: "暗号資産の堅めの取引所APIとトレーリングストップ。",
    limitations: "注文型のrelative price指定、アクティブ注文数制限、商品差に注意。",
    setup: "API key権限を最小化し、trailing-stop/trailing-stop-limitを小口で検証。",
    sourceUrl: "https://docs.kraken.com/api/docs/rest-api/add-order",
    adapterStatus: "preview-ready"
  },
  {
    id: "coinbase-advanced",
    name: "Coinbase Advanced Trade API",
    region: "US / supported jurisdictions",
    assets: ["crypto spot"],
    apiStyle: "REST / WebSocket",
    automaticTrading: true,
    nativeTrailingStop: "unknown",
    sandbox: "Sandbox availability varies by API generation",
    pricing: "取引手数料・地域・商品に依存。",
    bestFor: "主要暗号資産の米国系取引所での売買。",
    limitations: "トレーリングストップはネイティブ対応を要確認。未対応ならエミュレーション。",
    setup: "API key権限を最小化し、market/limit/stop相当から検証。",
    sourceUrl: "https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/overview",
    adapterStatus: "planned"
  }
];

export const strategyLibrary: StrategyMethod[] = [
  { id: "sma-trend", name: "SMA/EMAトレンドフォロー", family: "テクニカル・トレンド", signals: ["短期MA>長期MA", "ADX上昇", "高値更新"], requiredData: ["OHLCV"], defaultHorizon: "swing", automationLevel: "high", strengths: "実装が単純で説明しやすい。トレーリングストップと相性が良い。", risks: "レンジ相場でダマシが多い。", uiPreset: "trend" },
  { id: "rsi-mean-reversion", name: "RSI逆張り", family: "テクニカル・平均回帰", signals: ["RSI<30", "RSI>70", "過去ボラティリティ"], requiredData: ["OHLCV"], defaultHorizon: "swing", automationLevel: "high", strengths: "過熱感のある相場で機能しやすい。", risks: "暴落・急騰トレンドでは損切り必須。", uiPreset: "mean-reversion" },
  { id: "breakout", name: "ドンチャン/高値ブレイクアウト", family: "テクニカル・モメンタム", signals: ["N日高値更新", "出来高増", "ATR"], requiredData: ["OHLCV"], defaultHorizon: "swing", automationLevel: "high", strengths: "大相場に乗りやすい。", risks: "フェイクブレイクに弱い。", uiPreset: "breakout" },
  { id: "volatility-target", name: "ボラティリティターゲット", family: "リスク管理", signals: ["実現ボラ", "ATR", "最大DD"], requiredData: ["OHLCV", "portfolio"], defaultHorizon: "multi", automationLevel: "high", strengths: "資産ごとのリスクを均一化しやすい。", risks: "急変時は過去ボラが遅れる。", uiPreset: "risk" },
  { id: "quality-value", name: "クオリティ・バリュー", family: "ファンダメンタル", signals: ["ROIC", "営業利益率", "PER", "PBR", "FCF利回り"], requiredData: ["financial statements", "prices"], defaultHorizon: "long", automationLevel: "medium", strengths: "長期投資と相性がよく説明可能性が高い。", risks: "バリュートラップと会計データ遅延。", uiPreset: "fundamental" },
  { id: "growth-revision", name: "成長・上方修正", family: "ファンダメンタル・イベント", signals: ["売上成長", "EPS成長", "ガイダンス上方修正", "アナリスト改定"], requiredData: ["fundamentals", "earnings", "news"], defaultHorizon: "long", automationLevel: "medium", strengths: "業績モメンタムを捕捉しやすい。", risks: "期待が高すぎる銘柄は決算後に急落。", uiPreset: "fundamental" },
  { id: "earnings-drift", name: "決算後ドリフト", family: "イベントドリブン", signals: ["決算サプライズ", "出来高", "ギャップ", "ニュース感情"], requiredData: ["earnings calendar", "prices", "news"], defaultHorizon: "swing", automationLevel: "medium", strengths: "決算直後の需給と情報遅延を狙う。", risks: "流動性・スリッページ・発表時刻に敏感。", uiPreset: "event" },
  { id: "news-sentiment", name: "ニュース/センチメント", family: "代替データ・AI", signals: ["ニュース極性", "報道量", "異常トピック", "SNS言及"], requiredData: ["news", "prices", "NLP"], defaultHorizon: "intraday", automationLevel: "medium", strengths: "AI要約と相性が良く、材料検出に強い。", risks: "ノイズ・誤報・遅延・データ権利。", uiPreset: "ai" },
  { id: "pairs-trading", name: "ペアトレード/統計的裁定", family: "クオンツ・平均回帰", signals: ["スプレッドZスコア", "相関", "共和分"], requiredData: ["prices", "borrow costs"], defaultHorizon: "swing", automationLevel: "medium", strengths: "市場中立化しやすい。", risks: "相関崩壊、空売り制約、手数料。", uiPreset: "quant" },
  { id: "sector-rotation", name: "セクターローテーション", family: "マクロ・相対モメンタム", signals: ["セクター相対強度", "金利", "景気指標"], requiredData: ["ETF prices", "macro"], defaultHorizon: "long", automationLevel: "medium", strengths: "ETFで実装しやすく分散しやすい。", risks: "景気局面判定が遅れる。", uiPreset: "macro" },
  { id: "dividend-quality", name: "配当クオリティ", family: "ファンダメンタル・インカム", signals: ["配当利回り", "配当性向", "増配年数", "FCF"], requiredData: ["fundamentals", "dividends"], defaultHorizon: "long", automationLevel: "low", strengths: "長期保有・NISA的な選好に合う。", risks: "減配・金利上昇・セクター偏り。", uiPreset: "income" },
  { id: "low-volatility", name: "低ボラ/最小分散", family: "リスクプレミアム", signals: ["実現ボラ", "β", "相関", "最大DD"], requiredData: ["prices", "portfolio covariance"], defaultHorizon: "long", automationLevel: "medium", strengths: "下落耐性を狙いやすい。", risks: "急上昇相場で劣後。", uiPreset: "risk" },
  { id: "crypto-momentum", name: "暗号資産モメンタム", family: "暗号資産・テクニカル", signals: ["24h/7d momentum", "出来高", "資金調達率", "OI"], requiredData: ["crypto prices", "exchange data", "derivatives"], defaultHorizon: "intraday", automationLevel: "high", strengths: "24/7市場と自動売買に適合。", risks: "レバレッジ・清算・取引所リスクが大きい。", uiPreset: "crypto" },
  { id: "fx-carry-trend", name: "FXキャリー+トレンド", family: "FX・マクロ", signals: ["金利差", "移動平均", "COT/ポジション", "ボラ"], requiredData: ["FX", "rates", "macro"], defaultHorizon: "swing", automationLevel: "medium", strengths: "OANDA/IG/GMO FXと相性が良い。", risks: "介入・急変・スワップ条件変更。", uiPreset: "fx" },
  { id: "ai-ensemble", name: "AIアンサンブル戦略", family: "AI・メタ戦略", signals: ["テクニカル", "ファンダメンタル", "ニュース", "マクロ", "リスク"], requiredData: ["multi-source features", "model registry", "backtest"], defaultHorizon: "multi", automationLevel: "medium", strengths: "ユーザー選択とAI自動選択を両立できる。", risks: "過学習・説明性・データリーク・運用監視が課題。", uiPreset: "ai" }
];

export const researchMetadata = {
  generatedFor: "AI-readable investment data, broker API, auto-trading, trailing stop and strategy research",
  lastVerifiedDate: "2026-05-31",
  providerCount: marketDataProviders.length,
  brokerCount: brokerApis.length,
  strategyCount: strategyLibrary.length,
  workbookFileName: "investing_api_research.xlsx"
};
