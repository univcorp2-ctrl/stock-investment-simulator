import { describe, expect, it } from "vitest";
import { buildStooqHistoryUrl, buildStooqQuoteUrl, normalizeStooqSymbol, parseStooqCsv, parseStooqQuoteCsv } from "../src/server/stooq";

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

  it("builds a quote URL for multiple symbols", () => {
    const url = buildStooqQuoteUrl(["AAPL.US", "MSFT"]);

    expect(url).toContain("stooq.com/q/l/");
    expect(url).toContain("s=aapl.us%2Cmsft.us");
    expect(url).toContain("f=sd2t2ohlcv");
    expect(url).toContain("e=csv");
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

  it("parses Stooq quote CSV", () => {
    const csv = `Symbol,Date,Time,Open,High,Low,Close,Volume\nAAPL.US,2026-05-12,22:00:09,100,110,99,108,123456`;
    const quotes = parseStooqQuoteCsv(csv);

    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toMatchObject({
      symbol: "AAPL.US",
      date: "2026-05-12",
      time: "22:00:09",
      open: 100,
      high: 110,
      low: 99,
      close: 108,
      previousClose: 100,
      change: 8,
      changePct: 0.08,
      volume: 123456
    });
  });

  it("returns an empty array for no data responses", () => {
    expect(parseStooqCsv("No data")).toEqual([]);
    expect(parseStooqQuoteCsv("No data")).toEqual([]);
  });
});
