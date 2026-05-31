import { describe, expect, it } from "vitest";
import { simpleMovingAverage } from "../src/shared/indicators";

describe("legacy indicator compatibility helpers", () => {
  it("computes a simple moving average", () => {
    expect(simpleMovingAverage([1, 2, 3], 2)).toEqual([Number.NaN, 1.5, 2.5]);
  });
});
