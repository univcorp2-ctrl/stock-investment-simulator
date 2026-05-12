function assertPeriod(period: number, label: string): void {
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
}

export function simpleMovingAverage(values: number[], period: number): Array<number | null> {
  assertPeriod(period, "period");

  const result: Array<number | null> = Array(values.length).fill(null);
  let sum = 0;

  for (let index = 0; index < values.length; index += 1) {
    sum += values[index];

    if (index >= period) {
      sum -= values[index - period];
    }

    if (index >= period - 1) {
      result[index] = sum / period;
    }
  }

  return result;
}

function rsiFromAverages(avgGain: number, avgLoss: number): number {
  if (avgGain === 0 && avgLoss === 0) {
    return 50;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const relativeStrength = avgGain / avgLoss;
  return 100 - 100 / (1 + relativeStrength);
}

export function relativeStrengthIndex(values: number[], period: number): Array<number | null> {
  assertPeriod(period, "period");

  const result: Array<number | null> = Array(values.length).fill(null);

  if (values.length <= period) {
    return result;
  }

  let gains = 0;
  let losses = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  result[period] = rsiFromAverages(avgGain, avgLoss);

  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[index] = rsiFromAverages(avgGain, avgLoss);
  }

  return result;
}

export function rollingMax(values: number[], period: number): Array<number | null> {
  assertPeriod(period, "period");

  return values.map((_, index) => {
    if (index < period - 1) {
      return null;
    }

    let max = -Infinity;
    for (let cursor = index - period + 1; cursor <= index; cursor += 1) {
      max = Math.max(max, values[cursor]);
    }
    return max;
  });
}

export function rollingMin(values: number[], period: number): Array<number | null> {
  assertPeriod(period, "period");

  return values.map((_, index) => {
    if (index < period - 1) {
      return null;
    }

    let min = Infinity;
    for (let cursor = index - period + 1; cursor <= index; cursor += 1) {
      min = Math.min(min, values[cursor]);
    }
    return min;
  });
}

export function maxDrawdown(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let peak = values[0];
  let worstDrawdown = 0;

  for (const value of values) {
    peak = Math.max(peak, value);
    if (peak > 0) {
      worstDrawdown = Math.min(worstDrawdown, (value - peak) / peak);
    }
  }

  return worstDrawdown;
}
