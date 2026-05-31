import { describe, expect, it } from "vitest";
import { simulationNotice } from "../src/shared/simulation";

describe("legacy simulation shim", () => {
  it("points to the new strategy and execution engine", () => {
    expect(simulationNotice.deprecated).toBe(true);
    expect(simulationNotice.replacement).toContain("strategyAdvisor");
  });
});
