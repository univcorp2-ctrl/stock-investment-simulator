import { FormEvent, useMemo, useState } from "react";
import {
  DEFAULT_AUTO_TRADE_CONFIG,
  runAutoTradingBacktest,
  type AutoTradeStrategy,
  type BacktestPoint,
  type BacktestResult
} from "../shared/autoTrader";
import type { PricePoint } from "../shared/types";

interface HistoryResponse {
  symbol: string;
  from: string;
  to: string;
  prices: PricePoint[];
}

const strategyCopy: Record<AutoTradeStrategy, { title: string; description: string }> = {
  "sma-crossover": {
    title: "SMA クロス",
    description: "短期移動平均が長期移動平均を上抜けたら買い、下抜けたら売ります。トレンド追随型です。"
  },
  "rsi-reversion": {
    title: "RSI 逆張り",
    description: "RSI が売られ過ぎ水準まで下がったら買い、買われ過ぎ水準まで戻ったら売ります。"
  },
  breakout: {
    title: "ブレイクアウト",
    description: "直近レンジの高値を上抜けたら買い、安値を下抜けたら売ります。勢いに乗る戦略です。"
  }
};

function isoYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

function currencyForSymbol(symbol: string): "USD" | "JPY" {
  return symbol.toUpperCase().endsWith(".JP") ? "JPY" : "USD";
}

function formatCurrency(value: number, symbol: string): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currencyForSymbol(symbol),
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: digits }).format(value);
}

function formatProfitFactor(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "∞";
}

function pickErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") {
      return error;
    }
  }

  return "Failed to fetch price data";
}

