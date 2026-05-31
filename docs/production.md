# Production Deployment

## Static UI

GitHub Pages workflow is included. Once Pages deployment succeeds, the static cockpit can be opened at:

`https://univcorp2-ctrl.github.io/stock-investment-simulator/`

The static UI works without the Express API because the core research database and strategy engine are bundled into the frontend.

## API server

For live order routing and broker webhooks, deploy the Express API with Docker.

### Docker

```bash
docker compose up --build
```

Health check:

```bash
curl http://localhost:3001/api/health
```

### Render blueprint

`render.yaml` is included for one-click style deployment. Configure secrets in the Render dashboard; do not commit `.env`.

### Required production controls

- Keep `LIVE_TRADING_ENABLED=false` until paper trading is verified.
- Use broker paper/sandbox keys first.
- Restrict API keys by IP where supported.
- Disable withdrawal permission on exchange keys.
- Set max order notional, max position percentage, daily loss limit, and kill switch.
- Store all order intents, broker payloads, responses, and rejects.

## What is production-ready now

- Production static UI build
- Dockerized API service
- Health endpoint
- Strategy recommender
- Broker payload generator
- Live trading safety gate
- Excel/CSV generation in CI

## What requires real credentials

- Actual signed order submission to each broker
- Market data ingestion jobs that consume paid API keys
- Account balance / position synchronization
- Real-time WebSocket monitoring
- Production kill-switch notifications
