'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function QuantitySelector({ quantity, onChange, unit = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());

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

  const handleQuantityClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setInputValue(quantity.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue) || 0;
    const finalValue = Math.max(0, numValue);
    onChange(finalValue);
    setIsEditing(false);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {quantity === 0 ? (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(230, 126, 34, 0.3)' }}
            onClick={handleIncrement}
            style={styles.addButton}
            className="ripple-effect"
          >
            <span style={styles.addText}>Add</span>
            <Plus size={16} strokeWidth={3} />
          </motion.button>
        ) : (
          <motion.div
            key="qty-adjust"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={styles.selectorWrap}
          >
            {/* Minus */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ backgroundColor: 'rgba(231, 76, 60, 0.1)' }}
              onClick={handleDecrement}
              style={styles.adjustBtn}
              aria-label="Decrease quantity"
            >
              <Minus size={16} strokeWidth={3} color={quantity === 1 ? 'var(--danger)' : 'var(--text-primary)'} />
            </motion.button>

            {/* Quantity Display */}
            <div style={styles.valueArea}>
              <AnimatePresence mode="popLayout">
                {isEditing ? (
                  <motion.input
                    key="input"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyPress={handleInputKeyPress}
                    style={styles.quantityInput}
                    autoFocus
                  />
                ) : (
                  <motion.span
                    key={quantity}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    style={styles.quantityValue}
                    onClick={handleQuantityClick}
                    title="Tap to type quantity"
                  >
                    {quantity}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isEditing && unit && (
                <span style={styles.unitLabel}>{unit}</span>
              )}
            </div>

            {/* Plus */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ backgroundColor: 'rgba(230, 126, 34, 0.1)' }}
              onClick={handleIncrement}
              style={styles.adjustBtn}
              aria-label="Increase quantity"
            >
              <Plus size={16} strokeWidth={3} color="var(--accent)" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    background: 'var(--accent-gradient)',
    color: '#ffffff',
    height: '44px',
    padding: '0 22px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '800',
    fontSize: '15px',
    fontFamily: 'var(--font-heading)',
    border: 'none',
    boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  addText: {
    letterSpacing: '-0.01em',
  },
  selectorWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-full)',
    padding: '3px',
    border: '2px solid var(--accent)',
    height: '44px',
    boxShadow: '0 2px 10px rgba(230, 126, 34, 0.15)',
  },
  adjustBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  },
  valueArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    minWidth: '52px',
    overflow: 'hidden',
  },
  quantityValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
  },
  quantityInput: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
    width: '52px',
    textAlign: 'center',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    padding: 0,
    margin: 0,
    fontFamily: 'var(--font-heading)',
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
  },
  unitLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: '1px',
    letterSpacing: '0.03em',
  },
};
