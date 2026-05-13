import type { PricePoint } from "../shared/types";
import type { QuotePoint } from "../shared/portfolio";

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

export function buildStooqQuoteUrl(symbols: string[]): string {
  const normalizedSymbols = symbols.map(normalizeStooqSymbol);
  const url = new URL("https://stooq.com/q/l/");
  url.searchParams.set("s", normalizedSymbols.join(","));
  url.searchParams.set("f", "sd2t2ohlcv");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "csv");
  return url.toString();
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "" || value.toUpperCase() === "N/D") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function splitCsvLine(line: string): string[] {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  columns.push(current.trim());
  return columns;
}

export function parseStooqCsv(csv: string): PricePoint[] {
  const trimmed = csv.trim();

  if (!trimmed || trimmed.toLowerCase().includes("no data")) {
    return [];
  }

  const [headerLine, ...dataLines] = trimmed.split(/\r?\n/);
  const headers = splitCsvLine(headerLine).map((header) => header.trim().toLowerCase());
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
    .map(splitCsvLine)
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

export function parseStooqQuoteCsv(csv: string): QuotePoint[] {
  const trimmed = csv.trim();

  if (!trimmed || trimmed.toLowerCase().includes("no data")) {
    return [];
  }

  const [headerLine, ...dataLines] = trimmed.split(/\r?\n/);
  const headers = splitCsvLine(headerLine).map((header) => header.trim().toLowerCase());
  const symbolIndex = headers.indexOf("symbol");
  const dateIndex = headers.indexOf("date");
  const timeIndex = headers.indexOf("time");
  const openIndex = headers.indexOf("open");
  const highIndex = headers.indexOf("high");
  const lowIndex = headers.indexOf("low");
  const closeIndex = headers.indexOf("close");
  const volumeIndex = headers.indexOf("volume");

  if (symbolIndex < 0 || dateIndex < 0 || closeIndex < 0) {
    throw new Error("Unexpected Stooq quote CSV format");
  }

  return dataLines
    .map(splitCsvLine)
    .map((columns) => {
      const close = parseNumber(columns[closeIndex]);
      const open = parseNumber(columns[openIndex]);
      const previousClose = open;
      const change = close !== undefined && previousClose !== undefined ? close - previousClose : undefined;
      const changePct = change !== undefined && previousClose !== undefined && previousClose !== 0 ? change / previousClose : undefined;

      return {
        symbol: columns[symbolIndex].toUpperCase(),
        date: columns[dateIndex],
        time: columns[timeIndex],
        open,
        high: parseNumber(columns[highIndex]),
        low: parseNumber(columns[lowIndex]),
        close,
        previousClose,
        change,
        changePct,
        volume: parseNumber(columns[volumeIndex])
      };
    })
    .filter((quote): quote is QuotePoint => Boolean(quote.symbol) && Boolean(quote.date) && typeof quote.close === "number" && quote.close > 0);
}

export async function fetchStooqHistory(symbol: string, from: string, to: string): Promise<PricePoint[]> {
  const response = await fetch(buildStooqHistoryUrl(symbol, from, to), {
    headers: {
      "User-Agent": "stock-investment-simulator/0.3"
    }
  });

  if (!response.ok) {
    throw new Error(`Stooq request failed with status ${response.status}`);
  }

  return parseStooqCsv(await response.text());
}

export async function fetchStooqQuotes(symbols: string[]): Promise<QuotePoint[]> {
  if (symbols.length === 0) {
    return [];
  }

  const response = await fetch(buildStooqQuoteUrl(symbols), {
    headers: {
      "User-Agent": "stock-investment-simulator/0.3"
    }
  });

  if (!response.ok) {
    throw new Error(`Stooq quote request failed with status ${response.status}`);
  }

  return parseStooqQuoteCsv(await response.text());
}
