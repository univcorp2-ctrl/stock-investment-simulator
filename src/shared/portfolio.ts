import type { PricePoint } from "./types";

export interface QuotePoint extends PricePoint {
  symbol: string;
  time?: string;
  latestTradingDate?: string;
  previousClose?: number;
  previousCloseDate?: string;
  change?: number;
  changePct?: number;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
}

export interface PositionReturn {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
  quote: QuotePoint;
  marketValue: number;
  invested: number;
  unrealizedPnl: number;
  unrealizedReturn: number;
  dayPnl: number;
  dayReturn: number;
}

export interface PortfolioReturnSummary {
  positions: PositionReturn[];
  totalMarketValue: number;
  totalInvested: number;
  totalUnrealizedPnl: number;
  totalUnrealizedReturn: number;
  totalDayPnl: number;
  totalDayReturn: number;
  lastUpdated: string;
}

function assertPosition(position: PortfolioPosition): void {
  if (!position.symbol.trim()) {
    throw new Error("symbol is required");
  }

  if (!Number.isFinite(position.shares) || position.shares <= 0) {
    throw new Error("shares must be greater than zero");
  }

  if (!Number.isFinite(position.averageCost) || position.averageCost < 0) {
    throw new Error("averageCost must be a non-negative number");
  }
}

export function calculatePortfolioReturns(
  positions: PortfolioPosition[],
  quotes: QuotePoint[],
  nowIso = new Date().toISOString()
): PortfolioReturnSummary {
  const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));

  const rows = positions.map((position) => {
    assertPosition(position);
    const quote = quoteBySymbol.get(position.symbol.toUpperCase());

    if (!quote) {
      throw new Error(`Quote not found for ${position.symbol}`);
    }

    const marketValue = position.shares * quote.close;
    const invested = position.shares * position.averageCost;
    const unrealizedPnl = marketValue - invested;
    const unrealizedReturn = invested === 0 ? 0 : unrealizedPnl / invested;
    const previousClose = quote.previousClose ?? quote.close - (quote.change ?? 0);
    const dayPnl = position.shares * (quote.close - previousClose);
    const dayReturn = previousClose === 0 ? 0 : (quote.close - previousClose) / previousClose;

    return {
      id: position.id,
      symbol: position.symbol.toUpperCase(),
      shares: position.shares,
      averageCost: position.averageCost,
      quote,
      marketValue,
      invested,
      unrealizedPnl,
      unrealizedReturn,
      dayPnl,
      dayReturn
    };
  });

  const totalMarketValue = rows.reduce((sum, row) => sum + row.marketValue, 0);
  const totalInvested = rows.reduce((sum, row) => sum + row.invested, 0);
  const totalUnrealizedPnl = totalMarketValue - totalInvested;
  const previousValue = rows.reduce((sum, row) => {
    const previousClose = row.quote.previousClose ?? row.quote.close - (row.quote.change ?? 0);
    return sum + row.shares * previousClose;
  }, 0);
  const totalDayPnl = totalMarketValue - previousValue;

  return {
    positions: rows,
    totalMarketValue,
    totalInvested,
    totalUnrealizedPnl,
    totalUnrealizedReturn: totalInvested === 0 ? 0 : totalUnrealizedPnl / totalInvested,
    totalDayPnl,
    totalDayReturn: previousValue === 0 ? 0 : totalDayPnl / previousValue,
    lastUpdated: nowIso
  };
}
