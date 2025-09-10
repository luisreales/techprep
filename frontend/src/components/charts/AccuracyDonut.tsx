import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  value: number; // 0-1
}

const COLORS = ['#4ade80', '#f87171'];

export const AccuracyDonut: React.FC<Props> = ({ value }) => {
  const data = [
    { name: 'correct', value },
    { name: 'incorrect', value: 1 - value },
  ];
  return (
    <ResponsiveContainer width={200} height={200}>
      <PieChart>
        <Pie data={data} innerRadius={60} outerRadius={80} dataKey="value">
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
