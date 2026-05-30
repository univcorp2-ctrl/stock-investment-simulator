# Setup Guide

## 1. 開発環境

```bash
npm install
npm run dev
```

Codespacesを使う場合は、このリポジトリを開くだけでdevcontainerがNode 20環境を用意します。

## 2. 調査Excelを作る

```bash
npm run excel:research
```

`dist/research/investing_api_research.xlsx` が生成されます。

## 3. GitHub Actions artifactからExcelを取得

1. GitHubリポジトリの Actions を開く
2. `CI` workflow の最新runを開く
3. Artifacts の `investing-api-research-workbook` をダウンロード
4. xlsxとCSVを確認

## 4. GitHub Pages

`.github/workflows/deploy-pages.yml` を追加済みです。Actionsが成功すると、PagesのURLは通常以下です。

`https://univcorp2-ctrl.github.io/stock-investment-simulator/`

GitHub Pagesは静的UIのみです。Express APIは含まれません。

## 5. 本番APIを動かす場合

Render/Fly.io/Railway/AWSなどでNodeプロセスを常駐させます。

```bash
npm install
npm run build
npm run dev:server
```

本番では `tsx watch` ではなく、Nodeで実行できるサーバービルドへ分けるか、Docker化してください。次の改修候補です。

## 6. Secrets

Secretsの実値は絶対にコミットしません。

- `LIVE_TRADING_ENABLED`
- `ALPACA_API_KEY`
- `ALPACA_SECRET_KEY`
- `BINANCE_API_KEY`
- `BINANCE_API_SECRET`
- `JQUANTS_API_KEY`
- `FINNHUB_API_KEY`
- `FMP_API_KEY`
- `ALPHAVANTAGE_API_KEY`

## 7. Live発注への移行手順

1. Paper tradingで最低30日動かす
2. 注文プレビューのpayloadをブローカー公式Sandboxで検証
3. 1銘柄最大比率、1日最大損失、最大注文金額を設定
4. APIキーを読み取り専用と取引用に分ける
5. IP制限と出金権限無効化を設定
6. `LIVE_TRADING_ENABLED=true` を本番環境だけに設定
7. 少額で1注文ずつ検証
8. 監視と停止スイッチを入れてから自動化
