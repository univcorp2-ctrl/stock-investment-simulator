// Deprecated: legacy indicators are superseded by strategy templates in strategyAdvisor/research.
// Minimal helpers remain for compatibility and future expansion.
export function simpleMovingAverage(values: number[], period: number): number[] {
  if (period <= 0) return [];
  return values.map((_, index) => {
    if (index + 1 < period) return Number.NaN;
    const window = values.slice(index + 1 - period, index + 1);
    return window.reduce((sum, value) => sum + value, 0) / period;
  });
}

export function relativeStrengthIndex(values: number[], period = 14): number[] {
  if (period <= 0 || values.length === 0) return [];
  return values.map((_, index) => {
    if (index < period) return Number.NaN;
    const changes = values.slice(index + 1 - period, index + 1).map((value, offset, arr) => offset === 0 ? 0 : value - arr[offset - 1]);
    const gains = changes.filter((change) => change > 0).reduce((sum, change) => sum + change, 0) / period;
    const losses = Math.abs(changes.filter((change) => change < 0).reduce((sum, change) => sum + change, 0) / period);
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - 100 / (1 + rs);
  });
}
