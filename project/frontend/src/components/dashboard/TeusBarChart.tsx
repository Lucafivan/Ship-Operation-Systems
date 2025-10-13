import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#03c0ff', '#ffc658'];

interface Props {
  title: string;
  data: { name: string; value: number }[];
}

const TeusBarChart: React.FC<Props> = ({ title, data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: '500px' }}>
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">{title}</h2>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#4A5568' }} />
          <YAxis tick={{ fill: '#4A5568' }} />
          <Tooltip cursor={{ fill: 'rgba(230, 247, 237, 0.5)' }} contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} />
          <Legend />
          <Bar dataKey="value" name="Jumlah TEUs" barSize={60}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeusBarChart;
