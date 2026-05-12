export type Strategy = "lump-sum" | "monthly-dca";

export interface PricePoint {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
}

export interface SimulationInput {
  prices: PricePoint[];
  initialCash: number;
  monthlyContribution: number;
  strategy: Strategy;
}

export interface SimulationPoint {
  date: string;
  price: number;
  shares: number;
  invested: number;
  totalValue: number;
}

export interface SimulationResult {
  firstDate: string;
  lastDate: string;
  finalValue: number;
  totalInvested: number;
  totalShares: number;
  profit: number;
  returnRate: number;
  points: SimulationPoint[];
}
