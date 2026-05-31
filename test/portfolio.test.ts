import { describe, expect, it } from "vitest";
import { estimatePositionNotional, isWithinNotionalLimit } from "../src/shared/portfolio";

describe("legacy portfolio compatibility helpers", () => {
  it("checks notional limits", () => {
    expect(estimatePositionNotional(2, 100)).toBe(200);
    expect(isWithinNotionalLimit(2, 100, 250)).toBe(true);
  });
});
