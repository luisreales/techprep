import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Datum {
  step: number;
  value: number;
}

interface Props {
  data: Datum[];
}

export const ProgressLine: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <XAxis dataKey="step" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#34d399" />
    </LineChart>
  </ResponsiveContainer>
);
