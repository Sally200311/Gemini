import { CandleData, Asset, Transaction } from './types';

export const APP_NAME = "Gemini 智富管家";

// 預設股票代號
export const DEFAULT_SYMBOL = "AAPL";

// 顏色定義 (氣質可愛風：暖紅、薄荷綠、柔粉、薰衣草紫)
export const COLORS = {
  UP: '#f43f5e', // Rose-500 (暖紅)
  DOWN: '#34d399', // Emerald-400 (薄荷綠)
  NEUTRAL: '#94a3b8', // Slate-400
  PRIMARY: '#fb7185', // Rose-400 (主色粉)
  SECONDARY: '#818cf8', // Indigo-400 (副色紫)
  ACCENT: '#fcd34d', // Amber-300 (點綴黃)
  BG_SOFT: '#fff1f2', // Rose-50
};

// 產生模擬 K 線資料
export const generateMockCandles = (days: number = 30): CandleData[] => {
  const data: CandleData[] = [];
  let basePrice = 150;
  const now = new Date();

  for (let i = days; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = basePrice * 0.05;
    const change = (Math.random() - 0.5) * volatility;
    const close = basePrice + change;
    const open = basePrice + (Math.random() - 0.5) * volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * volatility * 0.2;
    const low = Math.min(open, close) - Math.random() * volatility * 0.2;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    basePrice = close;
  }
  return data;
};

// 初始模擬資產
export const MOCK_ASSETS: Asset[] = [
  { id: '1', name: '私房錢 (現金)', type: 'CASH', value: 500000, color: '#fca5a5' }, // red-300
  { id: '2', name: '蘋果公司', symbol: 'AAPL', type: 'STOCK', quantity: 10, avgCost: 145, value: 0, color: '#fb7185' }, // rose-400
  { id: '3', name: '台積電', symbol: 'TSM', type: 'STOCK', quantity: 50, avgCost: 90, value: 0, color: '#818cf8' }, // indigo-400
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-01', symbol: 'AAPL', type: 'BUY', price: 145, quantity: 10, total: 1450 },
  { id: 't2', date: '2023-11-15', symbol: 'TSM', type: 'BUY', price: 90, quantity: 50, total: 4500 },
];