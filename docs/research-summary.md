# Research Summary

## 優先データAPI

- 無料/低コストで始める: Alpha Vantage、FMP、Finnhub、Twelve Data、EODHD、SEC EDGAR、J-Quants、EDINET、FRED、GDELT、CoinGecko、CoinMarketCap
- 日本株重視: J-Quants、EDINET、TDnet/J-Quants TDnetアドオン、kabuステーション、立花証券e支店
- 暗号資産重視: CoinGecko、CoinMarketCap、CCXT、Binance、Bybit、OKX、Kraken
- ニュース/センチメント: Alpha Vantage News Sentiment、News API、GDELT、Benzinga、Finnhub News
- 機関投資家品質: Bloomberg、LSEG、FactSet、S&P Capital IQ、Nasdaq Data Linkの有料データセット

## 優先ブローカー/API

### ネイティブのトレーリングストップが強い候補

- Interactive Brokers
- Alpaca
- TradeStation
- OANDA
- Binance
- Bybit
- OKX
- Kraken

### 日本国内で自動売買の現実性が高い候補

- 三菱UFJ eスマート証券 kabuステーションAPI
- 立花証券e支店API
- 楽天証券 MarketSpeed II RSS
- SBIネオトレード証券 ネオトレAPI for Excel
- moomoo Japan OpenAPI/API Skill
- GMOコイン 外国為替FX API

## 実装方針

1. 調査DBをAI可読なTypeScript配列として維持
2. Excel/CSVをCI artifactで自動生成
3. UIでユーザーが戦略・API・ブローカーを選ぶ
4. AI側もprofileから自動推奨
5. 注文Intentをブローカー別payloadに変換
6. 本番発注はSecretsと環境フラグが揃うまで遮断
7. トレーリング未対応ブローカーは監視ループでエミュレーション

## 次の拡張

- Alpaca paper/live adapterの実ネットワーク送信
- Binance/Bybit/OKX/Kraken署名付きREST adapter
- J-Quants/EDINET自動取得ジョブ
- ニュース要約/センチメント推論ジョブ
- SQLite/PostgreSQLで注文・約定・シグナル履歴を保存
- WebSocket価格監視とトレーリングストップエミュレーター
- Docker本番構成
