import { describe, expect, it } from "vitest";
import { recommendStrategy } from "../src/shared/strategyAdvisor";

describe("recommendStrategy", () => {
  it("prioritizes crypto brokers and crypto strategy for crypto profile", () => {
    const recommendation = recommendStrategy({
      riskTolerance: "high",
      horizon: "intraday",
      assetClass: "crypto",
      dataBudget: "low-cost",
      automationLevel: "paper",
      prefersFundamental: false,
      prefersTechnical: true,
      prefersNews: true
    });

    expect(recommendation.strategies.some((strategy) => strategy.id === "crypto-momentum")).toBe(true);
    expect(recommendation.brokers.some((broker) => broker.id === "binance" || broker.id === "bybit" || broker.id === "okx" || broker.id === "kraken")).toBe(true);
    expect(recommendation.defaultRisk.trailingStopPct).toBeGreaterThan(0);
  });

  it("keeps low-risk profile conservative", () => {
    const recommendation = recommendStrategy({
      riskTolerance: "low",
      horizon: "long",
      assetClass: "equity",
      dataBudget: "free",
      automationLevel: "research",
      prefersFundamental: true,
      prefersTechnical: false,
      prefersNews: false
    });

    expect(recommendation.defaultRisk.maxPositionPct).toBeLessThanOrEqual(0.05);
    expect(recommendation.guardrails.length).toBeGreaterThan(2);
  });
});
