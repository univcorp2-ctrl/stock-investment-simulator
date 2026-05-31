import { describe, expect, it } from "vitest";
import { legacyStooqNotice } from "../src/server/stooq";

describe("legacy stooq shim", () => {
  it("is deprecated in favor of the research provider database", () => {
    expect(legacyStooqNotice.deprecated).toBe(true);
    expect(legacyStooqNotice.replacement).toBe("src/shared/research.ts");
  });
});
