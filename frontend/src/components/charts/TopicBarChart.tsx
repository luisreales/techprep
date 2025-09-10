import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Datum {
  topic: string;
  value: number;
}

interface Props {
  data: Datum[];
}

export const TopicBarChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="topic" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#60a5fa" />
    </BarChart>
  </ResponsiveContainer>
);
