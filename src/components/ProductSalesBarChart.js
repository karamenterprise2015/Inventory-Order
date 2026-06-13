'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function ProductSalesBarChart({ data }) {
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
        No sales data available
      </div>
    );
  }

  // Convert data to array format for Recharts
  const chartData = Object.entries(data)
    .map(([name, info], index) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      fullName: name,
      sales: info.totalQuantity,
      unit: info.unit
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10); // Show top 10 products

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="horizontal" margin={{ top: 10, right: 20, left: 80, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            type="number"
            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis 
            dataKey="name"
            type="category"
            width={75}
            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              padding: '8px'
            }}
            formatter={(value, name, props) => [
              `${value} ${props.payload.unit}`,
              props.payload.fullName
            ]}
          />
          <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
