import { maxDrawdown, relativeStrengthIndex, simpleMovingAverage } from "./indicators";
import type { PricePoint } from "./types";

export type AutoTradeStrategy = "sma-crossover" | "rsi-reversion" | "breakout";
export type TradeSide = "BUY" | "SELL";
export type SignalAction = "BUY" | "SELL" | "HOLD";

export interface AutoTradeConfig {
  strategy: AutoTradeStrategy;
  initialCash: number;
  allocationPct?: number;
  commissionPct?: number;
  slippagePct?: number;
  shortWindow?: number;
  longWindow?: number;
  rsiPeriod?: number;
  rsiBuyBelow?: number;
  rsiSellAbove?: number;
  breakoutWindow?: number;
  stopLossPct?: number;
  takeProfitPct?: number;
  trailingStopPct?: number;
}

export type ResolvedAutoTradeConfig = Required<AutoTradeConfig>;

export interface TradeRecord {
  id: string;
  date: string;
  side: TradeSide;
  price: number;
  shares: number;
  value: number;
  commission: number;
  reason: string;
  cashAfter: number;
  equityAfter: number;
  pnl?: number;
}

export interface BacktestPoint {
  date: string;
  price: number;
  cash: number;
  shares: number;
  equity: number;
  benchmarkValue: number;
  drawdown: number;
  signal: SignalAction;
  reason: string;
}

export interface BacktestMetrics {
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  buyAndHoldValue: number;
  buyAndHoldReturn: number;
  excessReturn: number;
  maxDrawdown: number;
  trades: number;
  roundTrips: number;
  wins: number;
  losses: number;
  winRate: number;
  exposureRate: number;
  profitFactor: number;
}

export interface BacktestResult {
  config: ResolvedAutoTradeConfig;
  firstDate: string;
  lastDate: string;
  metrics: BacktestMetrics;
  points: BacktestPoint[];
  trades: TradeRecord[];
}

interface SignalDecision {
  action: SignalAction;
  reason: string;
}

export const DEFAULT_AUTO_TRADE_CONFIG: ResolvedAutoTradeConfig = {
  strategy: "sma-crossover",
  initialCash: 10_000,
  allocationPct: 0.95,
  commissionPct: 0.001,
  slippagePct: 0.0005,
  shortWindow: 20,
  longWindow: 60,
  rsiPeriod: 14,
  rsiBuyBelow: 30,
  rsiSellAbove: 65,
  breakoutWindow: 55,
  stopLossPct: 0.08,
  takeProfitPct: 0.25,
  trailingStopPct: 0.12
};

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = finiteNumber(value, fallback);
  return Math.max(1, Math.round(parsed));
}

function normalizeConfig(input: AutoTradeConfig): ResolvedAutoTradeConfig {
  const fallback = DEFAULT_AUTO_TRADE_CONFIG;
  const initialCash = finiteNumber(input.initialCash, fallback.initialCash);

  if (initialCash <= 0) {
    throw new Error("initialCash must be greater than zero");
  }

  const shortWindow = positiveInteger(input.shortWindow, fallback.shortWindow);
  const longWindow = Math.max(shortWindow + 1, positiveInteger(input.longWindow, fallback.longWindow));

  return {
    strategy: input.strategy,
    initialCash,
    allocationPct: clamp(finiteNumber(input.allocationPct, fallback.allocationPct), 0.01, 1),
    commissionPct: clamp(finiteNumber(input.commissionPct, fallback.commissionPct), 0, 0.05),
    slippagePct: clamp(finiteNumber(input.slippagePct, fallback.slippagePct), 0, 0.05),
    shortWindow,
    longWindow,
    rsiPeriod: positiveInteger(input.rsiPeriod, fallback.rsiPeriod),
    rsiBuyBelow: clamp(finiteNumber(input.rsiBuyBelow, fallback.rsiBuyBelow), 1, 99),
    rsiSellAbove: clamp(finiteNumber(input.rsiSellAbove, fallback.rsiSellAbove), 1, 99),
    breakoutWindow: positiveInteger(input.breakoutWindow, fallback.breakoutWindow),
    stopLossPct: clamp(finiteNumber(input.stopLossPct, fallback.stopLossPct), 0, 0.95),
    takeProfitPct: clamp(finiteNumber(input.takeProfitPct, fallback.takeProfitPct), 0, 10),
    trailingStopPct: clamp(finiteNumber(input.trailingStopPct, fallback.trailingStopPct), 0, 0.95)
  };
}

function validSortedPrices(prices: PricePoint[]): PricePoint[] {
  const sorted = prices
    .filter((point) => Boolean(point.date) && Number.isFinite(point.close) && point.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) {
    throw new Error("At least two valid price points are required for backtesting");
  }

  return sorted;
}

