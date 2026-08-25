'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, User, FileText, AlertCircle } from 'lucide-react';
import SwipeConfirm from './SwipeConfirm';
import QuantitySelector from './QuantitySelector';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  onPlaceOrder,
  isSubmitting,
  isSuccess
}) {
  const [personName, setPersonName] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1025);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPerson = localStorage.getItem('inventory_person_name');
      if (savedPerson) setPersonName(savedPerson);
    }
  }, []);

  const handlePersonNameChange = (val) => {
    setPersonName(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory_person_name', val);
    }
    if (val.trim()) setErrorMsg('');
  };

  const handleConfirmOrder = () => {
    if (!personName.trim()) {
      setErrorMsg('Please enter your name to place the order.');
      const input = document.getElementById('person-name-input');
      if (input) input.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onPlaceOrder({ personName: personName.trim(), notes: notes.trim() });
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Desktop: slide from right. Mobile: slide from bottom
  const drawerVariants = isDesktop
    ? {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
      }
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.overlay}
          />

          {/* Drawer */}
          <motion.div
            {...drawerVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={isDesktop ? styles.drawerDesktop : styles.drawerMobile}
          >
            {/* Handle bar — mobile only */}
            {!isDesktop && (
              <div style={styles.handleBar} onClick={onClose}>
                <div style={styles.handleLine} />
              </div>
            )}

            {/* Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.title}>Your Order</h2>
                <p style={styles.subtitle}>{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} selected</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ backgroundColor: 'var(--surface-secondary)' }}
                style={styles.closeButton}
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Content */}
            <div style={styles.scrollContent} className="no-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles.emptyState}
                  >
                    <div style={styles.emptyIcon}>
                      <ShoppingBag size={48} color="var(--text-muted)" strokeWidth={1.5} />
                    </div>
                    <p style={styles.emptyTitle}>No items yet</p>
                    <p style={styles.emptyDesc}>Add products from the catalog to build your order</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      style={styles.browseButton}
                      onClick={onClose}
                    >
                      Browse Products
                    </motion.button>
                  </motion.div>
                ) : (
                  <div style={styles.contentWrapper}>
                    {/* Items List */}
                    <div style={styles.listContainer}>
                      <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <CartItemCard item={item} updateQuantity={updateQuantity} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Form */}
                    <div style={styles.formSection}>
                      <div style={styles.inputGroup}>
                        <label htmlFor="person-name-input" style={styles.label}>
                          <User size={15} style={{ marginRight: '6px', color: 'var(--accent)' }} />
                          Your Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                          id="person-name-input"
                          type="text"
                          placeholder="Enter your name"
                          value={personName}
                          onChange={(e) => handlePersonNameChange(e.target.value)}
                          style={{
                            ...styles.textInput,
                            borderColor: errorMsg ? 'var(--danger)' : 'var(--border)',
                          }}
                        />
                        {errorMsg && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={styles.errorText}
                          >
                            <AlertCircle size={13} style={{ marginRight: '4px' }} />
                            {errorMsg}
                          </motion.p>
                        )}
                      </div>

                      <div style={styles.inputGroup}>
                        <label htmlFor="order-notes-input" style={styles.label}>
                          <FileText size={15} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />
                          Notes (Optional)
                        </label>
                        <textarea
                          id="order-notes-input"
                          placeholder="Any special instructions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="2"
                          style={styles.textareaInput}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Footer */}
            {cart.length > 0 && (
              <div style={styles.actionPanel}>
                <SwipeConfirm
                  onConfirm={handleConfirmOrder}
                  isSubmitting={isSubmitting}
                  isSuccess={isSuccess}
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemCard({ item, updateQuantity }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardInfo}>
        <img src={item.image} alt={item.name} style={styles.itemThumb} loading="lazy" />
        <div style={styles.cardText}>
          <h4 style={styles.itemName}>{item.name}</h4>
          <p style={styles.itemCategory}>{item.category}</p>
        </div>
      </div>
      <div style={styles.quantityArea}>
        <QuantitySelector
          quantity={item.quantity}
          unit={item.unit}
          onChange={(q) => updateQuantity(item.id, q)}
        />
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 22, 19, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 2000,
  },

  /* Desktop: right side panel */
  drawerDesktop: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '440px',
    maxWidth: '100vw',
    height: '100vh',
    backgroundColor: 'var(--surface)',
    borderLeft: '1px solid var(--border)',
    boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2001,
  },

  /* Mobile: bottom sheet */
  drawerMobile: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'var(--surface)',
    borderTopLeftRadius: 'var(--radius-xl)',
    borderTopRightRadius: 'var(--radius-xl)',
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2001,
  },

  handleBar: {
    width: '100%',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  handleLine: {
    width: '40px',
    height: '4px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--border)',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginTop: '2px',
  },
  closeButton: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },

  /* Empty state */
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 0',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  emptyTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  emptyDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    maxWidth: '240px',
  },
  browseButton: {
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '10px 24px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '700',
    fontSize: '14px',
    border: '1px solid rgba(230, 126, 34, 0.2)',
    cursor: 'pointer',
  },

  /* Item cards */
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    gap: '14px',
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  itemThumb: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-md)',
    objectFit: 'cover',
    flexShrink: 0,
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
    lineHeight: '1.25',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemCategory: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginTop: '2px',
  },
  quantityArea: {
    flexShrink: 0,
  },

  /* Form */
  formSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '20px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-heading)',
  },
  textInput: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    backgroundColor: 'var(--surface)',
    fontSize: '15px',
    color: 'var(--text-primary)',
    transition: 'border-color 0.15s ease',
  },
  textareaInput: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    backgroundColor: 'var(--surface)',
    fontSize: '15px',
    color: 'var(--text-primary)',
    resize: 'none',
    fontFamily: 'inherit',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--danger)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },

  /* Action panel */
  actionPanel: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
  },
};
