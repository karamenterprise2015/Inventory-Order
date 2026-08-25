'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, History, BarChart3, Flame } from 'lucide-react';

const navItems = [
  { key: 'catalog', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: History },
  { key: 'analytics', label: 'Reports', icon: BarChart3 },
];

export default function BottomNavigation({ activeTab, setActiveTab }) {
  return (
    <>
      {/* ─── Desktop Sidebar Navigation ─── */}
      <nav className="app-sidebar desktop-only" style={styles.sidebar}>
        {/* Brand Logo */}
        <div style={styles.sidebarBrand}>
          <img src="/logo.png" alt="Burger Bhau Logo" style={styles.brandLogoImg} />
          <div>
            <h1 style={styles.brandName}>Burger Bhau</h1>
            <p style={styles.brandSub}>Franchise Panel</p>
          </div>
        </div>

        {/* Nav Items */}
        <div style={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...styles.sidebarItem,
                  backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                <div style={{
                  ...styles.sidebarIconWrap,
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    style={styles.sidebarActiveBar}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <p style={styles.sidebarFooterText}>v2.0 · Franchise Edition</p>
        </div>
      </nav>

      {/* ─── Mobile Floating Glass Island Navigation Dock ─── */}
      <div className="mobile-only mobile-floating-dock">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="mobile-dock-item"
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveDockGlow"
                  className="mobile-dock-active-glow"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: isActive ? '800' : '600',
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </>
  );
}

const styles = {
  /* ─── Desktop Sidebar ─── */
  sidebar: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 8px 24px 8px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '16px',
  },
  brandLogoImg: {
    width: '42px',
    height: '42px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: '3px',
    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  brandName: {
    fontSize: '17px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    position: 'relative',
    border: 'none',
  },
  sidebarIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  sidebarActiveBar: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '24px',
    background: 'var(--accent)',
    borderRadius: 'var(--radius-full)',
  },
  sidebarFooter: {
    padding: '16px 8px 0 8px',
    borderTop: '1px solid var(--border)',
  },
  sidebarFooterText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },

  /* ─── Mobile Bottom Nav ─── */
  mobileNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'var(--glass-bg-strong)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderTop: '1px solid var(--glass-border)',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  mobileNavBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '68px',
    padding: '0 8px',
    position: 'relative',
    maxWidth: '500px',
    margin: '0 auto',
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
    background: 'none',
    border: 'none',
    padding: '0',
    WebkitTapHighlightColor: 'transparent',
  },
  mobileActivePill: {
    position: 'absolute',
    bottom: '6px',
    width: '28px',
    height: '3px',
    background: 'var(--accent)',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 2px 8px rgba(230, 126, 34, 0.4)',
  },
};
