import { describe, expect, it } from "vitest";
import { calculatePortfolioReturns, type PortfolioPosition, type QuotePoint } from "../src/shared/portfolio";

const positions: PortfolioPosition[] = [
  { id: "aapl", symbol: "AAPL.US", shares: 10, averageCost: 100 },
  { id: "msft", symbol: "MSFT.US", shares: 5, averageCost: 200 }
];

const quotes: QuotePoint[] = [
  { symbol: "AAPL.US", date: "2026-05-12", close: 120, previousClose: 115, previousCloseDate: "2026-05-11", change: 5, changePct: 5 / 115 },
  { symbol: "MSFT.US", date: "2026-05-12", close: 180, previousClose: 190, previousCloseDate: "2026-05-11", change: -10, changePct: -10 / 190 }
];

describe("calculatePortfolioReturns", () => {
  it("calculates position and portfolio returns from previous trading close", () => {
    const summary = calculatePortfolioReturns(positions, quotes, "2026-05-12T10:00:00.000Z");

    expect(summary.totalMarketValue).toBe(2100);
    expect(summary.totalInvested).toBe(2000);
    expect(summary.totalUnrealizedPnl).toBe(100);
    expect(summary.totalUnrealizedReturn).toBe(0.05);
    expect(summary.totalDayPnl).toBe(0);
    expect(summary.totalDayReturn).toBe(0);
    expect(summary.positions[0].dayPnl).toBe(50);
    expect(summary.positions[1].dayPnl).toBe(-50);
    expect(summary.positions[0].unrealizedPnl).toBe(200);
    expect(summary.positions[1].unrealizedPnl).toBe(-100);
  });

  it("throws when a quote is missing", () => {
    expect(() => calculatePortfolioReturns(positions, quotes.slice(0, 1))).toThrow(/Quote not found/);
  });
});
