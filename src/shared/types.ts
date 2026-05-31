// Compatibility exports for old imports. Active types live in research, strategyAdvisor and execution.
export type { BrokerApi, DataProvider, StrategyMethod, Trailing } from "./research";
export type { OrderIntent, OrderPreview, OrderSide, OrderStyle, AssetClass } from "./execution";
export type { StrategyProfile, Risk, Asset, Horizon, Budget } from "./strategyAdvisor";
