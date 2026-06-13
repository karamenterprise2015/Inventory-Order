'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, MapPin, RefreshCw, ClipboardList } from 'lucide-react';

export default function ShowOrder({ order, onClose, onResendWhatsApp, onCancel, onReorder }) {
  if (!order) return null;

  const groupedItems = order.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={styles.drawer}
      >
        <div style={styles.drawerHeader}>
          <h2 style={styles.drawerTitle}>Order Details</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close order details"
          >
            <X size={20} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div style={styles.drawerContent}>
          {/* Order ID and Status */}
          <div style={styles.orderMeta}>
            <div>
              <span style={styles.orderId}>{order.id}</span>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: order.status === 'Cancelled' ? 'var(--danger-light)' : 'var(--success-light)',
                color: order.status === 'Cancelled' ? 'var(--danger)' : 'var(--success)',
              }}>
                {order.status}
              </span>
            </div>
            <span style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()} •{' '}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Person Info */}
          <div style={styles.infoRow}>
            <User size={16} style={styles.infoIcon} />
            <span style={styles.infoText}>{order.personName}</span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div style={styles.notesBlock}>
              <FileText size={14} style={styles.notesIcon} />
              <div style={styles.notesContent}>
                <span style={styles.notesLabel}>Delivery Instructions:</span>
                <span style={styles.notesText}>{order.notes}</span>
              </div>
            </div>
          )}

          {/* All Items Grouped by Category */}
          <div style={styles.itemsSection}>
            <h3 style={styles.itemsSectionTitle}>
              <ClipboardList size={16} style={{ marginRight: '6px' }} />
              All Items ({order.totalItems})
            </h3>
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} style={styles.categoryGroup}>
                <h4 style={styles.categoryTitle}>{category}</h4>
                {items.map((item, idx) => (
                  <div key={idx} style={styles.itemRow}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemQuantity}>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onResendWhatsApp(order)}
              style={styles.actionButton}
            >
              <RefreshCw size={14} style={{ marginRight: '6px' }} />
              Resend WhatsApp
            </motion.button>

            {order.status !== 'Cancelled' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onCancel(order.id)}
                style={{ ...styles.actionButton, ...styles.cancelButton }}
              >
                <X size={14} style={{ marginRight: '6px' }} />
                Cancel Order
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onReorder(order)}
              style={{ ...styles.actionButton, ...styles.reorderButton }}
            >
              Reorder Items
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 2000,
  },
  drawer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--surface)',
    borderTopLeftRadius: 'var(--radius-lg)',
    borderTopRightRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 2001,
    border: '1px solid var(--border)',
    borderBottom: 'none',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  drawerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
  },
  drawerContent: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
  },
  orderMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  orderId: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginRight: '8px',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  orderDate: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '12px',
  },
  infoIcon: {
    marginRight: '8px',
    color: 'var(--text-secondary)',
  },
  infoText: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  notesBlock: {
    display: 'flex',
    padding: '12px',
    backgroundColor: 'var(--accent-light)',
    borderLeft: '4px solid var(--accent)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
  },
  notesIcon: {
    marginRight: '10px',
    marginTop: '2px',
    flexShrink: 0,
    color: 'var(--accent)',
  },
  notesContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  notesLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  notesText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  itemsSection: {
    marginBottom: '20px',
  },
  itemsSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  },
  categoryGroup: {
    marginBottom: '16px',
  },
  categoryTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: '8px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-xs)',
    marginBottom: '6px',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  itemQuantity: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '700',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
  },
  cancelButton: {
    borderColor: 'var(--danger)',
    color: 'var(--danger)',
  },
  reorderButton: {
    backgroundColor: 'var(--accent-light)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
};
