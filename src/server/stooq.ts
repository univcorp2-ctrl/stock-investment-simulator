import type { PricePoint } from "../shared/types";

const SYMBOL_PATTERN = /^[a-zA-Z0-9.^_-]{1,32}$/;

export function normalizeStooqSymbol(rawSymbol: string): string {
  const trimmed = rawSymbol.trim();

  if (!trimmed || !SYMBOL_PATTERN.test(trimmed)) {
    throw new Error("Invalid symbol. Use a Stooq ticker such as AAPL.US, MSFT.US, SPY.US, or 7203.JP.");
  }

  const normalized = trimmed.toLowerCase();
  return normalized.includes(".") ? normalized : `${normalized}.us`;
}

export function buildStooqHistoryUrl(symbol: string, from: string, to: string): string {
  const url = new URL("https://stooq.com/q/d/l/");
  url.searchParams.set("s", normalizeStooqSymbol(symbol));
  url.searchParams.set("i", "d");
  url.searchParams.set("d1", from.replaceAll("-", ""));
  url.searchParams.set("d2", to.replaceAll("-", ""));
  return url.toString();
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseStooqCsv(csv: string): PricePoint[] {
  const trimmed = csv.trim();

  if (!trimmed || trimmed.toLowerCase().includes("no data")) {
    return [];
  }

  const [headerLine, ...dataLines] = trimmed.split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim().toLowerCase());
  const dateIndex = headers.indexOf("date");
  const openIndex = headers.indexOf("open");
  const highIndex = headers.indexOf("high");
  const lowIndex = headers.indexOf("low");
  const closeIndex = headers.indexOf("close");
  const volumeIndex = headers.indexOf("volume");

  if (dateIndex < 0 || closeIndex < 0) {
    throw new Error("Unexpected Stooq CSV format");
  }

  return dataLines
    .map((line) => line.split(",").map((item) => item.trim()))
    .map((columns) => ({
      date: columns[dateIndex],
      open: parseNumber(columns[openIndex]),
      high: parseNumber(columns[highIndex]),
      low: parseNumber(columns[lowIndex]),
      close: parseNumber(columns[closeIndex]),
      volume: parseNumber(columns[volumeIndex])
    }))
    .filter((point): point is PricePoint => Boolean(point.date) && typeof point.close === "number" && point.close > 0);
}

export async function fetchStooqHistory(symbol: string, from: string, to: string): Promise<PricePoint[]> {
  const response = await fetch(buildStooqHistoryUrl(symbol, from, to), {
    headers: {
      "User-Agent": "stock-investment-simulator/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Stooq request failed with status ${response.status}`);
  }

  return parseStooqCsv(await response.text());
}
