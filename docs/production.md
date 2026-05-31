# Production Deployment

## Static UI

GitHub Pages workflow builds the Vite app, uploads `dist`, and deploys it with `actions/deploy-pages`.

Expected URL after successful deployment:

`https://univcorp2-ctrl.github.io/stock-investment-simulator/`

If this URL is not accessible, the most likely cause is repository Pages configuration. The app build itself is checked by CI.

## API server

```bash
docker compose up --build
curl http://localhost:3001/api/health
```

Render向け `render.yaml`、Docker向け `Dockerfile` を同梱しています。

## 本番売買に必要なもの

- `LIVE_TRADING_ENABLED=true`
- ブローカー別APIキー
- データAPIキー
- IP制限、出金権限無効化、最小権限キー
- 注文ログ、約定ログ、失敗ログ
- 日次損失停止、最大ポジション、最大注文額、kill switch
- Paper/sandboxでの30日以上の検証

## 現在の実装範囲

- 調査DB
- Excel/CSV生成
- 戦略推奨
- 発注payload生成
- Live安全ゲート
- Docker/API雛形

実ネットワーク発注adapterは、実APIキーと対象ブローカー確定後に有効化します。
