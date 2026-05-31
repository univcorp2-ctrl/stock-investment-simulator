import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { brokerApis, marketDataProviders, researchMetadata, strategyLibrary, type BrokerApi, type DataProvider, type StrategyMethod } from "../shared/research";
import { DEFAULT_STRATEGY_PROFILE, recommendStrategy, type StrategyProfile } from "../shared/strategyAdvisor";
import { buildOrderPreview, type OrderIntent, type OrderSide, type OrderStyle } from "../shared/execution";

type Tab = "overview" | "apis" | "brokers" | "strategy" | "orders";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "全体像" },
  { id: "apis", label: "API調査DB" },
  { id: "brokers", label: "証券会社/取引所" },
  { id: "strategy", label: "戦略ビルダー" },
  { id: "orders", label: "発注プレビュー" }
];

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ProviderCard({ provider }: { provider: DataProvider }) {
  return (
    <article className="data-card">
      <div className="card-heading">
        <h3>{provider.name}</h3>
        <Badge tone={provider.priority === "core" ? "good" : provider.priority === "enterprise" ? "warn" : "neutral"}>{provider.priority}</Badge>
      </div>
      <p>{provider.bestFor}</p>
      <div className="chips">{provider.assets.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
      <dl>
        <dt>無料</dt><dd>{provider.freeTier}</dd>
        <dt>有料</dt><dd>{provider.paidFrom}</dd>
        <dt>形式</dt><dd>{provider.aiReadyFormats.join(" / ")}</dd>
      </dl>
      <small className="muted">注意: {provider.limitations}</small>
    </article>
  );
}

function BrokerCard({ broker }: { broker: BrokerApi }) {
  const tone = broker.nativeTrailingStop === "yes" ? "good" : broker.nativeTrailingStop === "partial" || broker.nativeTrailingStop === "emulated" ? "warn" : "neutral";
  return (
    <article className="data-card broker-card">
      <div className="card-heading">
        <h3>{broker.name}</h3>
        <Badge tone={tone}>trailing: {broker.nativeTrailingStop}</Badge>
      </div>
      <p>{broker.bestFor}</p>
      <div className="chips">{broker.assets.map((asset) => <span key={asset}>{asset}</span>)}</div>
      <dl>
        <dt>API</dt><dd>{broker.apiStyle}</dd>
        <dt>Sandbox</dt><dd>{broker.sandbox}</dd>
        <dt>実装</dt><dd>{broker.adapterStatus}</dd>
      </dl>
      <small className="muted">{broker.limitations}</small>
    </article>
  );
}

function StrategyCard({ strategy }: { strategy: StrategyMethod }) {
  return (
    <article className="strategy-card">
      <div>
        <span className="strategy-family">{strategy.family}</span>
        <h3>{strategy.name}</h3>
        <p>{strategy.strengths}</p>
      </div>
      <div className="chips">{strategy.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
      <small className="muted">リスク: {strategy.risks}</small>
    </article>
  );
}

function updateProfile<K extends keyof StrategyProfile>(profile: StrategyProfile, key: K, value: StrategyProfile[K]): StrategyProfile {
  return { ...profile, [key]: value };
}

function updateIntent<K extends keyof OrderIntent>(intent: OrderIntent, key: K, value: OrderIntent[K]): OrderIntent {
  return { ...intent, [key]: value };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [providerFilter, setProviderFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("");
  const [profile, setProfile] = useState<StrategyProfile>(DEFAULT_STRATEGY_PROFILE);
  const [intent, setIntent] = useState<OrderIntent>({
    brokerId: "alpaca",
    symbol: "AAPL",
    assetClass: "equity",
    side: "sell",
    quantity: 10,
    orderStyle: "trailing_stop",
    trailPercent: 3,
    timeInForce: "gtc",
    maxNotional: 50000,
    live: false
  });

  const recommendation = useMemo(() => recommendStrategy(profile), [profile]);
  const preview = useMemo(() => buildOrderPreview(intent), [intent]);

  const filteredProviders = useMemo(() => {
    const query = providerFilter.trim().toLowerCase();
    if (!query) return marketDataProviders;
    return marketDataProviders.filter((provider) => `${provider.name} ${provider.category} ${provider.assets.join(" ")} ${provider.dataTypes.join(" ")}`.toLowerCase().includes(query));
  }, [providerFilter]);

  const filteredBrokers = useMemo(() => {
    const query = brokerFilter.trim().toLowerCase();
    if (!query) return brokerApis;
    return brokerApis.filter((broker) => `${broker.name} ${broker.region} ${broker.assets.join(" ")} ${broker.apiStyle}`.toLowerCase().includes(query));
  }, [brokerFilter]);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow">AI-readable investment data cockpit</div>
          <h1>投資API調査・戦略選定・自動売買準備をひとつの画面に統合</h1>
          <p>
            株価、暗号資産、FX、決算書、ニュース、マクロ、証券会社APIを横断管理し、ユーザー選択とAI自動設定の両方で戦略を構築します。
            実注文は安全ゲートで遮断し、Paper→少額→Liveの順に移行できる設計です。
          </p>
          <div className="hero-actions">
            <button onClick={() => setActiveTab("strategy")}>戦略を作る</button>
            <button className="secondary" onClick={() => setActiveTab("orders")}>発注プレビュー</button>
          </div>
        </div>
        <div className="terminal-panel">
          <div className="terminal-top"><span></span><span></span><span></span></div>
          <pre>{`research.lastVerified = ${researchMetadata.lastVerifiedDate}\nproviders = ${researchMetadata.providerCount}\nbrokers = ${researchMetadata.brokerCount}\nstrategies = ${researchMetadata.strategyCount}\nmode = PAPER_BY_DEFAULT\nexcel = dist/research/${researchMetadata.workbookFileName}`}</pre>
        </div>
      </section>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <section className="panel-grid">
          <StatCard label="API/データソース" value={researchMetadata.providerCount} detail="無料・有料・法人向けを分類" />
          <StatCard label="証券/取引所API" value={researchMetadata.brokerCount} detail="自動売買とトレーリング対応を整理" />
          <StatCard label="戦略テンプレート" value={researchMetadata.strategyCount} detail="ファンダ・テクニカル・AIを統合" />
          <StatCard label="既定の安全設計" value="Paper" detail="LIVE_TRADING_ENABLEDなしでは実注文不可" />
          <article className="wide-card">
            <h2>実装済みの流れ</h2>
            <ol className="flow-list">
              <li><strong>調査DB</strong><span>API・料金・形式・注意点をAIが読める配列として保持</span></li>
              <li><strong>Excel生成</strong><span>GitHub Actionsで調査結果をxlsx artifact化</span></li>
              <li><strong>AI戦略選定</strong><span>リスク許容度・対象資産・予算から戦略/API/ブローカー候補を推奨</span></li>
              <li><strong>注文変換</strong><span>Alpaca、IBKR、Binance、Bybit、OKX、Krakenなどの発注payloadをプレビュー</span></li>
              <li><strong>本番ゲート</strong><span>Secretsと環境フラグが揃うまでlive endpointは403で停止</span></li>
            </ol>
          </article>
        </section>
      )}

      {activeTab === "apis" && (
        <section className="stack-panel">
          <div className="section-heading">
            <div>
              <h2>API調査DB</h2>
              <p>AIが読みやすいJSON/CSV/Excel/API形式に変換しやすいデータ源を優先表示します。</p>
            </div>
            <input value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} placeholder="例: crypto, J-Quants, news, fundamentals" />
          </div>
          <div className="card-grid">{filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
        </section>
      )}

      {activeTab === "brokers" && (
        <section className="stack-panel">
          <div className="section-heading">
            <div>
              <h2>自動売買対応ブローカー/取引所</h2>
              <p>ネイティブのトレーリングストップがない場合は、価格監視と注文訂正でエミュレーションします。</p>
            </div>
            <input value={brokerFilter} onChange={(event) => setBrokerFilter(event.target.value)} placeholder="例: Japan, crypto, FX, trailing" />
          </div>
          <div className="card-grid">{filteredBrokers.map((broker) => <BrokerCard key={broker.id} broker={broker} />)}</div>
        </section>
      )}

      {activeTab === "strategy" && (
        <section className="strategy-layout">
          <aside className="control-panel">
            <h2>AI戦略プロファイル</h2>
            <label>対象資産
              <select value={profile.assetClass} onChange={(event) => setProfile(updateProfile(profile, "assetClass", event.target.value as StrategyProfile["assetClass"]))}>
                <option value="equity">海外株/米国株</option>
                <option value="japan-equity">日本株</option>
                <option value="crypto">暗号資産</option>
                <option value="fx">FX</option>
                <option value="multi">マルチアセット</option>
              </select>
            </label>
            <label>時間軸
              <select value={profile.horizon} onChange={(event) => setProfile(updateProfile(profile, "horizon", event.target.value as StrategyProfile["horizon"]))}>
                <option value="intraday">短期/日中</option>
                <option value="swing">スイング</option>
                <option value="long">長期</option>
                <option value="multi">AIに任せる</option>
              </select>
            </label>
            <label>リスク許容度
              <select value={profile.riskTolerance} onChange={(event) => setProfile(updateProfile(profile, "riskTolerance", event.target.value as StrategyProfile["riskTolerance"]))}>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </label>
            <label>データ予算
              <select value={profile.dataBudget} onChange={(event) => setProfile(updateProfile(profile, "dataBudget", event.target.value as StrategyProfile["dataBudget"]))}>
                <option value="free">無料中心</option>
                <option value="low-cost">低コスト</option>
                <option value="paid">有料OK</option>
                <option value="enterprise">法人向けも含む</option>
              </select>
            </label>
            <label>自動化段階
              <select value={profile.automationLevel} onChange={(event) => setProfile(updateProfile(profile, "automationLevel", event.target.value as StrategyProfile["automationLevel"]))}>
                <option value="research">調査のみ</option>
                <option value="paper">Paper</option>
                <option value="assisted-live">人間確認付きLive</option>
                <option value="live">Live自動</option>
              </select>
            </label>
            <div className="toggle-row"><input id="fund" type="checkbox" checked={profile.prefersFundamental} onChange={(event) => setProfile(updateProfile(profile, "prefersFundamental", event.target.checked))} /><label htmlFor="fund">ファンダメンタル重視</label></div>
            <div className="toggle-row"><input id="tech" type="checkbox" checked={profile.prefersTechnical} onChange={(event) => setProfile(updateProfile(profile, "prefersTechnical", event.target.checked))} /><label htmlFor="tech">テクニカル重視</label></div>
            <div className="toggle-row"><input id="news" type="checkbox" checked={profile.prefersNews} onChange={(event) => setProfile(updateProfile(profile, "prefersNews", event.target.checked))} /><label htmlFor="news">ニュース/AI重視</label></div>
          </aside>

          <section className="recommendation-panel">
            <h2>AI推奨</h2>
            <div className="risk-strip">
              <span>最大1銘柄 {(recommendation.defaultRisk.maxPositionPct * 100).toFixed(0)}%</span>
              <span>損切り {(recommendation.defaultRisk.stopLossPct * 100).toFixed(1)}%</span>
              <span>トレーリング {(recommendation.defaultRisk.trailingStopPct * 100).toFixed(1)}%</span>
              <span>Paper {recommendation.defaultRisk.paperTradingDays}日</span>
            </div>
            <div className="recommendation-grid">
              <div>
                <h3>戦略</h3>
                {recommendation.strategies.map((strategy) => <StrategyCard key={strategy.id} strategy={strategy} />)}
              </div>
              <div>
                <h3>データ源</h3>
                <ul className="compact-list">{recommendation.dataProviders.map((provider) => <li key={provider.id}>{provider.name}<small>{provider.category}</small></li>)}</ul>
                <h3>ブローカー</h3>
                <ul className="compact-list">{recommendation.brokers.map((broker) => <li key={broker.id}>{broker.name}<small>trailing: {broker.nativeTrailingStop}</small></li>)}</ul>
                <h3>ガードレール</h3>
                <ul className="guard-list">{recommendation.guardrails.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </section>
        </section>
      )}

      {activeTab === "orders" && (
        <section className="order-layout">
          <aside className="control-panel">
            <h2>発注プレビュー</h2>
            <label>ブローカー
              <select value={intent.brokerId} onChange={(event) => setIntent(updateIntent(intent, "brokerId", event.target.value))}>
                {brokerApis.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
              </select>
            </label>
            <label>銘柄/通貨ペア
              <input value={intent.symbol} onChange={(event) => setIntent(updateIntent(intent, "symbol", event.target.value))} />
            </label>
            <label>資産
              <select value={intent.assetClass} onChange={(event) => setIntent(updateIntent(intent, "assetClass", event.target.value as OrderIntent["assetClass"]))}>
                <option value="equity">海外株</option>
                <option value="japan-equity">日本株</option>
                <option value="crypto">暗号資産</option>
                <option value="fx">FX</option>
              </select>
            </label>
            <label>売買
              <select value={intent.side} onChange={(event) => setIntent(updateIntent(intent, "side", event.target.value as OrderSide))}>
                <option value="buy">買い</option>
                <option value="sell">売り</option>
              </select>
            </label>
            <label>注文型
              <select value={intent.orderStyle} onChange={(event) => setIntent(updateIntent(intent, "orderStyle", event.target.value as OrderStyle))}>
                <option value="market">成行</option>
                <option value="limit">指値</option>
                <option value="stop">逆指値</option>
                <option value="trailing_stop">トレーリングストップ</option>
              </select>
            </label>
            <label>数量
              <input type="number" value={intent.quantity} onChange={(event) => setIntent(updateIntent(intent, "quantity", Number(event.target.value)))} />
            </label>
            <label>指値
              <input type="number" value={intent.limitPrice ?? ""} onChange={(event) => setIntent(updateIntent(intent, "limitPrice", event.target.value ? Number(event.target.value) : undefined))} />
            </label>
            <label>トレーリング %
              <input type="number" value={intent.trailPercent ?? ""} onChange={(event) => setIntent(updateIntent(intent, "trailPercent", event.target.value ? Number(event.target.value) : undefined))} />
            </label>
            <label>最大想定金額
              <input type="number" value={intent.maxNotional ?? ""} onChange={(event) => setIntent(updateIntent(intent, "maxNotional", event.target.value ? Number(event.target.value) : undefined))} />
            </label>
            <div className="toggle-row"><input id="live" type="checkbox" checked={intent.live} onChange={(event) => setIntent(updateIntent(intent, "live", event.target.checked))} /><label htmlFor="live">Live発注として検証</label></div>
          </aside>

          <section className="payload-panel">
            <div className="card-heading">
              <h2>{preview.broker?.name ?? "未対応ブローカー"}</h2>
              <Badge tone={preview.valid ? "good" : "warn"}>{preview.valid ? "valid" : "needs fix"}</Badge>
            </div>
            <div className="warning-grid">
              {preview.errors.map((error) => <div className="alert error" key={error}>{error}</div>)}
              {preview.warnings.map((warning) => <div className="alert warn" key={warning}>{warning}</div>)}
              <div className="alert info">Safety mode: {preview.safetyMode}. 実注文は環境変数とSecretsがない限りAPI側で遮断します。</div>
            </div>
            <pre className="json-panel">{JSON.stringify(preview.payload, null, 2)}</pre>
          </section>
        </section>
      )}
    </main>
  );
}
