import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area
} from 'recharts';
import { CandleData } from '../types';
import { COLORS } from '../constants';

interface StockChartProps {
  data: CandleData[];
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-rose-300 bg-white rounded-3xl border border-rose-100 shadow-sm">
        <div className="animate-bounce text-4xl mb-2">🐻</div>
        <div>努力載入數據中...</div>
      </div>
    );
  }

  // 計算 Y 軸範圍
  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const domainMin = Math.floor(minPrice * 0.98);
  const domainMax = Math.ceil(maxPrice * 1.02);

  return (
    <div className="w-full h-[450px] bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(251,113,133,0.2)] border border-rose-100 p-6 relative overflow-hidden">
      {/* 裝飾背景圓點 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 opacity-50 z-0 pointer-events-none"></div>
      
      <div className="mb-6 flex justify-between items-center relative z-10">
        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <span className="bg-rose-100 text-rose-500 p-2 rounded-xl text-sm">📈</span>
          {symbol} 走勢圖
        </h3>
        <div className="text-xs font-medium text-slate-400 flex gap-3 bg-slate-50 px-3 py-1 rounded-full">
            <span className="flex items-center"><div className="w-2 h-2 bg-rose-400 rounded-full mr-1.5 shadow-sm"></div>收盤價</span>
            <span className="flex items-center"><div className="w-2 h-2 bg-slate-300 rounded-full mr-1.5"></div>成交量</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.PRIMARY} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS.PRIMARY} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffe4e6" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#94a3b8' }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            dy={10}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={[domainMin, domainMax]} 
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toFixed(0)}
            dx={5}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tick={false} 
            axisLine={false} 
            width={0}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px', 
              border: '2px solid #fff1f2', 
              boxShadow: '0 8px 16px rgba(251, 113, 133, 0.15)',
              padding: '12px'
            }}
            labelStyle={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
            cursor={{ stroke: '#fda4af', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number, name: string) => [
                <span className="font-bold text-slate-700">{name === 'close' ? `$${value}` : value.toLocaleString()}</span>, 
                <span className="text-slate-400 text-xs">{name === 'close' ? '收盤價' : '成交量'}</span>
            ]}
          />
          
          {/* 成交量 Bar - 圓潤化 */}
          <Bar dataKey="volume" yAxisId="left" barSize={12} radius={[6, 6, 6, 6]}>
             {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.close > entry.open ? COLORS.UP : COLORS.DOWN} 
                  opacity={0.2} 
                />
              ))}
          </Bar>

          {/* 收盤價 Line - 柔和曲線 */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="close"
            stroke="none"
            fill="url(#colorPrice)"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="close" 
            stroke={COLORS.PRIMARY} 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: COLORS.PRIMARY }}
          />
          
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;