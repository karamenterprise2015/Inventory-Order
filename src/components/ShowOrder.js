'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, MapPin, RefreshCw, ClipboardList, MessageCircle } from 'lucide-react';

export default function ShowOrder({ order, onClose, onResendWhatsApp, onCancel, onReorder }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1025);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!order) return null;

  const groupedItems = order.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const isCancelled = order.status === 'Cancelled';

  const drawerVariants = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      }
    : {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 100 },
      };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={styles.overlay}
      />
      <motion.div
        {...drawerVariants}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={isDesktop ? styles.modalDesktop : styles.drawerMobile}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Order Details</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            <X size={20} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Content */}
        <div style={styles.content} className="no-scrollbar">
          {/* Order ID + Status */}
          <div style={styles.metaRow}>
            <div style={styles.metaLeft}>
              <span style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: isCancelled ? 'var(--danger-light)' : 'var(--success-light)',
                color: isCancelled ? 'var(--danger)' : 'var(--success)',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: isCancelled ? 'var(--danger)' : 'var(--success)',
                  display: 'inline-block', marginRight: '6px',
                }} />
                {order.status}
              </span>
            </div>
            <span style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' · '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Person */}
          <div style={styles.infoCard}>
            <MapPin size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span style={styles.infoText}>{order.personName}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={styles.notesCard}>
              <FileText size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={styles.notesLabel}>Notes</span>
                <p style={styles.notesText}>{order.notes}</p>
              </div>
            </div>
          )}

          {/* Items by Category */}
          <div style={styles.itemsSection}>
            <h3 style={styles.sectionTitle}>
              <ClipboardList size={16} style={{ marginRight: '8px' }} />
              All Items ({order.totalItems})
            </h3>

            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} style={styles.categoryGroup}>
                <div style={styles.categoryHeader}>
                  <span className="accent-bar" />
                  <h4 style={styles.categoryName}>{category}</h4>
                </div>
                {items.map((item, idx) => (
                  <div key={`${category}-${item.name}-${idx}`} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemQty}>{item.quantity} {item.unit || ''}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ boxShadow: 'var(--shadow-md)' }}
              onClick={() => onResendWhatsApp(order)}
              style={styles.whatsappBtn}
            >
              <MessageCircle size={16} style={{ marginRight: '8px' }} />
              Send to WhatsApp
            </motion.button>

            <div style={styles.secondaryActions}>
              {!isCancelled && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onCancel(order.id)}
                  style={styles.cancelBtn}
                >
                  Cancel Order
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onReorder(order); onClose(); }}
                style={styles.reorderBtn}
              >
                Reorder
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 22, 19, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 2000,
  },
  /* Desktop: centered modal */
  modalDesktop: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '520px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2001,
    overflow: 'hidden',
  },
  /* Mobile: bottom drawer */
  drawerMobile: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'var(--surface)',
    borderTopLeftRadius: 'var(--radius-xl)',
    borderTopRightRadius: 'var(--radius-xl)',
    boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.12)',
    zIndex: 2001,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
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
  },
  content: {
    padding: '20px 24px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  metaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orderId: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    display: 'flex',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
  },
  infoText: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  notesCard: {
    display: 'flex',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: 'var(--accent-light)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(230, 126, 34, 0.2)',
  },
  notesLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  notesText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginTop: '4px',
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  categoryGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid var(--border)',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
  },
  itemQty: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--accent)',
    fontFamily: 'var(--font-heading)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border)',
  },
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 20px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '700',
    backgroundColor: '#25D366',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
  },
  secondaryActions: {
    display: 'flex',
    gap: '8px',
  },
  cancelBtn: {
    flex: 1,
    padding: '11px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    border: '1px solid rgba(231, 76, 60, 0.2)',
    cursor: 'pointer',
  },
  reorderBtn: {
    flex: 1,
    padding: '11px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    border: '1px solid rgba(230, 126, 34, 0.2)',
    cursor: 'pointer',
  },
};
