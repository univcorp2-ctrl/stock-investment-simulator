import { brokerApis, type BrokerApi } from "./research";

export type OrderSide = "buy" | "sell";
export type OrderStyle = "market" | "limit" | "stop" | "trailing_stop";
export type IntentAssetClass = "equity" | "japan-equity" | "crypto" | "fx";

export interface OrderIntent {
  brokerId: string;
  symbol: string;
  assetClass: IntentAssetClass;
  side: OrderSide;
  quantity: number;
  orderStyle: OrderStyle;
  limitPrice?: number;
  stopPrice?: number;
  trailPercent?: number;
  trailAmount?: number;
  timeInForce: "day" | "gtc" | "ioc" | "fok";
  maxNotional?: number;
  live: boolean;
}

export interface OrderPreview {
  valid: boolean;
  broker?: BrokerApi;
  errors: string[];
  warnings: string[];
  normalized: OrderIntent;
  payload: Record<string, unknown>;
  safetyMode: "paper" | "blocked-live" | "ready-for-live-routing";
}

function brokerById(id: string): BrokerApi | undefined {
  return brokerApis.find((broker) => broker.id === id);
}

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function validateIntent(intent: OrderIntent, broker?: BrokerApi): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!broker) errors.push(`Unsupported broker: ${intent.brokerId}`);
  if (!normalizeSymbol(intent.symbol)) errors.push("symbol is required");
  if (!positiveNumber(intent.quantity)) errors.push("quantity must be greater than zero");
  if (intent.orderStyle === "limit" && !positiveNumber(intent.limitPrice)) errors.push("limitPrice is required for limit orders");
  if (intent.orderStyle === "stop" && !positiveNumber(intent.stopPrice)) errors.push("stopPrice is required for stop orders");
  if (intent.orderStyle === "trailing_stop" && !positiveNumber(intent.trailPercent) && !positiveNumber(intent.trailAmount)) {
    errors.push("trailPercent or trailAmount is required for trailing stop orders");
  }
  if (intent.trailPercent && (intent.trailPercent <= 0 || intent.trailPercent > 50)) {
    errors.push("trailPercent must be between 0 and 50");
  }
  if (intent.maxNotional && intent.limitPrice && intent.quantity * intent.limitPrice > intent.maxNotional) {
    errors.push("estimated notional exceeds maxNotional");
  }
  if (intent.live) {
    warnings.push("Live order requested. Server will still block unless LIVE_TRADING_ENABLED=true and broker secrets are configured.");
  }
  if (broker && intent.orderStyle === "trailing_stop" && broker.nativeTrailingStop !== "yes") {
    warnings.push(`${broker.name} native trailing stop support is ${broker.nativeTrailingStop}; this system will use an emulated trailing-stop plan unless verified live.`);
  }
  return { errors, warnings };
}

function sideForBroker(side: OrderSide): string {
  return side === "buy" ? "BUY" : "SELL";
}

