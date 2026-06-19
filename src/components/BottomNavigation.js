'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, History, BarChart3 } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  return (
    <div style={styles.navContainer} className="glass-panel">
      <div style={styles.navBar}>
        {/* Catalog Tab */}
        <button
          onClick={() => setActiveTab('catalog')}
          style={styles.navItem}
          aria-label="View Product Catalog"
        >
          <motion.div
            animate={{ scale: activeTab === 'catalog' ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeTab === 'catalog' ? 'var(--accent)' : 'var(--text-secondary)',
              zIndex: 2,
            }}
          >
            <Package size={22} strokeWidth={activeTab === 'catalog' ? 2.5 : 2} />
            <span style={styles.navLabel}>Catalog</span>
          </motion.div>
          
          {/* Spring-animated tab indicator */}
          {activeTab === 'catalog' && (
            <motion.div
              layoutId="activeTabIndicator"
              style={styles.activePillIndicator}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>


        {/* Orders Tab */}
        <button
          onClick={() => setActiveTab('orders')}
          style={styles.navItem}
          aria-label="View Order History"
        >
          <motion.div
            animate={{ scale: activeTab === 'orders' ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text-secondary)',
              zIndex: 2,
            }}
          >
            <History size={22} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
            <span style={styles.navLabel}>History</span>
          </motion.div>

          {/* Spring-animated tab indicator */}
          {activeTab === 'orders' && (
            <motion.div
              layoutId="activeTabIndicator"
              style={styles.activePillIndicator}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveTab('analytics')}
          style={styles.navItem}
          aria-label="View Analytics"
        >
          <motion.div
            animate={{ scale: activeTab === 'analytics' ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-secondary)',
              zIndex: 2,
            }}
          >
            <BarChart3 size={22} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
            <span style={styles.navLabel}>Analytics</span>
          </motion.div>

          {/* Spring-animated tab indicator */}
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="activeTabIndicator"
              style={styles.activePillIndicator}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
    paddingTop: '10px',
    zIndex: 1000,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '52px',
    position: 'relative',
    padding: '0 8px',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
    background: 'none',
    border: 'none',
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '5px',
  },
  activePillIndicator: {
    position: 'absolute',
    bottom: -6,
    width: '32px',
    height: '4px',
    backgroundColor: 'var(--accent)',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
  },
};
