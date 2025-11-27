import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset } from '../types';

interface Props {
  assets: Asset[];
}

const AssetPieChart: React.FC<Props> = ({ assets }) => {
  // 氣質馬卡龍色系
  const COLORS = [
    '#fb7185', // Rose
    '#818cf8', // Indigo
    '#34d399', // Emerald
    '#fcd34d', // Amber
    '#60a5fa', // Blue
    '#c084fc'  // Purple
  ];

  const data = assets.map((asset, index) => ({
    name: asset.name,
    value: asset.value,
    color: asset.color || COLORS[index % COLORS.length]
  })).filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-rose-300">尚未累積資產 🎈</div>;
  }

  return (
    <div className="w-full h-[350px] bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(129,140,248,0.2)] border border-indigo-50 p-6">
      <h3 className="text-xl font-bold text-slate-700 mb-2 flex items-center gap-2">
        <span className="text-2xl">🍰</span> 資產大餅
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={6}
            dataKey="value"
            cornerRadius={8}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              color: '#475569'
            }}
          />
          <Legend 
             verticalAlign="bottom" 
             height={36}
             iconType="circle"
             wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetPieChart;