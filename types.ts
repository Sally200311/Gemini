export enum MarketMode {
  MOCK = 'MOCK',
  REAL = 'REAL'
}

export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'STOCK' | 'CASH' | 'REAL_ESTATE' | 'CRYPTO' | 'OTHER';
  value: number; // For manual assets
  quantity?: number; // For stocks
  symbol?: string; // For stocks
  avgCost?: number; // For stocks
  color?: string;
}

export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  total: number;
}

// 模擬 Finnhub 回傳格式
export interface FinnhubCandles {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  s: string;   // status
  t: number[]; // timestamp
  v: number[]; // volume
}
