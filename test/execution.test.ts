import { describe, expect, it } from "vitest";
import { buildOrderPreview } from "../src/shared/execution";

describe("buildOrderPreview", () => {
  it("builds an Alpaca trailing stop payload", () => {
    const preview = buildOrderPreview({
      brokerId: "alpaca",
      symbol: "aapl",
      assetClass: "equity",
      side: "sell",
      quantity: 3,
      orderStyle: "trailing_stop",
      trailPercent: 4,
      timeInForce: "gtc",
      live: false
    });

    expect(preview.valid).toBe(true);
    expect(preview.payload).toMatchObject({ type: "trailing_stop", trail_percent: "4", symbol: "AAPL" });
    expect(preview.safetyMode).toBe("paper");
  });

  it("warns when a broker needs trailing stop emulation", () => {
    const preview = buildOrderPreview({
      brokerId: "tradier",
      symbol: "MSFT",
      assetClass: "equity",
      side: "sell",
      quantity: 1,
      orderStyle: "trailing_stop",
      trailPercent: 3,
      timeInForce: "gtc",
      live: true
    });

    expect(preview.valid).toBe(true);
    expect(preview.safetyMode).toBe("blocked-live");
    expect(preview.warnings.join(" ")).toContain("native trailing stop support");
  });

  it("rejects missing trailing parameters", () => {
    const preview = buildOrderPreview({
      brokerId: "binance",
      symbol: "BTCUSDT",
      assetClass: "crypto",
      side: "sell",
      quantity: 0.1,
      orderStyle: "trailing_stop",
      timeInForce: "gtc",
      live: false
    });

    expect(preview.valid).toBe(false);
    expect(preview.errors.join(" ")).toContain("trailPercent or trailAmount");
  });
});
