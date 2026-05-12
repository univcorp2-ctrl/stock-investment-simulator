import { describe, expect, it } from "vitest";
import { buildStooqHistoryUrl, normalizeStooqSymbol, parseStooqCsv } from "../src/server/stooq";

describe("Stooq helpers", () => {
  it("normalizes US symbols when the exchange suffix is omitted", () => {
    expect(normalizeStooqSymbol("AAPL")).toBe("aapl.us");
    expect(normalizeStooqSymbol("7203.JP")).toBe("7203.jp");
  });

  it("builds a daily history URL", () => {
    const url = buildStooqHistoryUrl("AAPL.US", "2024-01-01", "2024-01-31");

    expect(url).toContain("stooq.com/q/d/l/");
    expect(url).toContain("s=aapl.us");
    expect(url).toContain("i=d");
    expect(url).toContain("d1=20240101");
    expect(url).toContain("d2=20240131");
  });

  it("parses Stooq CSV prices", () => {
    const csv = `Date,Open,High,Low,Close,Volume\n2024-01-02,10,12,9,11,12345\n2024-01-03,11,13,10,12,23456`;
    const points = parseStooqCsv(csv);

    expect(points).toHaveLength(2);
    expect(points[0]).toEqual({
      date: "2024-01-02",
      open: 10,
      high: 12,
      low: 9,
      close: 11,
      volume: 12345
    });
  });

  it("returns an empty array for no data responses", () => {
    expect(parseStooqCsv("No data")).toEqual([]);
  });
});
