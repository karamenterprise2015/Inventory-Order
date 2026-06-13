'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export default function CategoryDistributionDonutChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        No category data available
      </div>
    );
  }

  // Convert data to array format for Recharts
  const chartData = Object.entries(data)
    .map(([category, info]) => ({
      name: category,
      value: info.totalQuantity,
      items: info.items
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          color: 'var(--text-primary)',
          fontSize: '13px'
        }}>
          <p style={{ fontWeight: '700', marginBottom: '4px' }}>{data.name}</p>
          <p style={{ margin: 0 }}>Quantity: {data.value}</p>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '8px',
        marginTop: '12px',
        padding: '0 8px'
      }}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '11px',
            color: 'var(--text-secondary)',
            padding: '4px 8px',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: entry.color,
              marginRight: '4px'
            }} />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="40%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
