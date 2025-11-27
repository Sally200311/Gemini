import React, { useState, useEffect } from 'react';
import { APP_NAME, DEFAULT_SYMBOL } from './constants';
import { MarketMode, CandleData, StockQuote, Asset, Transaction } from './types';
import { fetchStockCandles, fetchQuote, isMockMode } from './services/api';
import { getAssets, getTransactions, saveAsset, deleteAsset } from './services/storage';

// Components
import StockChart from './components/StockChart';
import AssetPieChart from './components/AssetPieChart';
import MarketAnalysis from './components/MarketAnalysis';
import SimulationTrade from './components/SimulationTrade';

const App: React.FC = () => {
  // Global State
  const [mode, setMode] = useState<MarketMode>(isMockMode ? MarketMode.MOCK : MarketMode.REAL);
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MARKET' | 'LEARN'>('MARKET');
  
  // Data State
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(DEFAULT_SYMBOL);

  // Initial Load
  useEffect(() => {
    refreshAssets();
    loadMarketData(symbol);
  }, [mode]);

  const refreshAssets = () => {
    setAssets(getAssets());
    setTransactions(getTransactions());
  };

  const loadMarketData = async (sym: string) => {
    setLoading(true);
    try {
      const [candleData, quoteData] = await Promise.all([
        fetchStockCandles(sym, 'D', mode),
        fetchQuote(sym, mode)
      ]);
      setCandles(candleData);
      setQuote(quoteData);
      setSymbol(sym);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadMarketData(searchInput.toUpperCase());
    }
  };

  // Helper: Calculate Total Net Worth
  const totalNetWorth = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

  // --- Render Sections ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 總資產卡片 */}
        <div className="bg-gradient-to-br from-rose-400 via-rose-300 to-indigo-300 text-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(251,113,133,0.5)] transform hover:scale-[1.02] transition-transform relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
          
          <h2 className="text-lg font-medium opacity-90 mb-2 flex items-center gap-2">
            <span>👛</span> 總資產淨值
          </h2>
          <div className="text-5xl font-black tracking-tight drop-shadow-sm mb-6">
             ${totalNetWorth.toLocaleString()}
          </div>
          <div className="flex gap-3 flex-wrap relative z-10">
            <span className="bg-white/30 border border-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2">
               💵 現金 ${(assets.find(a=>a.type==='CASH')?.value || 0).toLocaleString()}
            </span>
            <span className="bg-white/30 border border-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2">
               📈 股票 ${assets.filter(a=>a.type==='STOCK').reduce((s,a)=>s+(a.value||0),0).toLocaleString()}
            </span>
          </div>
        </div>
        <AssetPieChart assets={assets} />
      </div>

      {/* Manual Asset Management */}
      <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8">
        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            <span className="bg-amber-100 p-2 rounded-xl text-amber-500">📝</span> 我的資產列表
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-400 uppercase bg-rose-50/50 rounded-lg">
              <tr>
                <th className="px-6 py-4 rounded-l-2xl">資產名稱</th>
                <th className="px-6 py-4">類型</th>
                <th className="px-6 py-4">數量/成本</th>
                <th className="px-6 py-4">現值</th>
                <th className="px-6 py-4 rounded-r-2xl">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 rounded-full" style={{backgroundColor: asset.color || '#cbd5e1'}}></div>
                        {asset.name} {asset.symbol && <span className="text-xs text-slate-400 font-normal">({asset.symbol})</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${asset.type === 'CASH' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{asset.quantity ? `${asset.quantity}股 @ ${asset.avgCost}` : '-'}</td>
                  <td className="px-6 py-4 font-black text-slate-700">${asset.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        deleteAsset(asset.id);
                        refreshAssets();
                      }}
                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-400 hover:text-white transition flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-2xl flex gap-3 items-center">
          <span className="text-2xl">💡</span>
          <span className="font-medium">小提示：股票價值在模擬交易時會根據買賣自動更新，現金亦同。您也可手動新增房地產或其他資產。</span>
        </div>
      </div>
    </div>
  );

  const renderMarket = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Column: Chart & Search */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-rose-100 items-center">
            <span className="pl-4 text-2xl">🔍</span>
            <form onSubmit={handleSearch} className="flex-1">
                <input 
                type="text" 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 font-bold"
                placeholder="輸入股票代號 (如: AAPL, TSLA)"
                />
            </form>
            <button 
                onClick={(e) => handleSearch(e)}
                className="bg-rose-400 text-white px-6 py-2 rounded-full font-bold hover:bg-rose-500 transition shadow-md shadow-rose-200"
            >
              搜尋
            </button>
        </div>

        {/* 時間區間按鈕群 */}
        <div className="flex gap-2">
            {['1M', '3M', '1Y'].map(range => (
               <button key={range} className="px-6 py-2 rounded-full text-sm font-bold bg-white text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition shadow-sm border border-rose-50">
                 {range}
               </button>
            ))}
        </div>

        <StockChart data={candles} symbol={symbol} />

        <MarketAnalysis symbol={symbol} quote={quote} candles={candles} />
      </div>

      {/* Right Column: Trade & History */}
      <div className="space-y-8">
        <SimulationTrade 
          currentSymbol={symbol} 
          mode={mode} 
          onTradeComplete={refreshAssets}
        />
        
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
          <h4 className="text-lg font-bold text-slate-700 mb-4 sticky top-0 bg-white pb-2 z-10 flex items-center gap-2">
             <span className="bg-slate-100 p-1.5 rounded-lg">📜</span> 歷史足跡
          </h4>
          <div className="space-y-3">
             {transactions.length === 0 && <div className="text-slate-400 text-sm text-center py-10 bg-slate-50 rounded-2xl">🍃 暫無交易紀錄</div>}
             {transactions.map(tx => (
               <div key={tx.id} className="flex justify-between items-center text-sm bg-slate-50 p-4 rounded-2xl hover:bg-white hover:shadow-md transition border border-transparent hover:border-rose-100">
                 <div className="flex items-center gap-3">
                   <div className={`w-2 h-8 rounded-full ${tx.type === 'BUY' ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                   <div>
                     <div className="font-bold text-slate-700">{tx.symbol}</div>
                     <div className="text-xs text-slate-400">{tx.date}</div>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className={`font-bold ${tx.type === 'BUY' ? 'text-rose-500' : 'text-emerald-500'}`}>
                     {tx.type === 'BUY' ? '買入' : '賣出'} {tx.quantity}
                   </div>
                   <div className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded-full inline-block mt-1 border border-slate-100">
                        ${tx.price}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(251,113,133,0.1)] border border-rose-100 p-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
            <span className="text-6xl inline-block mb-4 animate-bounce">🎓</span>
            <h2 className="text-3xl font-black text-slate-700">新手投資教室</h2>
            <p className="text-slate-400 mt-2">從零開始，慢慢變強！</p>
        </div>
        
        <div className="space-y-8">
            <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                    <span className="bg-white p-1 rounded-lg shadow-sm">📊</span> 1. 什麼是 K 線圖？
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    K 線就像是市場的心電圖！
                    <br/>
                    在台灣股市：
                    <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-500 rounded font-bold mx-1">紅棒</span>
                    代表今天收盤價比開盤高（漲了！開心！），
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-500 rounded font-bold mx-1">綠棒</span>
                    代表收盤比開盤低（跌了，別難過）。
                </p>
            </section>
            
            <section className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-rose-500 mb-3 flex items-center gap-2">
                    <span className="bg-white p-1 rounded-lg shadow-sm">🎯</span> 2. 怎麼看買賣點？
                </h3>
                <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-3">
                        <span className="mt-1 text-rose-400">●</span>
                        <span><strong className="text-slate-800">成交量放大：</strong> 就像很多人排隊買珍奶，代表這檔股票現在很熱門！</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="mt-1 text-rose-400">●</span>
                        <span><strong className="text-slate-800">支撐與壓力：</strong> 想像股價在地板（支撐）上跳，碰到天花板（壓力）會彈下來。</span>
                    </li>
                </ul>
            </section>

            <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-3xl border border-amber-200 flex gap-4 items-start">
                <div className="text-3xl">🤖</div>
                <div>
                    <h4 className="font-bold text-amber-700 mb-1">AI 小助手的悄悄話</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed">
                        投資就像馬拉松，不是百米衝刺。建議先用我們的「模擬交易」模式練練手感，
                        搭配 Gemini 的分析，找到屬於你的投資節奏。保持心情愉快最重要喔！
                    </p>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 font-[Nunito]">
      {/* Navigation - Floating Style */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2">
        <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm rounded-full px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">💎</span>
              <span className="font-bold text-xl text-slate-700 tracking-tight hidden sm:block">{APP_NAME}</span>
            </div>
            
            <div className="hidden md:flex space-x-2 bg-slate-100/50 p-1.5 rounded-full">
                {(['MARKET', 'DASHBOARD', 'LEARN'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                            activeTab === tab 
                            ? 'bg-white text-rose-500 shadow-md shadow-rose-100' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        }`}
                    >
                        {tab === 'MARKET' && '行情交易'}
                        {tab === 'DASHBOARD' && '資產看板'}
                        {tab === 'LEARN' && '投資教室'}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  mode === MarketMode.REAL 
                  ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-600 border border-amber-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${mode === MarketMode.REAL ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                {mode === MarketMode.REAL ? '真實模式' : '模擬練習'}
              </div>
              {!isMockMode && (
                <button 
                  onClick={() => setMode(m => m === MarketMode.REAL ? MarketMode.MOCK : MarketMode.REAL)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
                  title="切換模式"
                >
                  ⇄
                </button>
              )}
            </div>
        </nav>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-rose-100 shadow-xl shadow-rose-100/50 rounded-full flex justify-around p-2 z-50">
          {[
              { id: 'MARKET', icon: '📈', label: '行情' },
              { id: 'DASHBOARD', icon: '👛', label: '資產' },
              { id: 'LEARN', icon: '🎓', label: '教學' }
          ].map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className={`flex-1 flex flex-col items-center justify-center py-2 rounded-full transition-all ${
                    activeTab === item.id ? 'bg-rose-50 text-rose-500' : 'text-slate-300 grayscale'
                }`}
            >
                <span className="text-xl mb-0.5">{item.icon}</span>
                <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
        {activeTab === 'MARKET' && renderMarket()}
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'LEARN' && renderLearn()}
      </main>
    </div>
  );
};

export default App;