import { FormEvent, useMemo, useState } from "react";
import { simulateInvestment } from "../shared/simulation";
import type { PricePoint, SimulationResult, Strategy } from "../shared/types";

interface HistoryResponse {
  symbol: string;
  from: string;
  to: string;
  prices: PricePoint[];
}

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 4
});

function isoYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function SimulationChart({ result }: { result: SimulationResult }) {
  const points = result.points.filter((_, index) => index % Math.ceil(result.points.length / 160) === 0);
  const width = 720;
  const height = 260;
  const padding = 28;
  const values = points.map((point) => point.totalValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point.totalValue - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart-card" aria-label="評価額推移チャート">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <polyline points={path} />
      </svg>
      <div className="chart-caption">
        <span>{result.firstDate}</span>
        <span>{result.lastDate}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [symbol, setSymbol] = useState("AAPL.US");
  const [from, setFrom] = useState(isoYearsAgo(5));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [initialCash, setInitialCash] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [strategy, setStrategy] = useState<Strategy>("monthly-dca");
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulation = useMemo(() => {
    if (!history) {
      return null;
    }

    try {
      return simulateInvestment({
        prices: history.prices,
        initialCash,
        monthlyContribution,
        strategy
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Simulation failed");
      return null;
    }
  }, [history, initialCash, monthlyContribution, strategy]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ symbol, from, to });
      const response = await fetch(`/api/history?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to fetch price data");
      }

      setHistory(payload as HistoryResponse);
    } catch (caught) {
      setHistory(null);
      setError(caught instanceof Error ? caught.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Real price data simulator</p>
        <h1>実株価で試せる株式投資シミュレーター</h1>
        <p className="lead">
          Stooq の日足終値を取得し、一括投資または毎月積立の結果を計算します。
        </p>
      </section>

      <section className="layout">
        <form className="panel" onSubmit={handleSubmit}>
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

          <label>
            初期投資額（USD）
            <input
              type="number"
              min="0"
              step="100"
              value={initialCash}
              onChange={(event) => setInitialCash(Number(event.target.value))}
            />
          </label>

          <label>
            毎月積立額（USD）
            <input
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(event) => setMonthlyContribution(Number(event.target.value))}
            />
          </label>

          <label>
            投資方法
            <select value={strategy} onChange={(event) => setStrategy(event.target.value as Strategy)}>
              <option value="monthly-dca">毎月積立</option>
              <option value="lump-sum">一括投資</option>
            </select>
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "取得中..." : "シミュレーションする"}
          </button>

          <p className="hint">例: AAPL.US / MSFT.US / SPY.US / 7203.JP</p>
        </form>

        <section className="results">
          {error && <div className="error">{error}</div>}

          {!simulation && !error && (
            <div className="empty-state">
              左の条件を入力して、実際の株価データで投資結果を計算してください。
            </div>
          )}

          {simulation && history && (
            <>
              <div className="result-header">
                <div>
                  <p className="eyebrow">{history.symbol}</p>
                  <h2>{simulation.firstDate} 〜 {simulation.lastDate}</h2>
                </div>
                <span className={simulation.profit >= 0 ? "badge positive" : "badge negative"}>
                  {percent(simulation.returnRate)}
                </span>
              </div>

              <div className="stat-grid">
                <article>
                  <span>最終評価額</span>
                  <strong>{currencyFormatter.format(simulation.finalValue)}</strong>
                </article>
                <article>
                  <span>投資元本</span>
                  <strong>{currencyFormatter.format(simulation.totalInvested)}</strong>
                </article>
                <article>
                  <span>損益</span>
                  <strong>{currencyFormatter.format(simulation.profit)}</strong>
                </article>
                <article>
                  <span>保有株数</span>
                  <strong>{numberFormatter.format(simulation.totalShares)}</strong>
                </article>
              </div>

              <SimulationChart result={simulation} />
            </>
          )}
        </section>
      </section>
    </main>
  );
}
