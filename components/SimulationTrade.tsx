import React, { useState } from 'react';
import { StockQuote, Transaction, MarketMode } from '../types';
import { fetchQuote } from '../services/api';
import { addTransaction, getAssets, saveAsset } from '../services/storage';

interface Props {
  currentSymbol: string;
  mode: MarketMode;
  onTradeComplete: () => void;
}

const SimulationTrade: React.FC<Props> = ({ currentSymbol, mode, onTradeComplete }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleQuote = async () => {
    setLoading(true);
    const q = await fetchQuote(currentSymbol, mode);
    setQuote(q);
    setLoading(false);
  };

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (!quote) return;
    
    const totalPrice = quote.price * quantity;
    const assets = getAssets();
    const cashAsset = assets.find(a => a.type === 'CASH');

    if (type === 'BUY') {
      if (!cashAsset || cashAsset.value < totalPrice) {
        setMsg("👛 哎呀！私房錢不夠了");
        return;
      }
      cashAsset.value -= totalPrice;
    } else {
       if (cashAsset) cashAsset.value += totalPrice;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symbol: currentSymbol,
      type,
      price: quote.price,
      quantity,
      total: totalPrice
    };

    addTransaction(newTx);
    if (cashAsset) saveAsset(cashAsset);
    
    const existingStock = assets.find(a => a.symbol === currentSymbol && a.type === 'STOCK');
    if (existingStock) {
        if (type === 'BUY') {
            const oldTotal = (existingStock.avgCost || 0) * (existingStock.quantity || 0);
            const newQty = (existingStock.quantity || 0) + quantity;
            existingStock.avgCost = (oldTotal + totalPrice) / newQty;
            existingStock.quantity = newQty;
            existingStock.value = quote.price * newQty;
        } else {
            const newQty = (existingStock.quantity || 0) - quantity;
            if (newQty <= 0) {
                 existingStock.quantity = 0;
                 existingStock.value = 0;
            } else {
                existingStock.quantity = newQty;
                existingStock.value = (existingStock.avgCost || 0) * newQty;
            }
        }
        saveAsset(existingStock);
    } else if (type === 'BUY') {
        saveAsset({
            id: Date.now().toString() + '_stock',
            name: currentSymbol,
            symbol: currentSymbol,
            type: 'STOCK',
            quantity: quantity,
            avgCost: quote.price,
            value: totalPrice,
            color: '#fb7185'
        });
    }

    setMsg(`🎉 ${type === 'BUY' ? '入手' : '獲利'} ${quantity} 股成功！`);
    onTradeComplete(); 
    
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(252,211,77,0.2)] border border-amber-100 p-8 h-fit">
      <h3 className="text-xl font-bold text-slate-700 mb-6 border-b border-amber-50 pb-4 flex items-center gap-2">
         <span className="text-2xl">🛍️</span> 下單櫃台
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-rose-50 p-4 rounded-2xl border border-rose-100">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Target</span>
            <div className="font-black text-2xl text-slate-700">{currentSymbol}</div>
          </div>
          <button 
            onClick={handleQuote}
            disabled={loading}
            className="text-sm bg-white text-rose-500 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition font-bold border border-rose-100"
          >
            {loading ? '⌛' : '🔄 詢價'}
          </button>
        </div>

        {quote && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs text-slate-400 mb-1">市價 Price</div>
              <div className={`text-2xl font-black ${quote.change >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                ${quote.price}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs text-slate-400 mb-1">漲幅 Change</div>
              <div className={`text-lg font-bold ${quote.change >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {quote.percentChange}%
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">📦 交易股數</label>
          <div className="relative">
            <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-4 pl-6 border border-slate-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none text-lg font-bold text-slate-700 bg-slate-50 transition-all"
                min="1"
            />
            <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">股</span>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            onClick={() => handleTrade('BUY')}
            disabled={!quote}
            className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-1"
          >
            <span>買進</span>
            <span className="text-xs opacity-80 uppercase">Buy</span>
          </button>
          <button 
            onClick={() => handleTrade('SELL')}
            disabled={!quote}
            className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-1"
          >
             <span>賣出</span>
             <span className="text-xs opacity-80 uppercase">Sell</span>
          </button>
        </div>
        
        {msg && (
            <div className="text-center p-3 bg-indigo-50 text-indigo-500 rounded-xl text-sm font-bold animate-pulse">
                {msg}
            </div>
        )}
      </div>
    </div>
  );
};

export default SimulationTrade;