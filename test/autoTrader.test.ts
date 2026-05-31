import { describe, expect, it } from "vitest";
import { buildOrderPreview } from "../src/shared/autoTrader";

describe("legacy autoTrader compatibility shim", () => {
  it("delegates to the new order preview engine", () => {
    const preview = buildOrderPreview({
      brokerId: "alpaca",
      symbol: "AAPL",
      assetClass: "equity",
      side: "sell",
      quantity: 1,
      orderStyle: "trailing_stop",
      trailPercent: 3,
      timeInForce: "gtc",
      live: false
    });

    expect(preview.valid).toBe(true);
  });
});
