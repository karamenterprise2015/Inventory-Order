'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Designer-curated cohesive palette: Indigo, Violet, Slate, and Blue shades
const COLORS = [
  '#4f46e5', // Accent Indigo
  '#8b5cf6', // Violet
  '#3b82f6', // Slate Blue
  '#0f172a', // Deep Charcoal
  '#64748b', // Cool Slate
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#94a3b8', // Slate Muted
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

  // SVG Donut Config
  const radius = 64;
  const strokeWidth = 14; // Sleeker ring
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div style={styles.container}>
      {/* Donut Chart */}
      <div style={styles.donutWrapper}>
        <svg width="150" height="150" viewBox="0 0 150 150" style={{ overflow: 'visible' }}>
          {chartData.map((item, index) => {
            const percentage = item.value / total;
            const dashLength = circumference * percentage;
            const gapLength = circumference - dashLength;
            const offset = -cumulativeOffset;
            cumulativeOffset += dashLength;

            return (
              <motion.circle
                key={item.name}
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }}
              />
            );
          })}
          {/* Center Text labels */}
          <text x="75" y="70" textAnchor="middle" style={{ fill: 'var(--text-primary)', fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            {total}
          </text>
          <text x="75" y="88" textAnchor="middle" style={{ fill: 'var(--text-secondary)', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Items Total
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
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
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
    gap: '24px',
    width: '100%',
  },
  emptyState: {
    height: 160,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  donutWrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '12px 0',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px', // Tighter layout
    width: '100%',
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 4px',
    borderBottom: '1px solid var(--border)',
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
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
    gap: '12px',
  },
  legendValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  legendPercent: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--surface-secondary)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    minWidth: '36px',
    textAlign: 'center',
  },
};
