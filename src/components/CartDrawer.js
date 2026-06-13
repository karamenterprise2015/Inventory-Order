'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Trash2, ShoppingBag, User, FileText, AlertCircle } from 'lucide-react';
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
  
  // Load saved Person Name on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPerson = localStorage.getItem('inventory_person_name');
      if (savedPerson) setPersonName(savedPerson);
    }
  }, []);

  // Update person name and save to localStorage
  const handlePersonNameChange = (val) => {
    setPersonName(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory_person_name', val);
    }
    if (val.trim()) setErrorMsg('');
  };

  const handleConfirmOrder = () => {
    if (!personName.trim()) {
      setErrorMsg('Your Name is required to place an order.');
      const input = document.getElementById('person-name-input');
      if (input) input.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    onPlaceOrder({ personName: personName.trim(), notes: notes.trim() });
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.overlay}
          />

          {/* Slide-Up Bottom Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={styles.drawer}
          >
            {/* Grab Drag/Pull Handle */}
            <div style={styles.handleBar} onClick={onClose}>
              <div style={styles.handleLine} />
            </div>

            {/* Header Area */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.title}>Your Order</h2>
                <p style={styles.subtitle}>{totalQuantity} items selected</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                style={styles.closeButton}
                onClick={onClose}
                aria-label="Close cart"
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Scrollable list of items */}
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
                    <p style={styles.emptyText}>Your cart is empty</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      style={styles.browseButton}
                      onClick={onClose}
                    >
                      Browse Catalog
                    </motion.button>
                  </motion.div>
                ) : (
                  <div style={styles.contentWrapper}>
                    {/* Cart Items List */}
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
                            <SwipeableItemCard
                              item={item}
                              updateQuantity={updateQuantity}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Order Details Form */}
                    <div style={styles.formContainer}>
                      <div style={styles.inputGroup}>
                        <label htmlFor="person-name-input" style={styles.label}>
                          <User size={14} style={{ marginRight: '6px', color: 'var(--text-secondary)' }} />
                          Your Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                          id="person-name-input"
                          type="text"
                          placeholder="e.g. John Smith"
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
                            <AlertCircle size={12} style={{ marginRight: '4px' }} />
                            {errorMsg}
                          </motion.p>
                        )}
                      </div>

                      <div style={styles.inputGroup}>
                        <label htmlFor="order-notes-input" style={styles.label}>
                          <FileText size={14} style={{ marginRight: '6px', color: 'var(--text-secondary)' }} />
                          Delivery Notes (Optional)
                        </label>
                        <textarea
                          id="order-notes-input"
                          placeholder="e.g., Deliver before 4 PM, call on arrival..."
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

            {/* Sticky Action Footer panel */}
            {cart.length > 0 && (
              <div style={styles.actionPanel} className="glass-panel">
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

// Swipeable Card Wrapper component using Framer Motion drag gestures
function SwipeableItemCard({ item, updateQuantity }) {
  const x = useMotionValue(0);
  const deleteThreshold = -80;
  
  // Dynamic opacity of the delete label background based on drag distance
  const deleteLabelOpacity = useTransform(x, [0, deleteThreshold], [0.3, 1]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x < deleteThreshold) {
      // Swipe action triggers delete
      updateQuantity(item.id, 0);
    }
  };

  return (
    <div style={styles.cardWrapper}>
      {/* Background Red Delete Block */}
      <motion.div
        style={{
          ...styles.deleteReveal,
          opacity: deleteLabelOpacity,
        }}
      >
        <div style={styles.deleteLabel}>
          <Trash2 size={18} />
          <span>Remove</span>
        </div>
      </motion.div>

      {/* Foreground Draggable card item */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -110, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{
          ...styles.card,
          x,
        }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <div style={styles.cardInfo}>
          <img src={item.image} alt={item.name} style={styles.itemThumb} />
          <div>
            <h4 style={styles.itemName}>{item.name}</h4>
            <p style={styles.itemCategory}>{item.category}</p>
          </div>
        </div>
        
        <div style={styles.quantityContainer}>
          <QuantitySelector
            quantity={item.quantity}
            unit={item.unit}
            onChange={(q) => updateQuantity(item.id, q)}
          />
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    zIndex: 2000,
  },
  drawer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--surface)',
    borderTopLeftRadius: 'var(--radius-lg)',
    borderTopRightRadius: 'var(--radius-lg)',
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    boxShadow: 'var(--shadow-lg)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2001,
    border: '1px solid var(--border)',
    borderBottom: 'none',
  },
  handleBar: {
    width: '100%',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  handleLine: {
    width: '38px',
    height: '4px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--border)',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px 16px 24px',
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
  },
  closeButton: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 0',
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
  emptyText: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '18px',
  },
  browseButton: {
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '10px 22px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '700',
    fontSize: '13px',
    border: 'none',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--radius-md)',
    marginBottom: '12px',
    backgroundColor: 'var(--danger)',
  },
  deleteReveal: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--danger)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '22px',
    borderRadius: 'var(--radius-md)',
    zIndex: 1,
  },
  deleteLabel: {
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    zIndex: 2,
    touchAction: 'pan-y', // enables page scrolling while dragging horizontally
  },
  cardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'none', // ensures dragging is smooth on children
  },
  itemThumb: {
    width: '46px',
    height: '46px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  itemCategory: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  quantityContainer: {
    zIndex: 10,
  },
  formContainer: {
    borderTop: '1px solid var(--border)',
    paddingTop: '24px',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  textInput: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  },
  textareaInput: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    resize: 'none',
    fontFamily: 'inherit',
    boxShadow: 'var(--shadow-sm)',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--danger)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  actionPanel: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 'var(--radius-md)',
    borderTopRightRadius: 'var(--radius-md)',
  },
};
