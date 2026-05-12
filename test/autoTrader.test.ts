import { describe, expect, it } from "vitest";
import { runAutoTradingBacktest } from "../src/shared/autoTrader";
import type { PricePoint } from "../src/shared/types";

function prices(values: number[]): PricePoint[] {
  return values.map((close, index) => ({
    date: `2024-01-${String(index + 1).padStart(2, "0")}`,
    close
  }));
}

describe("runAutoTradingBacktest", () => {
  it("creates buy and sell trades for an SMA crossover strategy", () => {
    const result = runAutoTradingBacktest(prices([10, 11, 12, 13, 14, 13, 12, 11, 10, 9]), {
      strategy: "sma-crossover",
      initialCash: 1000,
      allocationPct: 1,
      commissionPct: 0,
      slippagePct: 0,
      shortWindow: 2,
      longWindow: 3,
      stopLossPct: 0,
      takeProfitPct: 0,
      trailingStopPct: 0
    });

    expect(result.trades.map((trade) => trade.side)).toEqual(["BUY", "SELL"]);
    expect(result.metrics.trades).toBe(2);
    expect(result.metrics.roundTrips).toBe(1);
  });

  it("applies stop-loss before the selected strategy signal", () => {
    const result = runAutoTradingBacktest(prices([100, 104, 90, 91]), {
      strategy: "breakout",
      initialCash: 1000,
      allocationPct: 1,
      commissionPct: 0,
      slippagePct: 0,
      breakoutWindow: 1,
      stopLossPct: 0.05,
      takeProfitPct: 0,
      trailingStopPct: 0
    });

    expect(result.trades).toHaveLength(2);
    expect(result.trades[0].side).toBe("BUY");
    expect(result.trades[1].side).toBe("SELL");
    expect(result.trades[1].reason).toMatch(/Stop-loss/);
    expect(result.trades[1].pnl).toBeLessThan(0);
  });

  it("calculates buy-and-hold comparison metrics", () => {
    const result = runAutoTradingBacktest(prices([10, 12, 14, 16]), {
      strategy: "breakout",
      initialCash: 1000,
      allocationPct: 1,
      commissionPct: 0,
      slippagePct: 0,
      breakoutWindow: 1,
      stopLossPct: 0,
      takeProfitPct: 0,
      trailingStopPct: 0
    });

    expect(result.metrics.buyAndHoldValue).toBe(1600);
    expect(result.metrics.buyAndHoldReturn).toBe(0.6);
    expect(result.points[result.points.length - 1].benchmarkValue).toBe(1600);
  });

  it("rejects empty price data", () => {
    expect(() =>
      runAutoTradingBacktest([], {
        strategy: "sma-crossover",
        initialCash: 1000
      })
    ).toThrow(/At least two/);
  });
});
