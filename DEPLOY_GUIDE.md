# 🚀 DEPLOY_GUIDE — stock-investment-simulator

> AI調査日: 2026-06-14 | 担当: AI自動生成

## 概要
Stooqc��実株価データを使った株式投資シミュレーターWebアプリ（React+Express）。
**APIキー不要でRenderにデプロイ可能な状態。**

---

## 🤖 AI確認済み

- [x] render.yaml解析済み — PORT=3001 / LIVE_TRADING_ENABLED=false のみ必要
- [x] src/server/index.ts解析 — process.env参照はPORTとLIVE_TRADING_ENABLEDのみ
- [x] APIキーなしでStooqデータで動作することを確認

---

## 🌐 デプロイ構成

| コンポーネント | デプロイ先 | 費用 |
|---|---|---|
| React UI (Vite) | GitHub Pages | 無料 |
| Express APIサーバー | Render (Docker) | 無料枠 |

---

## 👤 Renderデプロイ手順（10分）

### Step 1: Render アカウント準備
1. https://render.com → GitHubアカウントでログイン
2. **New** → **Web Service**

### Step 2: リポジトリ接続
1. `univcorp2-ctrl/stock-investment-simulator` を選択
2. 設定はrender.yamlから自動読み込み

### Step 3: 環境変数（render.yamlで自動設定済み）
| 変数名 | 値 |
|---|---|
| `PORT` | `3001` |
| `LIVE_TRADING_ENABLED` | `false` |

### Step 4: デプロイ実行
- **Create Web Service** → 初回ビルド5〜10分待機
- ヘルスチェック: `https://<your-app>.onrender.com/api/health`

### Step 5: GitHub Pages（UI）有効化
1. Settings → Pages → Source: GitHub Actions → Save
2. Settings → Actions → Allow all actions → Save

---

## 📈 オプション: 追加APIキー（任意・後回しOK）

| APIキー | 用途 | 取得先 |
|---|---|---|
| `ALPHAVANTAGE_API_KEY` | 米株リアルタイム | https://www.alphavantage.co |
| `JQUANTS_API_KEY` | 日本株 | https://jpx-jquants.com |
| `FINNHUB_API_KEY` | グローバル株 | https://finnhub.io/register |

---

## ✅ デプロイ完了確認
- [ ] `https://<app>.onrender.com/api/health` → {"status":"ok"}
- [ ] `https://univcorp2-ctrl.github.io/stock-investment-simulator/` でUIが表示される
