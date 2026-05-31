// Deprecated: legacy portfolio simulator was replaced by risk defaults in strategyAdvisor.
export interface PortfolioRiskLimits {
  maxPositionPct: number;
  stopLossPct: number;
  trailingStopPct: number;
  maxDailyLossPct: number;
}

export function estimatePositionNotional(quantity: number, price: number): number {
  return Number.isFinite(quantity) && Number.isFinite(price) ? quantity * price : Number.NaN;
}

export function isWithinNotionalLimit(quantity: number, price: number, maxNotional: number): boolean {
  return estimatePositionNotional(quantity, price) <= maxNotional;
}