function buildPayload(intent: OrderIntent, broker?: BrokerApi): Record<string, unknown> {
  const symbol = normalizeSymbol(intent.symbol);
  const side = sideForBroker(intent.side);
  const trailPercent = intent.trailPercent;
  const trailAmount = intent.trailAmount;

  if (!broker) {
    return { error: "unsupported broker" };
  }

  if (broker.id === "alpaca") {
    return {
      endpoint: "POST /v2/orders",
      symbol,
      qty: String(intent.quantity),
      side: intent.side,
      type: intent.orderStyle === "trailing_stop" ? "trailing_stop" : intent.orderStyle,
      time_in_force: intent.timeInForce,
      ...(intent.limitPrice ? { limit_price: String(intent.limitPrice) } : {}),
      ...(intent.stopPrice ? { stop_price: String(intent.stopPrice) } : {}),
      ...(trailPercent ? { trail_percent: String(trailPercent) } : {}),
      ...(trailAmount ? { trail_price: String(trailAmount) } : {})
    };
  }

  if (broker.id === "interactive-brokers") {
    return {
      api: "TWS API Order object",
      contract: { symbol, secType: intent.assetClass === "fx" ? "CASH" : "STK", exchange: "SMART", currency: intent.assetClass === "japan-equity" ? "JPY" : "USD" },
      order: {
        action: side,
        totalQuantity: intent.quantity,
        orderType: intent.orderStyle === "trailing_stop" ? "TRAIL" : intent.orderStyle.toUpperCase(),
        tif: intent.timeInForce.toUpperCase(),
        ...(trailPercent ? { trailingPercent: trailPercent } : {}),
        ...(trailAmount ? { auxPrice: trailAmount } : {}),
        ...(intent.limitPrice ? { lmtPrice: intent.limitPrice } : {})
      }
    };
  }

  if (broker.id === "tradestation") {
    return {
      endpoint: "POST /v3/orderexecution/orders",
      Symbol: symbol,
      Quantity: String(intent.quantity),
      TradeAction: side,
      OrderType: intent.orderStyle === "trailing_stop" ? "TrailingStop" : intent.orderStyle,
      TimeInForce: { Duration: intent.timeInForce.toUpperCase() },
      ...(trailPercent ? { TrailPercent: trailPercent } : {}),
      ...(trailAmount ? { TrailAmount: trailAmount } : {}),
      ...(intent.limitPrice ? { LimitPrice: intent.limitPrice } : {})
    };
  }

  if (broker.id === "binance") {
    const trailingDelta = trailPercent ? Math.round(trailPercent * 100) : undefined;
    return {
      endpoint: "POST /api/v3/order",
      symbol,
      side,
      type: intent.orderStyle === "trailing_stop" ? "STOP_LOSS_LIMIT" : intent.orderStyle.toUpperCase(),
      quantity: intent.quantity,
      timeInForce: intent.timeInForce.toUpperCase(),
      ...(trailingDelta ? { trailingDelta } : {}),
      ...(intent.limitPrice ? { price: intent.limitPrice } : {}),
      note: "Binance spot trailing uses trailingDelta in BIPS. Signed request required for live orders."
    };
  }

  if (broker.id === "bybit") {
    return {
      endpoint: "POST /v5/position/trading-stop",
      category: intent.assetClass === "crypto" ? "linear_or_spot_after_user_choice" : intent.assetClass,
      symbol,
      trailingStop: trailAmount ?? (trailPercent ? `${trailPercent}% derived by runtime price` : undefined),
      activePrice: intent.stopPrice,
      tpslMode: "Full",
      note: "Bybit trailing stop is position-level for derivatives; spot/margin rules differ."
    };
  }

  if (broker.id === "okx") {
    return {
      endpoint: "POST /api/v5/trade/order-algo",
      instId: symbol,
      tdMode: "cash_or_cross_after_user_choice",
      side: intent.side,
      ordType: "move_order_stop",
      sz: String(intent.quantity),
      callbackRatio: trailPercent ? String(trailPercent / 100) : undefined,
      callbackSpread: trailAmount ? String(trailAmount) : undefined
    };
  }

  if (broker.id === "kraken") {
    return {
      endpoint: "POST /0/private/AddOrder",
      pair: symbol,
      type: intent.side,
      ordertype: intent.orderStyle === "trailing_stop" ? "trailing-stop" : intent.orderStyle,
      volume: String(intent.quantity),
      price: trailPercent ? `-${trailPercent}%` : trailAmount ? `-${trailAmount}` : undefined,
      validate: true
    };
  }

  if (broker.id === "oanda") {
    return {
      endpoint: "POST /v3/accounts/{accountID}/orders",
      order: {
        type: intent.orderStyle === "market" ? "MARKET" : "LIMIT",
        instrument: symbol,
        units: intent.side === "buy" ? String(intent.quantity) : String(-intent.quantity),
        timeInForce: intent.timeInForce.toUpperCase(),
        ...(intent.limitPrice ? { price: String(intent.limitPrice) } : {}),
        ...(trailAmount ? { trailingStopLossOnFill: { distance: String(trailAmount), timeInForce: "GTC" } } : {})
      }
    };
  }

  return {
    adapter: "emulated-trailing-or-basic-order",
    broker: broker.name,
    symbol,
    side,
    quantity: intent.quantity,
    orderStyle: intent.orderStyle,
    timeInForce: intent.timeInForce,
    emulationPlan:
      intent.orderStyle === "trailing_stop"
        ? ["subscribe quotes", "track high-water/low-water mark", "recalculate stop", "cancel/replace or submit stop/market exit when breached"]
        : ["submit basic order after broker-specific adapter is configured"]
  };
}

export function buildOrderPreview(intent: OrderIntent): OrderPreview {
  const normalized: OrderIntent = {
    ...intent,
    symbol: normalizeSymbol(intent.symbol),
    quantity: Number(intent.quantity),
    limitPrice: intent.limitPrice === undefined ? undefined : Number(intent.limitPrice),
    stopPrice: intent.stopPrice === undefined ? undefined : Number(intent.stopPrice),
    trailPercent: intent.trailPercent === undefined ? undefined : Number(intent.trailPercent),
    trailAmount: intent.trailAmount === undefined ? undefined : Number(intent.trailAmount)
  };
  const broker = brokerById(normalized.brokerId);
  const { errors, warnings } = validateIntent(normalized, broker);
  const payload = buildPayload(normalized, broker);
  const safetyMode = normalized.live ? "blocked-live" : "paper";
  return {
    valid: errors.length === 0,
    broker,
    errors,
    warnings,
    normalized,
    payload,
    safetyMode
  };
}
