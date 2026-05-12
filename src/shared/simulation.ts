import type { PricePoint, SimulationInput, SimulationResult } from "./types";

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function assertMoney(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
}

export function simulateInvestment(input: SimulationInput): SimulationResult {
  assertMoney(input.initialCash, "initialCash");
  assertMoney(input.monthlyContribution, "monthlyContribution");

  const prices = [...input.prices]
    .filter((point) => Number.isFinite(point.close) && point.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (prices.length === 0) {
    throw new Error("At least one valid price point is required");
  }

  let shares = 0;
  let invested = 0;
  const firstMonth = monthKey(prices[0].date);
  let lastContributionMonth = firstMonth;

  const points = prices.map((point, index) => {
    let buyAmount = 0;

    if (index === 0 && input.initialCash > 0) {
      buyAmount += input.initialCash;
    }

    if (input.strategy === "monthly-dca") {
      const currentMonth = monthKey(point.date);
      if (currentMonth !== firstMonth && currentMonth !== lastContributionMonth && input.monthlyContribution > 0) {
        buyAmount += input.monthlyContribution;
        lastContributionMonth = currentMonth;
      }
    }

    if (buyAmount > 0) {
      shares += buyAmount / point.close;
      invested += buyAmount;
    }

    return {
      date: point.date,
      price: point.close,
      shares,
      invested,
      totalValue: shares * point.close
    };
  });

  const lastPoint = points[points.length - 1];
  const finalValue = lastPoint.totalValue;
  const profit = finalValue - invested;

  return {
    firstDate: prices[0].date,
    lastDate: prices[prices.length - 1].date,
    finalValue,
    totalInvested: invested,
    totalShares: shares,
    profit,
    returnRate: invested === 0 ? 0 : profit / invested,
    points
  };
}
