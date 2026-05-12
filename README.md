# Stock Investment Simulator

実株価を使って、自動売買ロジックのバックテストと長期投資シミュレーションを行う Web アプリです。

> このアプリは教育・検証目的のシミュレーターです。証券会社への実注文発注機能は入れていません。投資助言ではありません。

## 主な機能

- Stooq の日足 CSV から実際の過去株価を取得
- 自動売買バックテスト
  - SMA ゴールデンクロス / デッドクロス
  - RSI 逆張り
  - ブレイクアウト
- リスク管理
  - 損切り
  - 利確
  - トレーリングストップ
  - 手数料・スリッページ
  - 投資比率
- 結果分析
  - 最終評価額
  - 自動売買リターン
  - Buy & Hold 比較
  - 最大ドローダウン
  - 勝率
  - 取引回数
  - エクスポージャー
  - 損益付きトレードログ
- テスト
  - 売買エンジン
  - テクニカル指標
  - Stooq CSV パーサー
  - DCA シミュレーション
- GitHub Actions CI
  - `npm test`
  - `npm run build`

## 技術構成

- フロントエンド: React + Vite + TypeScript
- API: Express + TypeScript
- テスト: Vitest
- データ: Stooq 日足 CSV

## セットアップ

```bash
npm install
npm run dev
```

起動後、Vite の URL をブラウザで開いてください。

- API: `http://localhost:3001`
- フロント: Vite dev server
- フロントから `/api` へのアクセスは Vite proxy で API に転送されます。

## ティッカー例

Stooq 形式を推奨します。

- `AAPL.US`
- `MSFT.US`
- `SPY.US`
- `7203.JP`

`.US` などの市場サフィックスを省略した場合は、自動で `.US` を補います。

## テストとビルド

```bash
npm test
npm run build
```

## GitHub Actions の修正内容

初回版では `.github/workflows/ci.yml` で `actions/setup-node` の `cache: npm` と `npm ci` を使っていました。

しかし repo に `package-lock.json` が無かったため、GitHub Actions は次の理由で失敗していました。

- `setup-node` の npm cache は lockfile を探す
- `npm ci` は lockfile が必須
- repo に `package-lock.json` / `npm-shrinkwrap.json` / `yarn.lock` が存在しなかった

そのため、現時点では CI を `npm install` ベースに修正しています。将来的に lockfile を commit する場合は、`npm ci` と npm cache に戻せます。

## 注意

- 実注文発注や証券会社 API 連携は含めていません。
- バックテスト結果は将来の運用成績を保証しません。
- Stooq のデータは銘柄・市場によって遅延や欠損があり得ます。
