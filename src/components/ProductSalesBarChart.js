'use client';

import React from 'react';
import { motion } from 'framer-motion';

const BAR_COLORS = [
  { bar: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  { bar: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  { bar: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
  { bar: '#d946ef', bg: 'rgba(217, 70, 239, 0.12)' },
  { bar: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  { bar: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  { bar: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  { bar: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
  { bar: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
  { bar: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)' },
];

export default function ProductSalesBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={styles.emptyState}>
        No product data available
      </div>
    );
  }

  const chartData = Object.entries(data)
    .map(([name, info]) => ({
      name,
      sales: info.totalQuantity,
      unit: info.unit,
    }))
    .sort((a, b) => b.sales - a.sales);

  const maxValue = Math.max(...chartData.map((d) => d.sales));

  return (
    <div style={styles.container}>
      {chartData.map((item, index) => {
        const percentage = maxValue > 0 ? (item.sales / maxValue) * 100 : 0;
        const color = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <div key={item.name} style={styles.barRow}>
            <div style={styles.labelRow}>
              <span style={styles.itemLabel}>{item.name}</span>
              <span style={{ ...styles.valueLabel, color: color.bar }}>
                {item.sales}
                {item.unit ? <span style={styles.unitLabel}>{item.unit}</span> : null}
              </span>
            </div>
            <div style={{ ...styles.barTrack, backgroundColor: color.bg }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.7, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  ...styles.barFill,
                  background: `linear-gradient(90deg, ${color.bar}, ${color.bar}dd)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
  barRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '60%',
  },
  valueLabel: {
    fontSize: '14px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  unitLabel: {
    fontSize: '10px',
    fontWeight: '600',
    opacity: 0.7,
    marginLeft: '1px',
  },
  barTrack: {
    width: '100%',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '5px',
    minWidth: '4px',
  },
};
