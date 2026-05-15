import { describe, expect, it } from "vitest";
import {
  buildStooqHistoryUrl,
  buildStooqQuoteUrl,
  enrichQuoteWithPreviousClose,
  normalizeStooqSymbol,
  parseStooqCsv,
  parseStooqQuoteCsv
} from "../src/server/stooq";

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

  it("parses raw Stooq quote CSV without pretending open is previous close", () => {
    const csv = `Symbol,Date,Time,Open,High,Low,Close,Volume\nAAPL.US,2026-05-12,22:00:09,100,110,99,108,123456`;
    const quotes = parseStooqQuoteCsv(csv);

    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toEqual({
      symbol: "AAPL.US",
      date: "2026-05-12",
      time: "22:00:09",
      open: 100,
      high: 110,
      low: 99,
      close: 108,
      volume: 123456
    });
  });

  it("enriches latest quotes with previous trading close from daily history", () => {
    const quote = {
      symbol: "AAPL.US",
      date: "2026-05-12",
      time: "22:00:09",
      open: 100,
      high: 110,
      low: 99,
      close: 108,
      volume: 123456
    };
    const enriched = enrichQuoteWithPreviousClose(quote, [
      { date: "2026-05-08", close: 95 },
      { date: "2026-05-11", close: 101 },
      { date: "2026-05-12", close: 108 }
    ]);

    expect(enriched.previousClose).toBe(101);
    expect(enriched.previousCloseDate).toBe("2026-05-11");
    expect(enriched.change).toBe(7);
    expect(enriched.changePct).toBeCloseTo(7 / 101);
  });

  it("uses the latest daily close as the previous close when the quote date is newer than history", () => {
    const quote = {
      symbol: "AAPL.US",
      date: "2026-05-13",
      time: "15:00:00",
      close: 111
    };
    const enriched = enrichQuoteWithPreviousClose(quote, [
      { date: "2026-05-11", close: 101 },
      { date: "2026-05-12", close: 108 }
    ]);

    expect(enriched.previousClose).toBe(108);
    expect(enriched.previousCloseDate).toBe("2026-05-12");
    expect(enriched.change).toBe(3);
  });

  it("returns an empty array for no data responses", () => {
    expect(parseStooqCsv("No data")).toEqual([]);
    expect(parseStooqQuoteCsv("No data")).toEqual([]);
  });
});
