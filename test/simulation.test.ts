import { describe, expect, it } from "vitest";
import { simulateInvestment } from "../src/shared/simulation";
import type { PricePoint } from "../src/shared/types";

const simplePrices: PricePoint[] = [
  { date: "2024-01-02", close: 10 },
  { date: "2024-01-03", close: 15 },
  { date: "2024-02-01", close: 20 }
];

describe("simulateInvestment", () => {
  it("calculates a lump-sum investment using the first available close", () => {
    const result = simulateInvestment({
      prices: simplePrices,
      initialCash: 1000,
      monthlyContribution: 500,
      strategy: "lump-sum"
    });

    expect(result.totalInvested).toBe(1000);
    expect(result.totalShares).toBe(100);
    expect(result.finalValue).toBe(2000);
    expect(result.returnRate).toBe(1);
  });

  it("invests the first monthly contribution on the first trading day of each later month", () => {
    const result = simulateInvestment({
      prices: simplePrices,
      initialCash: 100,
      monthlyContribution: 100,
      strategy: "monthly-dca"
    });

    expect(result.totalInvested).toBe(200);
    expect(result.totalShares).toBe(15);
    expect(result.finalValue).toBe(300);
    expect(result.profit).toBe(100);
  });

  it("rejects negative cash inputs", () => {
    expect(() =>
      simulateInvestment({
        prices: simplePrices,
        initialCash: -1,
        monthlyContribution: 0,
        strategy: "lump-sum"
      })
    ).toThrow(/initialCash/);
  });
});
