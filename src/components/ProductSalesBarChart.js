'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

        return (
          <div key={item.name} style={styles.barRow}>
            <div style={styles.labelRow}>
              <span style={styles.itemLabel}>{item.name}</span>
              <span style={styles.valueLabel}>
                <span style={styles.numberValue}>{item.sales}</span>
                {item.unit ? <span style={styles.unitLabel}> {item.unit}</span> : null}
              </span>
            </div>
            <div style={styles.barTrack}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.7, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={styles.barFill}
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
    gap: '12px',
    width: '100%',
  },
  emptyState: {
    height: 160,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '500',
  },
  barRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
    maxWidth: '70%',
  },
  valueLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  numberValue: {
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  unitLabel: {
    fontSize: '10px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    textTransform: 'lowercase',
  },
  barTrack: {
    width: '100%',
    height: '6px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--accent)',
    minWidth: '2px',
  },
};
