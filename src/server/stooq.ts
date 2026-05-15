import type { QuotePoint } from "../shared/portfolio";
import type { PricePoint } from "../shared/types";

const SYMBOL_PATTERN = /^[a-zA-Z0-9.^_-]{1,32}$/;
const RECENT_HISTORY_LOOKBACK_DAYS = 21;
const QUOTE_CACHE_MS = 30_000;

interface CachedQuote {
  expiresAt: number;
  quote: QuotePoint;
}

const quoteCache = new Map<string, CachedQuote>();

export function normalizeStooqSymbol(rawSymbol: string): string {
  const trimmed = rawSymbol.trim();

  if (!trimmed || !SYMBOL_PATTERN.test(trimmed)) {
    throw new Error("Invalid symbol. Use a Stooq ticker such as AAPL.US, MSFT.US, SPY.US, or 7203.JP.");
  }

  const normalized = trimmed.toLowerCase();
  return normalized.includes(".") ? normalized : `${normalized}.us`;
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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

function validSortedHistory(history: PricePoint[]): PricePoint[] {
  return [...history]
    .filter((point) => Boolean(point.date) && Number.isFinite(point.close) && point.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
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
    .map((columns) => ({
      symbol: columns[symbolIndex].toUpperCase(),
      date: columns[dateIndex],
      time: columns[timeIndex],
      open: parseNumber(columns[openIndex]),
      high: parseNumber(columns[highIndex]),
      low: parseNumber(columns[lowIndex]),
      close: parseNumber(columns[closeIndex]),
      volume: parseNumber(columns[volumeIndex])
    }))
    .filter((quote): quote is QuotePoint => Boolean(quote.symbol) && Boolean(quote.date) && typeof quote.close === "number" && quote.close > 0);
}

export function enrichQuoteWithPreviousClose(quote: QuotePoint, historyInput: PricePoint[]): QuotePoint {
  const history = validSortedHistory(historyInput);

  if (history.length === 0) {
    return quote;
  }

  let latestTradingPoint = history[history.length - 1];
  let previousTradingPoint: PricePoint | undefined;
  const sameDateIndex = history.findIndex((point) => point.date === quote.date);

  if (sameDateIndex >= 0) {
    latestTradingPoint = history[sameDateIndex];
    previousTradingPoint = sameDateIndex > 0 ? history[sameDateIndex - 1] : undefined;
  } else {
    const beforeQuoteDate = history.filter((point) => point.date < quote.date);
    previousTradingPoint = beforeQuoteDate[beforeQuoteDate.length - 1] ?? history[history.length - 2];
  }

  if (!previousTradingPoint && history.length >= 2) {
    previousTradingPoint = history[history.length - 2];
  }

  if (!previousTradingPoint) {
    return {
      ...quote,
      latestTradingDate: latestTradingPoint.date
    };
  }

  const change = quote.close - previousTradingPoint.close;

  return {
    ...quote,
    latestTradingDate: latestTradingPoint.date,
    previousClose: previousTradingPoint.close,
    previousCloseDate: previousTradingPoint.date,
    change,
    changePct: previousTradingPoint.close === 0 ? undefined : change / previousTradingPoint.close
  };
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "stock-investment-simulator/0.4"
    }
  });

  if (!response.ok) {
    throw new Error(`Stooq request failed with status ${response.status}`);
  }

  return response.text();
}

export async function fetchStooqHistory(symbol: string, from: string, to: string): Promise<PricePoint[]> {
  return parseStooqCsv(await fetchText(buildStooqHistoryUrl(symbol, from, to)));
}

async function fetchRawStooqQuotes(symbols: string[]): Promise<QuotePoint[]> {
  if (symbols.length === 0) {
    return [];
  }

  return parseStooqQuoteCsv(await fetchText(buildStooqQuoteUrl(symbols)));
}

async function fetchRecentHistory(symbol: string): Promise<PricePoint[]> {
  return fetchStooqHistory(symbol, isoDaysAgo(RECENT_HISTORY_LOOKBACK_DAYS), todayIso());
}

async function fetchQuoteWithPreviousClose(symbol: string): Promise<QuotePoint | null> {
  const normalizedSymbol = normalizeStooqSymbol(symbol).toUpperCase();
  const cached = quoteCache.get(normalizedSymbol);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.quote;
  }

  const [rawQuote] = await fetchRawStooqQuotes([normalizedSymbol]);

  if (!rawQuote) {
    return null;
  }

  let enrichedQuote = rawQuote;

  try {
    const recentHistory = await fetchRecentHistory(normalizedSymbol);
    enrichedQuote = enrichQuoteWithPreviousClose(rawQuote, recentHistory);
  } catch {
    enrichedQuote = rawQuote;
  }

  quoteCache.set(normalizedSymbol, {
    expiresAt: Date.now() + QUOTE_CACHE_MS,
    quote: enrichedQuote
  });

  return enrichedQuote;
}

export async function fetchStooqQuotes(symbols: string[]): Promise<QuotePoint[]> {
  const normalizedSymbols = [...new Set(symbols.map((symbol) => normalizeStooqSymbol(symbol).toUpperCase()))];
  const quotes = await Promise.all(normalizedSymbols.map((symbol) => fetchQuoteWithPreviousClose(symbol)));
  return quotes.filter((quote): quote is QuotePoint => quote !== null);
}
