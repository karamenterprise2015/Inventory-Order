'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, History, ShoppingCart, BarChart3 } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab, cartCount, openCart }) {
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

        {/* Cart Tab (Floating Center Button) */}
        <motion.button
          onClick={openCart}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          style={styles.cartCircleButton}
          aria-label="Open Order Cart"
        >
          <div style={styles.cartIconWrapper} id="nav-cart-btn">
            <ShoppingCart size={22} color="#ffffff" strokeWidth={2.5} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={styles.cartBadge}
                className="glow-active"
              >
                {cartCount}
              </motion.span>
            )}
          </div>
        </motion.button>

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
    borderTopLeftRadius: 'var(--radius-md)',
    borderTopRightRadius: 'var(--radius-md)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  },
  cartCircleButton: {
    width: '54px',
    height: '54px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-26px',
    border: '4px solid var(--surface)',
    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)',
    zIndex: 10,
  },
  cartIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: '-9px',
    right: '-11px',
    backgroundColor: 'var(--danger)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    minWidth: '18px',
    height: '18px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid var(--accent)',
  },
};
