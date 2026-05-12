# Stock Investment Simulator

実際の過去株価を使って、株式投資の結果をシミュレーションできる Web アプリです。

- フロントエンド: React + Vite + TypeScript
- API: Express + TypeScript
- 株価データ: Stooq の日足 CSV（無料・API キー不要）
- テスト: Vitest
- CI: GitHub Actions で `npm test` と `npm run build`

## できること

- ティッカー、期間、初期投資額、毎月積立額を入力
- 一括投資 / 毎月積立を切り替え
- 実際の終値データから最終評価額、投資元本、損益率、保有株数を計算
- 評価額推移を簡易チャートで表示

## セットアップ

```bash
npm install
npm run dev
```

起動後、ブラウザで Vite の URL を開いてください。API は `http://localhost:3001`、フロントは Vite 側で `/api` をプロキシします。

## 使い方

ティッカーは Stooq 形式を推奨します。

例:

- `AAPL.US`
- `MSFT.US`
- `SPY.US`
- `7203.JP`

`.US` などの市場サフィックスを省略した場合は、自動で `.US` を補います。

## テスト

```bash
npm test
npm run build
```

GitHub に push すると `.github/workflows/ci.yml` により自動でテストとビルドが実行されます。

## 注意

このアプリは教育・検証目的のシミュレーターです。投資助言ではありません。Stooq のデータは取引所や銘柄によって遅延・欠損があり得ます。
