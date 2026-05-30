import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { brokerApis, marketDataProviders, researchMetadata, strategyLibrary } from "../src/shared/research";

const outputDir = path.join(process.cwd(), "dist", "research");
fs.mkdirSync(outputDir, { recursive: true });

function appendSheet(workbook: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  fs.writeFileSync(path.join(outputDir, `${name}.csv`), XLSX.utils.sheet_to_csv(sheet));
}

const workbook = XLSX.utils.book_new();

appendSheet(workbook, "Summary", [
  { key: "lastVerifiedDate", value: researchMetadata.lastVerifiedDate },
  { key: "providerCount", value: researchMetadata.providerCount },
  { key: "brokerCount", value: researchMetadata.brokerCount },
  { key: "strategyCount", value: researchMetadata.strategyCount },
  { key: "safetyDefault", value: "paper trading; live endpoint blocked unless LIVE_TRADING_ENABLED=true" }
]);

appendSheet(workbook, "API Providers", marketDataProviders.map((provider) => ({
  id: provider.id,
  name: provider.name,
  category: provider.category,
  assets: provider.assets.join(", "),
  dataTypes: provider.dataTypes.join(", "),
  aiReadyFormats: provider.aiReadyFormats.join(", "),
  freeTier: provider.freeTier,
  paidFrom: provider.paidFrom,
  realtime: provider.realtime,
  bestFor: provider.bestFor,
  limitations: provider.limitations,
  priority: provider.priority,
  sourceUrl: provider.sourceUrl
})));

appendSheet(workbook, "Broker APIs", brokerApis.map((broker) => ({
  id: broker.id,
  name: broker.name,
  region: broker.region,
  assets: broker.assets.join(", "),
  apiStyle: broker.apiStyle,
  automaticTrading: broker.automaticTrading,
  nativeTrailingStop: broker.nativeTrailingStop,
  sandbox: broker.sandbox,
  pricing: broker.pricing,
  bestFor: broker.bestFor,
  limitations: broker.limitations,
  setup: broker.setup,
  adapterStatus: broker.adapterStatus,
  sourceUrl: broker.sourceUrl
})));

appendSheet(workbook, "Strategies", strategyLibrary.map((strategy) => ({
  id: strategy.id,
  name: strategy.name,
  family: strategy.family,
  signals: strategy.signals.join(", "),
  requiredData: strategy.requiredData.join(", "),
  defaultHorizon: strategy.defaultHorizon,
  automationLevel: strategy.automationLevel,
  strengths: strategy.strengths,
  risks: strategy.risks,
  uiPreset: strategy.uiPreset
})));

appendSheet(workbook, "Secrets", [
  { secret: "LIVE_TRADING_ENABLED", requiredFor: "本番発注ゲート解除", example: "true", note: "本番環境でのみ設定。既定は未設定/false。" },
  { secret: "ALPACA_API_KEY", requiredFor: "Alpaca live/paper routing", example: "not committed", note: "GitHub Secretsまたはホスティング環境変数に保存。" },
  { secret: "ALPACA_SECRET_KEY", requiredFor: "Alpaca live/paper routing", example: "not committed", note: "絶対にREADMEやコードへ直書きしない。" },
  { secret: "IBKR_GATEWAY_HOST", requiredFor: "IBKR gateway routing", example: "127.0.0.1", note: "TWS/IB Gateway稼働が必要。" },
  { secret: "BINANCE_API_KEY / BINANCE_API_SECRET", requiredFor: "Binance signed order routing", example: "not committed", note: "IP制限と取引権限分離を推奨。" },
  { secret: "JQUANTS_API_KEY", requiredFor: "J-Quants data ingestion", example: "not committed", note: "Free/Light/Standard/Premiumのプランに応じて取得範囲が変わる。" }
]);

const workbookPath = path.join(outputDir, researchMetadata.workbookFileName);
XLSX.writeFile(workbook, workbookPath);
console.log(`Wrote ${workbookPath}`);
