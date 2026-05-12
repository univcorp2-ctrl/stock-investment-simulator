import { describe, expect, it } from "vitest";
import { maxDrawdown, relativeStrengthIndex, rollingMax, rollingMin, simpleMovingAverage } from "../src/shared/indicators";

describe("technical indicators", () => {
  it("calculates a simple moving average", () => {
    expect(simpleMovingAverage([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]);
  });

  it("calculates RSI values after the warmup period", () => {
    const rsi = relativeStrengthIndex([1, 2, 3, 4, 5], 3);

    expect(rsi.slice(0, 3)).toEqual([null, null, null]);
    expect(rsi[3]).toBe(100);
    expect(rsi[4]).toBe(100);
  });

  it("calculates rolling highs and lows", () => {
    expect(rollingMax([3, 1, 4, 2], 2)).toEqual([null, 3, 4, 4]);
    expect(rollingMin([3, 1, 4, 2], 2)).toEqual([null, 1, 1, 2]);
  });

  it("calculates max drawdown as a negative percentage", () => {
    expect(maxDrawdown([100, 120, 90, 130])).toBeCloseTo(-0.25);
  });
});