function linePath(
  points: BacktestPoint[],
  selector: (point: BacktestPoint) => number,
  min: number,
  range: number,
  width: number,
  height: number,
  pad: number
): string {
  return points
    .map((point, index) => {
      const x = pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
      const y = height - pad - ((selector(point) - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function EquityCurveChart({ result }: { result: BacktestResult }) {
  const sampled = result.points.filter((_, index) => index % Math.ceil(result.points.length / 180) === 0);
  const width = 820;
  const height = 300;
  const pad = 32;
  const values = sampled.flatMap((point) => [point.equity, point.benchmarkValue]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const equityPath = linePath(sampled, (point) => point.equity, min, range, width, height, pad);
  const benchmarkPath = linePath(sampled, (point) => point.benchmarkValue, min, range, width, height, pad);

  return (
    <article className="chart-card">
      <div className="chart-head">
        <div>
          <span>Equity curve</span>
          <strong>自動売買 vs Buy & Hold</strong>
        </div>
        <div className="legend">
          <span className="legend-item auto">自動売買</span>
          <span className="legend-item hold">Buy & Hold</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="自動売買とBuy and Holdの評価額推移">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} />
        <polyline className="benchmark-line" points={benchmarkPath} />
        <polyline className="equity-line" points={equityPath} />
      </svg>
      <div className="chart-caption">
        <span>{result.firstDate}</span>
        <span>{result.lastDate}</span>
      </div>
    </article>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <article className={`metric-card ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function App() {
  const [symbol, setSymbol] = useState("AAPL.US");
  const [from, setFrom] = useState(isoYearsAgo(5));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [strategy, setStrategy] = useState<AutoTradeStrategy>(DEFAULT_AUTO_TRADE_CONFIG.strategy);
  const [initialCash, setInitialCash] = useState(DEFAULT_AUTO_TRADE_CONFIG.initialCash);
  const [allocationPct, setAllocationPct] = useState(DEFAULT_AUTO_TRADE_CONFIG.allocationPct * 100);
  const [commissionBps, setCommissionBps] = useState(DEFAULT_AUTO_TRADE_CONFIG.commissionPct * 10_000);
  const [slippageBps, setSlippageBps] = useState(DEFAULT_AUTO_TRADE_CONFIG.slippagePct * 10_000);
  const [shortWindow, setShortWindow] = useState(DEFAULT_AUTO_TRADE_CONFIG.shortWindow);
  const [longWindow, setLongWindow] = useState(DEFAULT_AUTO_TRADE_CONFIG.longWindow);
  const [rsiPeriod, setRsiPeriod] = useState(DEFAULT_AUTO_TRADE_CONFIG.rsiPeriod);
  const [rsiBuyBelow, setRsiBuyBelow] = useState(DEFAULT_AUTO_TRADE_CONFIG.rsiBuyBelow);
  const [rsiSellAbove, setRsiSellAbove] = useState(DEFAULT_AUTO_TRADE_CONFIG.rsiSellAbove);
  const [breakoutWindow, setBreakoutWindow] = useState(DEFAULT_AUTO_TRADE_CONFIG.breakoutWindow);
  const [stopLossPct, setStopLossPct] = useState(DEFAULT_AUTO_TRADE_CONFIG.stopLossPct * 100);
  const [takeProfitPct, setTakeProfitPct] = useState(DEFAULT_AUTO_TRADE_CONFIG.takeProfitPct * 100);
  const [trailingStopPct, setTrailingStopPct] = useState(DEFAULT_AUTO_TRADE_CONFIG.trailingStopPct * 100);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backtest = useMemo(() => {
    if (!history) {
      return null;
    }

    return runAutoTradingBacktest(history.prices, {
      strategy,
      initialCash,
      allocationPct: allocationPct / 100,
      commissionPct: commissionBps / 10_000,
      slippagePct: slippageBps / 10_000,
      shortWindow,
      longWindow,
      rsiPeriod,
      rsiBuyBelow,
      rsiSellAbove,
      breakoutWindow,
      stopLossPct: stopLossPct / 100,
      takeProfitPct: takeProfitPct / 100,
      trailingStopPct: trailingStopPct / 100
    });
  }, [
    history,
    strategy,
    initialCash,
    allocationPct,
    commissionBps,
    slippageBps,
    shortWindow,
    longWindow,
    rsiPeriod,
    rsiBuyBelow,
    rsiSellAbove,
    breakoutWindow,
    stopLossPct,
    takeProfitPct,
    trailingStopPct
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ symbol, from, to });
      const response = await fetch(`/api/history?${params.toString()}`);
      const payload = (await response.json()) as HistoryResponse | { error?: string };

      if (!response.ok) {
        throw new Error(pickErrorMessage(payload));
      }

      setHistory(payload as HistoryResponse);
    } catch (caught) {
      setHistory(null);
      setError(caught instanceof Error ? caught.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  const displaySymbol = history?.symbol ?? symbol;
  const latestPoint = backtest?.points[backtest.points.length - 1];
  const latestTrades = backtest?.trades.slice(-20).reverse() ?? [];
  const selectedStrategy = strategyCopy[strategy];

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Real data auto-trading backtester</p>
          <h1>実株価で動く自動売買シミュレーター</h1>
          <p className="lead">
            銘柄・期間・戦略・リスク管理を指定し、Stooq の日足終値で売買シグナル、約定、損益、ドローダウンを検証します。
          </p>
        </div>
        <div className="disclaimer">
          実注文は出しません。これはバックテスト / ペーパートレード用です。
        </div>
      </section>

      <section className="layout">
        <form className="control-panel" onSubmit={handleSubmit}>
          <div className="panel-section">
            <h2>Market data</h2>
            <label>
              ティッカー
              <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="AAPL.US" />
            </label>
            <div className="field-row">
              <label>
                開始日
                <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
              </label>
              <label>
                終了日
                <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </label>
            </div>
          </div>

          <div className="panel-section">
            <h2>Strategy</h2>
            <label>
              自動売買ロジック
              <select value={strategy} onChange={(event) => setStrategy(event.target.value as AutoTradeStrategy)}>
                <option value="sma-crossover">SMA クロス</option>
                <option value="rsi-reversion">RSI 逆張り</option>
                <option value="breakout">ブレイクアウト</option>
              </select>
            </label>
            <p className="strategy-help">{selectedStrategy.description}</p>

            {strategy === "sma-crossover" && (
              <div className="field-row">
                <label>
                  短期SMA
                  <input type="number" min="1" value={shortWindow} onChange={(event) => setShortWindow(Number(event.target.value))} />
                </label>
                <label>
                  長期SMA
                  <input type="number" min="2" value={longWindow} onChange={(event) => setLongWindow(Number(event.target.value))} />
                </label>
              </div>
            )}

            {strategy === "rsi-reversion" && (
              <>
                <label>
                  RSI期間
                  <input type="number" min="2" value={rsiPeriod} onChange={(event) => setRsiPeriod(Number(event.target.value))} />
                </label>
                <div className="field-row">
                  <label>
                    買いRSI以下
                    <input type="number" min="1" max="99" value={rsiBuyBelow} onChange={(event) => setRsiBuyBelow(Number(event.target.value))} />
                  </label>
                  <label>
                    売りRSI以上
                    <input type="number" min="1" max="99" value={rsiSellAbove} onChange={(event) => setRsiSellAbove(Number(event.target.value))} />
                  </label>
                </div>
              </>
            )}

            {strategy === "breakout" && (
              <label>
                ブレイクアウト期間
                <input type="number" min="1" value={breakoutWindow} onChange={(event) => setBreakoutWindow(Number(event.target.value))} />
              </label>
            )}
          </div>

          <div className="panel-section">
            <h2>Execution & risk</h2>
            <label>
              初期資金
              <input type="number" min="1" step="100" value={initialCash} onChange={(event) => setInitialCash(Number(event.target.value))} />
            </label>
            <div className="field-row">
              <label>
                投資比率 %
                <input type="number" min="1" max="100" value={allocationPct} onChange={(event) => setAllocationPct(Number(event.target.value))} />
              </label>
              <label>
                手数料 bps
                <input type="number" min="0" step="1" value={commissionBps} onChange={(event) => setCommissionBps(Number(event.target.value))} />
              </label>
            </div>
            <div className="field-row">
              <label>
                スリッページ bps
                <input type="number" min="0" step="1" value={slippageBps} onChange={(event) => setSlippageBps(Number(event.target.value))} />
              </label>
              <label>
                損切り %
                <input type="number" min="0" step="0.5" value={stopLossPct} onChange={(event) => setStopLossPct(Number(event.target.value))} />
              </label>
            </div>
            <div className="field-row">
              <label>
                利確 %
                <input type="number" min="0" step="1" value={takeProfitPct} onChange={(event) => setTakeProfitPct(Number(event.target.value))} />
              </label>
              <label>
                トレーリング %
                <input type="number" min="0" step="1" value={trailingStopPct} onChange={(event) => setTrailingStopPct(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>{isLoading ? "株価取得中..." : "実株価でバックテスト"}</button>
          <p className="hint">例: AAPL.US / MSFT.US / SPY.US / 7203.JP</p>
        </form>

        <section className="results-panel">
          {error && <div className="message error">{error}</div>}

          {!backtest && !error && (
            <div className="message empty">
              <strong>まだバックテスト結果がありません。</strong>
              <span>左の条件を設定して、実株価データを取得してください。</span>
            </div>
          )}

          {backtest && latestPoint && (
            <>
              <div className="result-header">
                <div>
                  <p className="eyebrow">{displaySymbol} / {selectedStrategy.title}</p>
                  <h2>{backtest.firstDate} 〜 {backtest.lastDate}</h2>
                </div>
                <div className={`signal ${latestPoint.signal.toLowerCase()}`}>
                  <span>Latest signal</span>
                  <strong>{latestPoint.signal}</strong>
                  <small>{latestPoint.reason}</small>
                </div>
              </div>

              <div className="metric-grid">
                <MetricCard label="最終評価額" value={formatCurrency(backtest.metrics.finalValue, displaySymbol)} tone={backtest.metrics.totalReturn >= 0 ? "good" : "bad"} />
                <MetricCard label="自動売買リターン" value={formatPercent(backtest.metrics.totalReturn)} tone={backtest.metrics.totalReturn >= 0 ? "good" : "bad"} />
                <MetricCard label="Buy & Hold" value={formatPercent(backtest.metrics.buyAndHoldReturn)} />
                <MetricCard label="超過リターン" value={formatPercent(backtest.metrics.excessReturn)} tone={backtest.metrics.excessReturn >= 0 ? "good" : "bad"} />
                <MetricCard label="最大DD" value={formatPercent(backtest.metrics.maxDrawdown)} tone="bad" />
                <MetricCard label="勝率" value={formatPercent(backtest.metrics.winRate)} />
                <MetricCard label="取引回数" value={`${backtest.metrics.trades}件`} />
                <MetricCard label="PF / 稼働率" value={`${formatProfitFactor(backtest.metrics.profitFactor)} / ${formatPercent(backtest.metrics.exposureRate)}`} />
              </div>

              <EquityCurveChart result={backtest} />

              <section className="trade-log">
                <div className="trade-log-head">
                  <div>
                    <span>Trade log</span>
                    <strong>直近20件の自動売買</strong>
                  </div>
                  <p>{backtest.metrics.wins}勝 / {backtest.metrics.losses}敗 / 往復 {backtest.metrics.roundTrips} 回</p>
                </div>

                {latestTrades.length === 0 ? (
                  <div className="no-trades">この条件では売買が発生していません。期間や戦略パラメータを調整してください。</div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>日付</th>
                          <th>売買</th>
                          <th>価格</th>
                          <th>株数</th>
                          <th>金額</th>
                          <th>損益</th>
                          <th>理由</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestTrades.map((trade) => (
                          <tr key={trade.id}>
                            <td>{trade.date}</td>
                            <td><span className={`side ${trade.side.toLowerCase()}`}>{trade.side}</span></td>
                            <td>{formatCurrency(trade.price, displaySymbol)}</td>
                            <td>{formatNumber(trade.shares, 4)}</td>
                            <td>{formatCurrency(trade.value, displaySymbol)}</td>
                            <td className={(trade.pnl ?? 0) >= 0 ? "pnl-up" : "pnl-down"}>{trade.pnl === undefined ? "—" : formatCurrency(trade.pnl, displaySymbol)}</td>
                            <td>{trade.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
