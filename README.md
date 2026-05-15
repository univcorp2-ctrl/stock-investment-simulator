# Stock Investment Simulator

実株価を使って、自動売買ロジックのバックテスト、保有銘柄の毎日リターン確認、長期投資シミュレーションを行う Web アプリです。

> このアプリは教育・検証目的のシミュレーターです。証券会社への実注文発注機能は入れていません。投資助言ではありません。

## 主な機能

### Daily Performance Monitor

Web画面上で、保有銘柄のパフォーマンスを毎日チェックできます。

- 保有銘柄を登録
  - ティッカー
  - 株数
  - 平均取得単価
- 最新価格を読み込み
- **前営業日の終値** と比較して日次損益を計算
- 前日比、前日比率、評価額、評価損益、総リターンを表示
- ポートフォリオ合計の評価額、投資元本、損益、総リターンを表示
- ブラウザの LocalStorage に保有銘柄を保存
- 60秒ごとの自動更新をデフォルトON
- 「最終更新時刻」「前日終値日付」「最新価格日付」を画面に表示

無料データソースの制約上、秒単位の完全リアルタイム配信ではなく、遅延・終値ベースになる場合があります。ただし、画面は開いている限り定期的に最新値を取りに行き、前営業日の終値を基準に日次パフォーマンスを更新します。

### 自動売買バックテスト

- Stooq の日足 CSV から実際の過去株価を取得
- 自動売買ロジック
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

## 技術構成

- フロントエンド: React + Vite + TypeScript
- API: Express + TypeScript
- テスト: Vitest
- データ: Stooq CSV
- CI: GitHub Actions

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

## API

### `GET /api/quotes?symbols=AAPL.US,MSFT.US,SPY.US`

複数銘柄の最新価格と前営業日終値を返します。

```json
{
  "quotes": [
    {
      "symbol": "AAPL.US",
      "date": "2026-05-12",
      "time": "22:00:09",
      "open": 210,
      "high": 214,
      "low": 208.5,
      "close": 212.3,
      "latestTradingDate": "2026-05-12",
      "previousClose": 209.7,
      "previousCloseDate": "2026-05-11",
      "change": 2.6,
      "changePct": 0.0124,
      "volume": 48200123
    }
  ],
  "fetchedAt": "2026-05-12T22:01:00.000Z"
}
```

前日比は `open` ではなく、直近日足データから取得した **前営業日の終値** を基準に計算します。

### `GET /api/history?symbol=AAPL.US&from=2020-01-01&to=2026-05-12`

指定期間の日足価格を返します。

## テストとビルド

```bash
npm test
npm run build
```

GitHub Actions では以下を実行します。

- `npm install`
- `npm test`
- `npm run build`

## GitHub Actions の修正内容

初回版では `.github/workflows/ci.yml` で `actions/setup-node` の `cache: npm` と `npm ci` を使っていました。

しかし repo に `package-lock.json` が無かったため、GitHub Actions は次の理由で失敗していました。

- `setup-node` の npm cache は lockfile を探す
- `npm ci` は lockfile が必須
- repo に `package-lock.json` / `npm-shrinkwrap.json` / `yarn.lock` が存在しなかった

そのため、現時点では CI を `npm install` ベースに修正しています。将来的に lockfile を commit する場合は、`npm ci` と npm cache に戻せます。

## 注意

- 実注文発注や証券会社 API 連携は含めていません。
- 無料データソースはリアルタイム配信ではなく、遅延・終値ベースになる場合があります。
- バックテスト結果は将来の運用成績を保証しません。
- Stooq のデータは銘柄・市場によって遅延や欠損があり得ます。
