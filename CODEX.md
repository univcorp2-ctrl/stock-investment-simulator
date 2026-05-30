# CODEX

## Goal

This repository is an AI-readable investment API research and auto-trading cockpit. Keep all secrets out of source code. Default to paper trading.

## Commands

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run excel:research`

## Safety

- Do not enable live trading by default.
- `POST /api/trading/live-order` must remain blocked unless `LIVE_TRADING_ENABLED=true`.
- Never commit API keys, account IDs, tokens, passwords, or private URLs.
- Broker-specific live adapters must be tested in sandbox/paper first.

## Main files

- `src/shared/research.ts`
- `src/shared/strategyAdvisor.ts`
- `src/shared/execution.ts`
- `src/client/App.tsx`
- `src/server/index.ts`
- `scripts/generate-research-workbook.ts`
