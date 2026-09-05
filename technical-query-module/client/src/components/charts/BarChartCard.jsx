import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE } from '../../constants';
import EmptyState from '../common/EmptyState';

export default function BarChartCard({ title, data, bars, xKey = 'name', height = 280 }) {
  return (
    <div className="card p-4">
      {title && <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>}
      {!data || data.length === 0 ? (
        <EmptyState title="No data for this period" />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-slate-800" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {bars.map((bar, idx) => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color || CHART_PALETTE[idx % CHART_PALETTE.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
