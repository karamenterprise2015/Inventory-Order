'use client';

import React from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

export default function CategoryDistributionDonutChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={styles.emptyState}>
        No category data available
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([category, info]) => ({
      name: category,
      value: info.totalQuantity,
      items: info.items,
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // SVG Donut
  const radius = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div style={styles.container}>
      {/* Donut Chart */}
      <div style={styles.donutWrapper}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
          {chartData.map((item, index) => {
            const percentage = item.value / total;
            const dashLength = circumference * percentage;
            const gapLength = circumference - dashLength;
            const offset = -cumulativeOffset;
            cumulativeOffset += dashLength;

            return (
              <motion.circle
                key={item.name}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
              />
            );
          })}
          {/* Center text */}
          <text x="80" y="74" textAnchor="middle" style={{ fill: 'var(--text-primary)', fontSize: '22px', fontWeight: '800' }}>
            {total}
          </text>
          <text x="80" y="92" textAnchor="middle" style={{ fill: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600' }}>
            Total Items
          </text>
        </svg>
      </div>

      {/* Legend List */}
      <div style={styles.legendList}>
        {chartData.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              style={styles.legendItem}
            >
              <div style={styles.legendLeft}>
                <div style={{ ...styles.legendDot, backgroundColor: COLORS[index % COLORS.length] }} />
                <span style={styles.legendName}>{item.name}</span>
              </div>
              <div style={styles.legendRight}>
                <span style={styles.legendValue}>{item.value}</span>
                <span style={styles.legendPercent}>{percentage}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
  },
  emptyState: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  donutWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  legendRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendValue: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  legendPercent: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--surface)',
    padding: '2px 7px',
    borderRadius: '20px',
    minWidth: '36px',
    textAlign: 'center',
  },
};
