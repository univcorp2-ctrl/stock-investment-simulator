# Investment API & Auto Trading Cockpit

株価、暗号資産、FX、決算書、ニュース、マクロ、証券会社APIを横断的に調査し、AIが読みやすい形式で管理するWebアプリです。既存の投資シミュレーターを、API調査DB・Excel自動生成・戦略ビルダー・発注プレビュー・安全ゲート付き自動売買基盤へ置き換えています。

投資助言ではありません。実注文は `LIVE_TRADING_ENABLED=true` とブローカー別Secretsが設定されるまでサーバー側で遮断されます。

## 主な機能

- API/データプロバイダー調査DB
- 国内外ブローカー/暗号資産取引所API調査DB
- トレーリングストップ対応分類
- AI戦略プロファイルから戦略/API/ブローカーを推奨
- ブローカー別発注payloadプレビュー
- Excel/CSV調査レポート自動生成
- GitHub Actions CIとPages deploy
- Docker/Render向けAPI本番雛形

## 起動

```bash
npm install
npm run dev
```

## Excel調査レポート

```bash
npm run excel:research
```

生成物: `dist/research/investing_api_research.xlsx`

CIでは `investing-api-research-workbook` artifact としてExcel/CSVをアップロードします。

## API

- `GET /api/health`
- `GET /api/research`
- `POST /api/strategy/recommend`
- `POST /api/trading/order-preview`
- `POST /api/trading/live-order` 既定では403で停止

## 本番URL

GitHub Pages workflow成功後、静的UIは通常ここで確認できます。

`https://univcorp2-ctrl.github.io/stock-investment-simulator/`

実発注APIはGitHub Pagesでは常駐できないため、Docker/Render/Fly.io/Railway/AWS等へAPIをデプロイしてください。`render.yaml` と `Dockerfile` を同梱済みです。

## Secrets

実値はコミットしません。`.env.example` を参照してください。

## アーキテクチャ

詳細は `docs/architecture.md` と `docs/production.md` を参照してください。
