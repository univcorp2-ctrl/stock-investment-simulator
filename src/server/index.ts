import express from'express';import{brokerApis,marketDataProviders,researchMetadata,strategyLibrary}from'../shared/research';import{DEFAULT_STRATEGY_PROFILE,recommendStrategy,type StrategyProfile}from'../shared/strategyAdvisor';import{buildOrderPreview,type OrderIntent}from'../shared/execution';
const app=express();const port=Number(process.env.PORT??3001);app.use(express.json({limit:'1mb'}));
app.get('/api/health',(_q,r)=>r.json({ok:true,app:'investment-api-auto-trading-cockpit',version:'1.0.0'}));
app.get('/api/research',(_q,r)=>r.json({metadata:researchMetadata,marketDataProviders,brokerApis,strategyLibrary}));
app.post('/api/strategy/recommend',(q,r)=>r.json(recommendStrategy({...DEFAULT_STRATEGY_PROFILE,...(q.body??{})} as StrategyProfile)));
app.post('/api/trading/order-preview',(q,r)=>r.json(buildOrderPreview(q.body as OrderIntent)));
app.post('/api/trading/live-order',(q,r)=>{const preview=buildOrderPreview({...q.body,live:true} as OrderIntent);if(!preview.valid){r.status(400).json(preview);return;}if(process.env.LIVE_TRADING_ENABLED!=='true'){r.status(403).json({ok:false,blocked:true,reason:'LIVE_TRADING_ENABLED is not true. Live trading is intentionally blocked by default.',preview});return;}r.status(501).json({ok:false,reason:'Broker network adapters are payload-ready but require real credentials and per-broker enablement.',preview});});
app.listen(port,()=>console.log(`API listening on http://localhost:${port}`));
