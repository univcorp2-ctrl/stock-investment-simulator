import express from "express";
import { brokerApis, marketDataProviders, researchMetadata, strategyLibrary } from "../shared/research";
import { DEFAULT_STRATEGY_PROFILE, recommendStrategy, type StrategyProfile } from "../shared/strategyAdvisor";
import { buildOrderPreview, type OrderIntent } from "../shared/execution";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, app: "investment-api-auto-trading-cockpit", version: "1.0.0" });
});

app.get("/api/research", (_request, response) => {
  response.json({ metadata: researchMetadata, marketDataProviders, brokerApis, strategyLibrary });
});

app.post("/api/strategy/recommend", (request, response) => {
  const profile = { ...DEFAULT_STRATEGY_PROFILE, ...(request.body ?? {}) } as StrategyProfile;
  response.json(recommendStrategy(profile));
});

app.post("/api/trading/order-preview", (request, response) => {
  const intent = request.body as OrderIntent;
  response.json(buildOrderPreview(intent));
});

app.post("/api/trading/live-order", (request, response) => {
  const intent = request.body as OrderIntent;
  const preview = buildOrderPreview({ ...intent, live: true });
  if (!preview.valid) {
    response.status(400).json(preview);
    return;
  }
  if (process.env.LIVE_TRADING_ENABLED !== "true") {
    response.status(403).json({
      ok: false,
      blocked: true,
      reason: "LIVE_TRADING_ENABLED is not true. This endpoint is intentionally blocked until broker secrets and production risk limits are configured.",
      preview
    });
    return;
  }
  response.status(501).json({
    ok: false,
    reason: "Live network submission adapters must be enabled per broker after credentials are supplied. Payload generation and risk validation are ready.",
    preview
  });
});

app.listen(port, () => {
  console.log(`Investment cockpit API listening on http://localhost:${port}`);
});