function previousRange(prices: PricePoint[], index: number, window: number): { high: number; low: number } | null {
  if (index < window) {
    return null;
  }

  let high = -Infinity;
  let low = Infinity;

  for (let cursor = index - window; cursor < index; cursor += 1) {
    high = Math.max(high, prices[cursor].close);
    low = Math.min(low, prices[cursor].close);
  }

  return { high, low };
}

function evaluateStrategy(
  config: ResolvedAutoTradeConfig,
  prices: PricePoint[],
  closes: number[],
  index: number,
  holding: boolean,
  shortSma: Array<number | null>,
  longSma: Array<number | null>,
  rsi: Array<number | null>
): SignalDecision {
  const price = closes[index];

  if (config.strategy === "sma-crossover") {
    const shortNow = shortSma[index];
    const longNow = longSma[index];
    const shortPrev = index > 0 ? shortSma[index - 1] : null;
    const longPrev = index > 0 ? longSma[index - 1] : null;

    if (shortNow === null || longNow === null) {
      return { action: "HOLD", reason: "Waiting for enough SMA data" };
    }

    if (!holding && shortNow > longNow && (shortPrev === null || longPrev === null || shortPrev <= longPrev)) {
      return { action: "BUY", reason: `SMA ${config.shortWindow} crossed above SMA ${config.longWindow}` };
    }

    if (holding && shortNow < longNow && (shortPrev === null || longPrev === null || shortPrev >= longPrev)) {
      return { action: "SELL", reason: `SMA ${config.shortWindow} crossed below SMA ${config.longWindow}` };
    }

    return { action: "HOLD", reason: "No SMA crossover" };
  }

  if (config.strategy === "rsi-reversion") {
    const rsiValue = rsi[index];

    if (rsiValue === null) {
      return { action: "HOLD", reason: "Waiting for enough RSI data" };
    }

    if (!holding && rsiValue <= config.rsiBuyBelow) {
      return { action: "BUY", reason: `RSI ${rsiValue.toFixed(1)} is below ${config.rsiBuyBelow}` };
    }

    if (holding && rsiValue >= config.rsiSellAbove) {
      return { action: "SELL", reason: `RSI ${rsiValue.toFixed(1)} is above ${config.rsiSellAbove}` };
    }

    return { action: "HOLD", reason: `RSI ${rsiValue.toFixed(1)} is neutral` };
  }

  const range = previousRange(prices, index, config.breakoutWindow);

  if (!range) {
    return { action: "HOLD", reason: "Waiting for enough breakout range data" };
  }

  if (!holding && price >= range.high) {
    return { action: "BUY", reason: `Price broke above ${config.breakoutWindow}-day high` };
  }

  if (holding && price <= range.low) {
    return { action: "SELL", reason: `Price broke below ${config.breakoutWindow}-day low` };
  }

  return { action: "HOLD", reason: "Inside breakout range" };
}

function riskSignal(price: number, entryPrice: number, highWaterPrice: number, config: ResolvedAutoTradeConfig): SignalDecision | null {
  if (config.stopLossPct > 0 && price <= entryPrice * (1 - config.stopLossPct)) {
    return { action: "SELL", reason: `Stop-loss hit at ${(config.stopLossPct * 100).toFixed(1)}%` };
  }

  if (config.takeProfitPct > 0 && price >= entryPrice * (1 + config.takeProfitPct)) {
    return { action: "SELL", reason: `Take-profit hit at ${(config.takeProfitPct * 100).toFixed(1)}%` };
  }

  if (config.trailingStopPct > 0 && price <= highWaterPrice * (1 - config.trailingStopPct)) {
    return { action: "SELL", reason: `Trailing stop hit at ${(config.trailingStopPct * 100).toFixed(1)}%` };
  }

  return null;
}

function yearsBetween(firstDate: string, lastDate: string): number {
  const first = Date.parse(`${firstDate}T00:00:00Z`);
  const last = Date.parse(`${lastDate}T00:00:00Z`);

  if (!Number.isFinite(first) || !Number.isFinite(last) || last <= first) {
    return 0;
  }

  return (last - first) / (365.25 * 24 * 60 * 60 * 1000);
}

