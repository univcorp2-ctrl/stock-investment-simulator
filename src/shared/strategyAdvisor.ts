import { brokerApis, marketDataProviders, strategyLibrary, type BrokerApi, type DataProvider, type StrategyMethod } from "./research";

export type RiskTolerance = "low" | "medium" | "high";
export type Horizon = "intraday" | "swing" | "long" | "multi";
export type AssetClass = "equity" | "japan-equity" | "crypto" | "fx" | "multi";
export type DataBudget = "free" | "low-cost" | "paid" | "enterprise";
export type AutomationLevel = "research" | "paper" | "assisted-live" | "live";

export interface StrategyProfile {
  riskTolerance: RiskTolerance;
  horizon: Horizon;
  assetClass: AssetClass;
  dataBudget: DataBudget;
  automationLevel: AutomationLevel;
  prefersFundamental: boolean;
  prefersTechnical: boolean;
  prefersNews: boolean;
}

export interface StrategyRecommendation {
  profile: StrategyProfile;
  strategies: StrategyMethod[];
  dataProviders: DataProvider[];
  brokers: BrokerApi[];
  guardrails: string[];
  defaultRisk: {
    maxPositionPct: number;
    stopLossPct: number;
    trailingStopPct: number;
    maxDailyLossPct: number;
    paperTradingDays: number;
  };
  rationale: string[];
}

export const DEFAULT_STRATEGY_PROFILE: StrategyProfile = {
  riskTolerance: "medium",
  horizon: "swing",
  assetClass: "equity",
  dataBudget: "low-cost",
  automationLevel: "paper",
  prefersFundamental: true,
  prefersTechnical: true,
  prefersNews: true
};

function includesAny(values: string[], terms: string[]): boolean {
  const haystack = values.join(" ").toLowerCase();
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

function scoreStrategy(strategy: StrategyMethod, profile: StrategyProfile): number {
  let score = 0;
  if (strategy.defaultHorizon === profile.horizon || strategy.defaultHorizon === "multi" || profile.horizon === "multi") score += 3;
  if (profile.prefersTechnical && strategy.family.includes("テクニカル")) score += 3;
  if (profile.prefersFundamental && strategy.family.includes("ファンダメンタル")) score += 3;
  if (profile.prefersNews && (strategy.family.includes("ニュース") || strategy.family.includes("イベント") || strategy.requiredData.includes("news"))) score += 2;
  if (profile.assetClass === "crypto" && strategy.id.includes("crypto")) score += 4;
  if (profile.assetClass === "fx" && strategy.id.includes("fx")) score += 4;
  if (profile.assetClass === "japan-equity" && ["quality-value", "growth-revision", "earnings-drift"].includes(strategy.id)) score += 2;
  if (profile.riskTolerance === "low" && ["volatility-target", "low-volatility", "dividend-quality"].includes(strategy.id)) score += 4;
  if (profile.riskTolerance === "high" && ["breakout", "crypto-momentum", "news-sentiment"].includes(strategy.id)) score += 3;
  if (profile.automationLevel === "live" && strategy.automationLevel === "high") score += 2;
  return score;
}

function providerFitsBudget(provider: DataProvider, budget: DataBudget): boolean {
  if (budget === "enterprise") return true;
  if (budget === "paid") return provider.priority !== "enterprise";
  if (budget === "low-cost") return provider.priority === "core" || provider.priority === "strong" || provider.freeTier.includes("無料");
  return provider.freeTier.includes("無料") || provider.freeTier.toLowerCase().includes("free");
}

function providerFitsAsset(provider: DataProvider, assetClass: AssetClass): boolean {
  if (assetClass === "multi") return true;
  if (assetClass === "crypto") return includesAny(provider.assets, ["crypto", "暗号"]);
  if (assetClass === "fx") return includesAny(provider.assets, ["FX", "macro", "rates"]);
  if (assetClass === "japan-equity") return includesAny(provider.assets, ["Japan", "日本"]);
  return includesAny(provider.assets, ["equities", "stocks", "ETF", "US equities", "global equities"]);
}

function brokerFitsAsset(broker: BrokerApi, assetClass: AssetClass): boolean {
  if (assetClass === "multi") return true;
  if (assetClass === "crypto") return includesAny(broker.assets, ["crypto"]);
  if (assetClass === "fx") return includesAny(broker.assets, ["FX", "CFD"]);
  if (assetClass === "japan-equity") return includesAny(broker.assets, ["Japan"]);
  return includesAny(broker.assets, ["stocks", "ETF", "options"]);
}

function riskDefaults(riskTolerance: RiskTolerance) {
  if (riskTolerance === "low") {
    return { maxPositionPct: 0.05, stopLossPct: 0.04, trailingStopPct: 0.06, maxDailyLossPct: 0.01, paperTradingDays: 60 };
  }
  if (riskTolerance === "high") {
    return { maxPositionPct: 0.15, stopLossPct: 0.1, trailingStopPct: 0.14, maxDailyLossPct: 0.04, paperTradingDays: 20 };
  }
  return { maxPositionPct: 0.1, stopLossPct: 0.07, trailingStopPct: 0.1, maxDailyLossPct: 0.02, paperTradingDays: 30 };
}

export function recommendStrategy(profile: StrategyProfile = DEFAULT_STRATEGY_PROFILE): StrategyRecommendation {
  const strategies = strategyLibrary
    .map((strategy) => ({ strategy, score: scoreStrategy(strategy, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.strategy);

  const dataProviders = marketDataProviders
    .filter((provider) => providerFitsAsset(provider, profile.assetClass) && providerFitsBudget(provider, profile.dataBudget))
    .slice(0, 8);

  const brokers = brokerApis
    .filter((broker) => brokerFitsAsset(broker, profile.assetClass))
    .sort((a, b) => {
      const trailingScore = (value: string) => (value === "yes" ? 3 : value === "partial" ? 2 : value === "emulated" ? 1 : 0);
      return trailingScore(b.nativeTrailingStop) - trailingScore(a.nativeTrailingStop);
    })
    .slice(0, 6);

  const defaultRisk = riskDefaults(profile.riskTolerance);
  const guardrails = [
    "Paper tradingを既定値にし、本番発注はLIVE_TRADING_ENABLED=trueとブローカーSecretsが揃うまで遮断する。",
    "1銘柄最大比率、1日最大損失、最大ドローダウン、注文金額上限をすべて発注前に検証する。",
    "トレーリングストップ未対応ブローカーでは、価格監視→注文訂正/取消→成行または逆指値でエミュレーションする。",
    "ニュース・AIシグナルは単独で発注せず、価格・出来高・リスク条件の二重確認を必須にする。"
  ];

  const rationale = [
    `${profile.assetClass}向けに${strategies.map((s) => s.name).join("、")}を優先しました。`,
    `${profile.dataBudget}予算で利用しやすいAPIを${dataProviders.length}件に絞り込みました。`,
    `トレーリングストップ対応度を優先してブローカー候補を並べました。`,
    `リスク許容度${profile.riskTolerance}に基づき、初期トレーリング幅を${(defaultRisk.trailingStopPct * 100).toFixed(1)}%に設定します。`
  ];

  return { profile, strategies, dataProviders, brokers, guardrails, defaultRisk, rationale };
}
