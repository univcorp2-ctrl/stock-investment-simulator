# Architecture

```mermaid
flowchart LR
  U[User] --> UI[React/Vite Cockpit]
  UI --> R[Research DB]
  UI --> A[Strategy Advisor]
  UI --> O[Order Preview]
  UI --> API[Express API]
  API --> R
  API --> A
  API --> O
  O --> G[Risk and Live Gate]
  G -->|blocked by default| B[Broker Adapters]
  R --> X[Excel Generator]
  CI[GitHub Actions] --> T[Typecheck/Test/Build]
  CI --> X
  P[GitHub Pages] --> UI
```

## 構成

- `src/shared/research.ts`: API、ブローカー、戦略DB
- `src/shared/strategyAdvisor.ts`: 推奨ロジック
- `src/shared/execution.ts`: 発注Intent検証とpayload生成
- `src/server/index.ts`: Express API
- `src/client/App.tsx`: Web UI
- `scripts/generate-research-workbook.ts`: Excel/CSV生成

## 安全設計

- Paper tradingが既定
- Live endpointは `LIVE_TRADING_ENABLED=true` なしで403
- トレーリング未対応ブローカーはemulatedとして明示
- 最大発注額、ポジション比率、日次損失、kill switchを本番前に設定
