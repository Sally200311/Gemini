import { GoogleGenAI } from "@google/genai";
import { CandleData, FinnhubCandles, MarketMode, StockQuote } from '../types';
import { generateMockCandles } from '../constants';

// Declare process to fix TS2580
declare const process: any;

// 檢查環境變數 (支援 Vite 和標準 process.env)
const GEMINI_API_KEY = process.env.API_KEY || '';
// @ts-ignore
const FINNHUB_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FINNHUB_API_KEY : process.env.VITE_FINNHUB_API_KEY;

// 判斷是否強制 Mock 模式
export const isMockMode = !FINNHUB_API_KEY;

// Gemini 初始化
let aiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

/**
 * 取得 K 線資料 (Hybrid Mode)
 */
export const fetchStockCandles = async (symbol: string, resolution: string, mode: MarketMode): Promise<CandleData[]> => {
  // 1. 模擬模式或無 Key 時回傳假資料
  if (mode === MarketMode.MOCK || !FINNHUB_API_KEY) {
    console.log(`[API] Fetching MOCK candles for ${symbol}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(generateMockCandles(resolution === 'D' ? 60 : 30)), 800);
    });
  }

  // 2. 真實模式呼叫 Finnhub
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (resolution === 'D' ? 7776000 : 2592000); // 90 days or 30 days
    const resUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(resUrl);
    const data: FinnhubCandles = await response.json();

    if (data.s === 'ok') {
      return data.t.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));
    } else {
      throw new Error("Finnhub API returned no data");
    }
  } catch (error) {
    console.error("Finnhub Error:", error);
    // 失敗時自動降級為 Mock 防止白屏
    return generateMockCandles(30);
  }
};

/**
 * 取得即時報價 (Hybrid Mode)
 */
export const fetchQuote = async (symbol: string, mode: MarketMode): Promise<StockQuote> => {
  if (mode === MarketMode.MOCK || !FINNHUB_API_KEY) {
    console.log(`[API] Fetching MOCK quote for ${symbol}`);
    const mockPrice = 100 + Math.random() * 50;
    const prevClose = mockPrice - (Math.random() * 5 - 2.5);
    return new Promise(resolve => {
      setTimeout(() => resolve({
        symbol,
        price: parseFloat(mockPrice.toFixed(2)),
        change: parseFloat((mockPrice - prevClose).toFixed(2)),
        percentChange: parseFloat((((mockPrice - prevClose) / prevClose) * 100).toFixed(2)),
        high: parseFloat((mockPrice * 1.02).toFixed(2)),
        low: parseFloat((mockPrice * 0.98).toFixed(2)),
        open: parseFloat((prevClose * 1.01).toFixed(2)),
        prevClose: parseFloat(prevClose.toFixed(2)),
      }), 500);
    });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    const data = await response.json();
    return {
      symbol,
      price: data.c,
      change: data.d,
      percentChange: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
    };
  } catch (error) {
    console.error("Quote Error:", error);
    // Fallback
    const mockPrice = 150;
    return {
        symbol,
        price: mockPrice,
        change: 0,
        percentChange: 0,
        high: mockPrice,
        low: mockPrice,
        open: mockPrice,
        prevClose: mockPrice,
    }
  }
};

/**
 * Gemini 市場分析
 */
export const analyzeStockWithGemini = async (symbol: string, quote: StockQuote, candles: CandleData[]): Promise<string> => {
  if (!aiClient) {
    return `[模擬分析] 
由於未偵測到 API Key，系統啟動模擬分析模式。
針對 ${symbol} 的走勢，目前價格為 ${quote.price}。從技術面來看，近期呈現震盪整理格局。
建議投資人：
1. 觀察成交量變化。
2. 支撐位約在 ${quote.low}。
3. 若突破 ${quote.high} 可視為多頭訊號。
(此為模擬生成的建議，請配置真實 API Key 以獲得 AI 即時分析)`;
  }

  try {
    const prompt = `
    你是一位專業的華爾街分析師。請針對股票代號 ${symbol} 進行簡短精闢的分析。
    
    目前數據：
    - 現價: ${quote.price}
    - 漲跌幅: ${quote.percentChange}%
    - 過去幾天收盤價走勢: ${candles.slice(-5).map(c => c.close).join(', ')}
    
    請提供：
    1. 市場情緒總結 (Bullish/Bearish/Neutral)
    2. 3個關鍵觀察點
    3. 給散戶的具體操作建議
    
    請用繁體中文回答，語氣專業但親切。不要使用 Markdown 格式，直接分段純文字即可。
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix TS2322: handle undefined return
    return response.text || "AI 分析暫時無法取得回應。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 分析服務暫時無法使用，請稍後再試。";
  }
};