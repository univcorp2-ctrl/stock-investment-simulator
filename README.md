# Investment API & Auto Trading Cockpit

株価、暗号資産、FX、決算書、ニュース、マクロ、証券会社APIを横断的に調査し、AIが読みやすい形式で管理するWebアプリです。既存の投資シミュレーターを、API調査DB・Excel自動生成・戦略ビルダー・発注プレビュー・安全ゲート付き自動売買基盤へ上書き実装しました。

> 投資助言ではありません。実注文は `LIVE_TRADING_ENABLED=true` とブローカー別Secretsが設定されるまでサーバー側で遮断されます。まずPaper tradingと少額検証を行ってください。

## 実装済み

- API/データプロバイダー調査DB: Alpha Vantage、Finnhub、FMP、Massive/Polygon、Twelve Data、Tiingo、EODHD、SEC EDGAR、J-Quants、EDINET、TDnet、FRED、World Bank、OECD、CoinGecko、CoinMarketCap、CCXT、News API、GDELT、Benzingaなど
- 自動売買対応ブローカー/取引所DB: IBKR、Alpaca、TradeStation、Schwab、Tradier、tastytrade、OANDA、IG、kabuステーション、立花証券e支店、楽天RSS、SBIネオトレードExcel、moomoo、GMOコインFX、Binance、Bybit、OKX、Krakenなど
- トレーリングストップ対応分類: native / partial / emulated / unknown
- AI戦略プロファイル: リスク許容度、対象資産、時間軸、データ予算、自動化段階から戦略・API・ブローカー候補を推奨
- 発注プレビュー: Alpaca、IBKR、TradeStation、Binance、Bybit、OKX、Kraken、OANDAなどのpayloadを生成
- Excel生成: `dist/research/investing_api_research.xlsx` とCSVをGitHub Actions artifactとして出力
- CI: type check、test、build、Excel artifact upload
- GitHub Pagesデプロイ workflow
- Devcontainer / Codespaces対応

## ローカル起動

```bash
npm install
npm run dev
```

- Web: Viteの表示URL
- API: `http://localhost:3001`
- Research JSON: `http://localhost:3001/api/research`

## Excel調査レポート生成

```bash
npm run excel:research
```

生成物:

- `dist/research/investing_api_research.xlsx`
- `dist/research/API Providers.csv`
- `dist/research/Broker APIs.csv`
- `dist/research/Strategies.csv`
- `dist/research/Secrets.csv`

GitHub Actionsでは `investing-api-research-workbook` artifact として取得できます。

## API

### `GET /api/research`

APIプロバイダー、ブローカー、戦略テンプレートを返します。

### `POST /api/strategy/recommend`

```json
{
  "riskTolerance": "medium",
  "horizon": "swing",
  "assetClass": "equity",
  "dataBudget": "low-cost",
  "automationLevel": "paper",
  "prefersFundamental": true,
  "prefersTechnical": true,
  "prefersNews": true
}
```

### `POST /api/trading/order-preview`

```json
{
  "brokerId": "alpaca",
  "symbol": "AAPL",
  "assetClass": "equity",
  "side": "sell",
  "quantity": 10,
  "orderStyle": "trailing_stop",
  "trailPercent": 3,
  "timeInForce": "gtc",
  "live": false
}
```

### `POST /api/trading/live-order`

本番発注用の入口ですが、現時点では以下の安全設計です。

- `LIVE_TRADING_ENABLED=true` がない場合は403で停止
- ブローカーSecretsが未設定なら送信不可
- 現状はpayload生成とリスク検証まで。実ネットワーク送信adapterは、ユーザーが後から提供する口座/API情報に合わせて個別に有効化します

## 必要Secrets

実値は絶対にリポジトリへ保存しません。

| Secret | 用途 |
|---|---|
| `LIVE_TRADING_ENABLED` | 本番発注ゲート解除。既定はfalse/未設定 |
| `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` | Alpaca paper/live routing |
| `IBKR_GATEWAY_HOST` / `IBKR_GATEWAY_PORT` | IBKR Gateway/TWS |
| `BINANCE_API_KEY` / `BINANCE_API_SECRET` | Binance signed orders |
| `JQUANTS_API_KEY` | J-Quantsデータ取得 |
| `FMP_API_KEY` / `FINNHUB_API_KEY` / `ALPHAVANTAGE_API_KEY` | 有料/無料データ取得 |

## 本番URL

GitHub Pages workflowを追加済みです。初回のPagesデプロイが成功すると、通常は次のURLで静的UIを確認できます。

`https://univcorp2-ctrl.github.io/stock-investment-simulator/`

APIサーバーと実注文adapterを本番で動かすには、別途Render/Fly.io/Railway/AWS/VPS等へExpress APIをデプロイし、Secretsを設定してください。GitHub Pagesは静的ホスティングのため、実注文APIの常駐実行には使いません。

## テスト

```bash
npm test
npm run build
```

## アーキテクチャ

詳細は [`docs/architecture.md`](docs/architecture.md) を参照してください。
