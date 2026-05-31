# Refactor Notes

## Active implementation

The active application is now the Investment API & Auto Trading Cockpit:

- `src/shared/research.ts`
- `src/shared/strategyAdvisor.ts`
- `src/shared/execution.ts`
- `src/client/App.tsx`
- `src/server/index.ts`
- `scripts/generate-research-workbook.ts`

## Legacy cleanup

The previous Stooq-only simulator modules were replaced with compatibility shims so old imports do not break while the repository history remains intact:

- `src/server/stooq.ts`
- `src/server/validation.ts`
- `src/shared/autoTrader.ts`
- `src/shared/indicators.ts`
- `src/shared/portfolio.ts`
- `src/shared/simulation.ts`
- `src/shared/types.ts`

Legacy tests were rewritten to verify the shims and new engine instead of the old simulator behavior.

## Verification policy

CI now scans the full active source/test tree again:

- `npm run lint`
- `npm test`
- `npm run build`
- Excel/CSV artifact upload

The GitHub Pages workflow builds the static UI separately.