export function runAutoTradingBacktest(pricesInput: PricePoint[], input: AutoTradeConfig): BacktestResult {
  const config = normalizeConfig(input);
  const prices = validSortedPrices(pricesInput);
  const closes = prices.map((point) => point.close);
  const shortSma = simpleMovingAverage(closes, config.shortWindow);
  const longSma = simpleMovingAverage(closes, config.longWindow);
  const rsi = relativeStrengthIndex(closes, config.rsiPeriod);

  let cash = config.initialCash;
  let shares = 0;
  let positionCost = 0;
  let entryPrice = 0;
  let highWaterPrice = 0;
  let peakEquity = config.initialCash;
  let exposureDays = 0;

  const benchmarkShares = config.initialCash / prices[0].close;
  const points: BacktestPoint[] = [];
  const trades: TradeRecord[] = [];

  for (let index = 0; index < prices.length; index += 1) {
    const point = prices[index];
    const price = point.close;
    const holding = shares > 0;

    if (holding) {
      highWaterPrice = Math.max(highWaterPrice, price);
    }

    const decision = holding
      ? riskSignal(price, entryPrice, highWaterPrice, config) ??
        evaluateStrategy(config, prices, closes, index, true, shortSma, longSma, rsi)
      : evaluateStrategy(config, prices, closes, index, false, shortSma, longSma, rsi);

    let signal: SignalAction = "HOLD";
    let reason = decision.reason;

    if (decision.action === "BUY" && shares === 0 && cash > 0) {
      const budget = Math.min(cash, cash * config.allocationPct);
      const commission = budget * config.commissionPct;
      const executionPrice = price * (1 + config.slippagePct);
      const sharesBought = (budget - commission) / executionPrice;

      if (sharesBought > 0) {
        cash -= budget;
        shares = sharesBought;
        positionCost = budget;
        entryPrice = positionCost / shares;
        highWaterPrice = price;
        signal = "BUY";

        const equityAfter = cash + shares * price;
        trades.push({
          id: `${point.date}-BUY-${trades.length + 1}`,
          date: point.date,
          side: "BUY",
          price: executionPrice,
          shares: sharesBought,
          value: budget,
          commission,
          reason,
          cashAfter: cash,
          equityAfter
        });
      }
    } else if (decision.action === "SELL" && shares > 0) {
      const sharesSold = shares;
      const executionPrice = price * (1 - config.slippagePct);
      const grossValue = sharesSold * executionPrice;
      const commission = grossValue * config.commissionPct;
      const proceeds = grossValue - commission;
      const pnl = proceeds - positionCost;

      cash += proceeds;
      shares = 0;
      positionCost = 0;
      entryPrice = 0;
      highWaterPrice = 0;
      signal = "SELL";

      const equityAfter = cash;
      trades.push({
        id: `${point.date}-SELL-${trades.length + 1}`,
        date: point.date,
        side: "SELL",
        price: executionPrice,
        shares: sharesSold,
        value: grossValue,
        commission,
        reason,
        cashAfter: cash,
        equityAfter,
        pnl
      });
    }

    const equity = cash + shares * price;
    peakEquity = Math.max(peakEquity, equity);
    const drawdown = peakEquity > 0 ? (equity - peakEquity) / peakEquity : 0;

    if (shares > 0) {
      exposureDays += 1;
    }

    points.push({
      date: point.date,
      price,
      cash,
      shares,
      equity,
      benchmarkValue: benchmarkShares * price,
      drawdown,
      signal,
      reason
    });
  }

  const finalValue = points[points.length - 1].equity;
  const buyAndHoldValue = points[points.length - 1].benchmarkValue;
  const sellTrades = trades.filter((trade) => trade.side === "SELL");
  const wins = sellTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
  const losses = sellTrades.filter((trade) => (trade.pnl ?? 0) <= 0).length;
  const grossProfit = sellTrades.reduce((sum, trade) => sum + Math.max(trade.pnl ?? 0, 0), 0);
  const grossLoss = Math.abs(sellTrades.reduce((sum, trade) => sum + Math.min(trade.pnl ?? 0, 0), 0));
  const years = yearsBetween(prices[0].date, prices[prices.length - 1].date);
  const totalReturn = (finalValue - config.initialCash) / config.initialCash;
  const buyAndHoldReturn = (buyAndHoldValue - config.initialCash) / config.initialCash;

  return {
    config,
    firstDate: prices[0].date,
    lastDate: prices[prices.length - 1].date,
    metrics: {
      finalValue,
      totalReturn,
      annualizedReturn: years > 0 ? Math.pow(finalValue / config.initialCash, 1 / years) - 1 : totalReturn,
      buyAndHoldValue,
      buyAndHoldReturn,
      excessReturn: totalReturn - buyAndHoldReturn,
      maxDrawdown: maxDrawdown(points.map((point) => point.equity)),
      trades: trades.length,
      roundTrips: sellTrades.length,
      wins,
      losses,
      winRate: sellTrades.length === 0 ? 0 : wins / sellTrades.length,
      exposureRate: exposureDays / points.length,
      profitFactor: grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss
    },
    points,
    trades
  };
}
