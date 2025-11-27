import React, { useState } from 'react';
import { CandleData, StockQuote } from '../types';
import { analyzeStockWithGemini } from '../services/api';

interface Props {
  symbol: string;
  quote: StockQuote | null;
  candles: CandleData[];
}

const MarketAnalysis: React.FC<Props> = ({ symbol, quote, candles }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!quote || candles.length === 0) return;
    setLoading(true);
    const result = await analyzeStockWithGemini(symbol, quote, candles);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(251,113,133,0.15)] border border-rose-100 p-8 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 text-9xl opacity-5 pointer-events-none -mr-4 -mt-4">✨</div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg">
            AI
          </div>
           Gemini 智囊團
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={loading || !quote}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 active:scale-95 ${
            loading || !quote
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-400 to-indigo-400 text-white shadow-lg hover:shadow-rose-200'
          }`}
        >
          {loading ? '🔮 魔法詠唱中...' : `✨ 分析 ${symbol}`}
        </button>
      </div>

      <div className="relative">
        <div className="bg-rose-50/50 rounded-2xl p-6 min-h-[150px] border border-rose-100 relative">
            {/* 裝飾小箭頭，做成對話框樣式 */}
            <div className="absolute -top-2 left-8 w-4 h-4 bg-rose-50/50 border-t border-l border-rose-100 transform rotate-45"></div>
            
            {analysis ? (
            <div className="text-slate-600 leading-8 whitespace-pre-line text-sm font-medium">
                {analysis}
            </div>
            ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="text-4xl mb-3 animate-pulse">💭</div>
                <p>點擊按鈕，讓 Gemini 為您解讀市場秘密</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;