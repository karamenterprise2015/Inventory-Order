'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function QuantitySelector({ quantity, onChange, unit = 'unit' }) {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      onChange(quantity - 1, e);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    onChange(quantity + 1, e);
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          // Add Button state
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleIncrement}
            style={styles.addButton}
          >
            <span>Add</span>
            <Plus size={15} strokeWidth={3} />
          </motion.button>
        ) : (
          // Extended quantity adjuster controls
          <motion.div
            key="qty-adjust"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.selectorContainer}
          >
            {/* Minus Button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleDecrement}
              style={styles.adjustButton}
              aria-label="Decrease quantity"
            >
              <Minus size={14} strokeWidth={3} />
            </motion.button>
            
            {/* Quantity text display */}
            <div style={styles.valueWrapper}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={quantity}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  style={styles.quantityValue}
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
              <span style={styles.unitText}>{unit}</span>
            </div>

            {/* Plus Button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleIncrement}
              style={styles.adjustButton}
              aria-label="Increase quantity"
            >
              <Plus size={14} strokeWidth={3} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    height: '38px',
    padding: '0 18px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '700',
    fontSize: '13px',
    border: 'none',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-full)',
    padding: '3px',
    border: '1px solid var(--border)',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
    height: '38px',
  },
  adjustButton: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  valueWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    minWidth: '46px',
    overflow: 'hidden',
  },
  quantityValue: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  unitText: {
    fontSize: '8px',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: '1px',
    letterSpacing: '0.02em',
  },
};
