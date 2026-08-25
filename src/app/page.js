'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Moon, Sun, ShoppingCart, RefreshCw, ArrowRight,
  ClipboardList, ChevronRight, AlertCircle, X, Clock,
  Eye, EyeOff, MessageCircle, CheckCircle2, Copy, Check, Flame, ShoppingBag
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import QuantitySelector from '@/components/QuantitySelector';
import CartDrawer from '@/components/CartDrawer';
import ShowOrder from '@/components/ShowOrder';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const categoryEmojis = {
  'Bakery': '🥖',
  'Milk Products': '🧀',
  'Sauces & Dressings': '🥫',
  'Toppings': '🫒',
  'Frozen/Prepared Foods': '🍟',
  'Packaging/Boxes': '📦',
  'Spices/Seasonings': '🌶️',
  'Oils & Fats': '🧈',
};

// ─── Animation Variants ──────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showPrice, setShowPrice] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderToView, setOrderToView] = useState(null);
  const [reorderOrderId, setReorderOrderId] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const observerRef = useRef(null);

  const triggerConfetti = () => {
    const colors = ['#e67e22', '#f39c12', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
    const pieces = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.4,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 3000);
  };

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventory_theme') || 'light';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }

    fetch('/api/items')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setItems(d.items);
          if (d.items.length > 0) setActiveCategory(d.items[0].category);
        }
      })
      .catch(e => console.error('Failed to load items:', e))
      .finally(() => setLoading(false));

    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, selectedYear, selectedMonth]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth !== undefined) params.append('month', selectedMonth);
      const res = await fetch(`/api/analytics?${params}`);
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.orders); })
      .catch(e => console.error('Failed to load orders:', e));
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('inventory_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // ─── Data ──────────────────────────────────────────────
  const categories = Array.from(new Set(items.map(i => i.category)));
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ─── Scrollspy ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'catalog' || loading || categories.length === 0) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const cat = e.target.getAttribute('data-category');
          if (cat) setActiveCategory(cat);
        }
      });
    }, { root: null, rootMargin: '-12% 0px -75% 0px', threshold: 0 });

    categories.forEach(cat => {
      const el = document.getElementById(`cat-section-${encodeURIComponent(cat)}`);
      if (el) observerRef.current.observe(el);
    });

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [activeTab, loading, items, searchQuery]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    setTimeout(() => {
      const el = document.getElementById(`cat-section-${encodeURIComponent(cat)}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ─── Cart Actions ──────────────────────────────────────
  const triggerFlyAnimation = (e) => {
    if (!e) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const destEl = document.getElementById('floating-cart-btn');
    if (!destEl) return;
    const destRect = destEl.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = 'flying-particle flying-particle-animated';
    particle.style.left = `${startX - 7}px`;
    particle.style.top = `${startY - 7}px`;
    particle.style.setProperty('--mid-x', `${(destRect.left + destRect.width / 2 - startX) * 0.45}px`);
    particle.style.setProperty('--mid-y', '-120px');
    particle.style.setProperty('--dest-x', `${destRect.left + destRect.width / 2 - startX}px`);
    particle.style.setProperty('--dest-y', `${destRect.top + destRect.height / 2 - startY}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
  };

  const updateQuantity = (itemId, newQty, event) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const existing = cart.find(i => i.id === itemId);
    if (newQty > (existing ? existing.quantity : 0) && event) triggerFlyAnimation(event);
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCart(prev => {
        const idx = prev.findIndex(i => i.id === itemId);
        if (idx > -1) {
          const u = [...prev]; u[idx] = { ...u[idx], quantity: newQty }; return u;
        }
        return [...prev, { ...item, quantity: newQty }];
      });
    }
  };

  // ─── Order Actions ─────────────────────────────────────
  const handlePlaceOrder = async (formData) => {
    setIsSubmitting(true);
    try {
      const isUpdating = Boolean(reorderOrderId);
      const url = '/api/orders';
      const method = isUpdating ? 'PUT' : 'POST';
      const payload = {
        personName: formData.personName,
        notes: formData.notes,
        items: cart.map(i => ({ id: i.id, name: i.name, category: i.category, unit: i.unit, quantity: i.quantity })),
      };

      if (isUpdating) {
        payload.orderId = reorderOrderId;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        triggerConfetti();
        fetchOrders();
        setCart([]);
        setReorderOrderId(null);
        setIsSubmitting(false);
        setIsSuccess(false);
        setIsCartOpen(false);
        setConfirmedOrder(data.order);
      } else {
        alert(data.error || 'Failed to submit order');
        setIsSubmitting(false);
      }
    } catch (e) {
      alert('Error submitting order. Please check connection.');
      setIsSubmitting(false);
    }
  };

  const formatWhatsAppMessage = (order) => {
    let msg = `BURGER BHAU\n\n`;
    const grouped = order.items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    Object.keys(grouped).forEach(cat => {
      msg += `▸ *${cat}*\n`;
      grouped[cat].forEach(item => {
        msg += `   ${item.name} - ${item.quantity}${item.unit || ''}\n`;
      });
      msg += '\n';
    });
    if (order.notes) msg += `📝 *Notes:* ${order.notes}\n`;
    return msg;
  };

  const handleSendToWhatsApp = () => {
    if (!confirmedOrder) return;
    const text = formatWhatsAppMessage(confirmedOrder);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setConfirmedOrder(null);
  };

  const handleCopyOrderText = async () => {
    if (!confirmedOrder) return;
    const text = formatWhatsAppMessage(confirmedOrder);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleReorder = (order) => {
    const restored = order.items.map(o => {
      const base = items.find(i => i.id === o.id) || {};
      return { id: o.id, name: o.name, category: o.category, unit: o.unit, quantity: o.quantity, image: base.image || '' };
    });
    setCart(restored);
    setReorderOrderId(order.id);
    setActiveTab('catalog');
    setIsCartOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchOrders(); setOrderToCancel(null); }
      else alert(data.error || 'Failed to cancel order');
    } catch (e) { alert('Error cancelling order.'); }
  };

  // ─── RENDER ────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Confetti Particles Overlay */}
      {confettiPieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: `-20px`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Sidebar Nav (desktop only — rendered by BottomNavigation) */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="app-main">
        {/* ─── Mobile Header ─── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div className="mobile-only" style={styles.headerBrand}>
              <img src="/logo.png" alt="Burger Bhau Logo" style={styles.headerLogoSmall} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h1 style={styles.headerTitle}>Burger Bhau</h1>
                  <span style={styles.headerProTag}>Kothariya</span>
                </div>
              </div>
            </div>
            <h1 className="desktop-only" style={styles.headerTitleDesktop}>
              {activeTab === 'catalog' ? 'Products' : activeTab === 'orders' ? 'Order History' : 'Reports'}
            </h1>
          </div>
          <div style={styles.headerActions}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={styles.iconBtn}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPrice(!showPrice)}
              style={{
                ...styles.iconBtn,
                backgroundColor: showPrice ? 'var(--accent)' : 'var(--surface-secondary)',
                color: showPrice ? '#fff' : 'var(--text-secondary)',
              }}
              aria-label="Toggle prices"
            >
              {showPrice ? <Eye size={18} /> : <EyeOff size={18} />}
            </motion.button>
          </div>
        </header>

        {/* ─── Tab Content ─── */}
        <div style={styles.contentArea}>
          {activeTab === 'catalog' ? (
            <>
              {/* Search + Category Bar */}
              <div style={styles.toolbar}>
                <div style={styles.searchWrap}>
                  <Search style={styles.searchIcon} size={18} />
                  <input
                    type="text"
                    placeholder="Search bun, cheese, sauces..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={styles.clearBtn} aria-label="Clear">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {!searchQuery && categories.length > 0 && (
                  <div style={styles.categoryBar} className="no-scrollbar">
                    {categories.map(cat => {
                      const isActive = activeCategory === cat;
                      const emoji = categoryEmojis[cat] || '📦';
                      return (
                        <button
                          key={cat}
                          onClick={() => scrollToCategory(cat)}
                          className={`mobile-cat-pill ${isActive ? 'active' : ''}`}
                        >
                          <span>{emoji}</span>
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Products */}
              {loading ? (
                <div style={styles.loadingGrid}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} style={styles.skeletonCard}>
                      <div style={styles.skeletonThumb} className="skeleton" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ height: '16px', width: '65%', borderRadius: '6px' }} className="skeleton" />
                        <div style={{ height: '12px', width: '30%', borderRadius: '6px' }} className="skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                  <div style={styles.emptyCircle}>
                    <Search size={32} color="var(--text-muted)" />
                  </div>
                  <h3 style={styles.emptyTitle}>No products found</h3>
                  <p style={styles.emptyDesc}>Try searching with different keywords</p>
                </motion.div>
              ) : (
                <div style={styles.catalogWrap}>
                  {categories.map(cat => {
                    const catItems = filteredItems.filter(i => i.category === cat);
                    if (catItems.length === 0) return null;
                    const emoji = categoryEmojis[cat] || '📦';
                    return (
                      <div
                        key={cat}
                        id={`cat-section-${encodeURIComponent(cat)}`}
                        data-category={cat}
                        style={styles.categorySection}
                      >
                        <h3 style={styles.catHeading}>
                          <span style={{ fontSize: '18px' }}>{emoji}</span>
                          {cat}
                        </h3>
                        <div className="products-grid">
                          {catItems.map(item => {
                            const cartItem = cart.find(c => c.id === item.id);
                            const qty = cartItem ? cartItem.quantity : 0;
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                style={{
                                  ...styles.productCard,
                                  borderColor: qty > 0 ? 'var(--accent)' : 'var(--border)',
                                }}
                              >
                                <img src={item.image} alt={item.name} style={styles.productImg} loading="lazy" />
                                <div style={styles.productBody}>
                                  <h4 style={styles.productName}>{item.name}</h4>
                                  <div style={styles.productMeta}>
                                    {item.unit && <span style={styles.unitBadge}>{item.unit}</span>}
                                    {showPrice && item.price && (
                                      <span style={styles.priceBadge}>₹{item.price.toFixed(0)}</span>
                                    )}
                                  </div>
                                </div>
                                <div style={styles.selectorWrap}>
                                  <QuantitySelector
                                    quantity={qty}
                                    unit={item.unit}
                                    onChange={(q, e) => updateQuantity(item.id, q, e)}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : activeTab === 'orders' ? (
            /* ─── Orders Tab ─── */
            <>
              <div style={styles.ordersHeader}>
                <h2 style={styles.sectionTitle}>Order History</h2>
                <span style={styles.orderCount}>{orders.length} orders</span>
              </div>

              {orders.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                  <div style={styles.emptyCircle}>
                    <ClipboardList size={32} color="var(--text-muted)" />
                  </div>
                  <h3 style={styles.emptyTitle}>No orders yet</h3>
                  <p style={styles.emptyDesc}>Start ordering from the Products tab</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('catalog')}
                    style={styles.primaryBtn}
                  >
                    Browse Products
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="show" style={styles.ordersList}>
                  {orders.map(order => {
                    const initials = order.personName
                      ? order.personName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                    const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const cancelled = order.status === 'Cancelled';

                    return (
                      <motion.div
                        key={order.id}
                        variants={fadeInUp}
                        whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                        onClick={() => setOrderToView(order)}
                        style={{
                          ...styles.orderCard,
                          opacity: cancelled ? 0.7 : 1,
                          borderColor: cancelled ? 'var(--border)' : 'rgba(39, 174, 96, 0.2)',
                        }}
                      >
                        <div style={styles.orderCardTop}>
                          <div style={styles.orderMeta}>
                            <span style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</span>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: cancelled ? 'var(--danger-light)' : 'var(--success-light)',
                              color: cancelled ? 'var(--danger)' : 'var(--success)',
                            }}>
                              <span style={{
                                width: '5px', height: '5px', borderRadius: '50%',
                                backgroundColor: cancelled ? 'var(--danger)' : 'var(--success)',
                                marginRight: '5px',
                              }} />
                              {order.status}
                            </span>
                          </div>
                          <span style={styles.orderDate}>{dateStr} · {timeStr}</span>
                        </div>

                        <div style={styles.orderPerson}>
                          <div style={styles.avatar}>{initials}</div>
                          <div>
                            <span style={styles.personName}>{order.personName}</span>
                            <span style={styles.personSub}>{order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>

                        {/* Preview */}
                        <div style={styles.orderPreview}>
                          {order.items.slice(0, 3).map((it, idx) => (
                            <div key={idx} style={styles.previewRow}>
                              <span style={styles.previewName}>{it.name}</span>
                              <span style={styles.previewQty}>{it.quantity}{it.unit || ''}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <span style={styles.previewMore}>+{order.items.length - 3} more</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={styles.orderActions}>
                          <div style={styles.orderActionsLeft}>
                            {!cancelled && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={e => { e.stopPropagation(); setOrderToCancel(order); }}
                                style={styles.cancelBtn}
                              >Cancel</motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={e => { e.stopPropagation(); handleReorder(order); }}
                              style={styles.reorderBtn}
                            >Reorder</motion.button>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={e => {
                              e.stopPropagation();
                              const text = formatWhatsAppMessage(order);
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            style={styles.whatsappBtn}
                          >
                            <MessageCircle size={14} style={{ marginRight: '6px' }} />
                            WhatsApp
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </>
          ) : (
            /* ─── Analytics Tab ─── */
            <AnalyticsDashboard
              analytics={analytics}
              orders={orders}
              items={items}
              loading={analyticsLoading}
              analyticsLoading={analyticsLoading}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          )}
        </div>

        {/* ─── Floating Cart Button ─── */}
        <AnimatePresence>
          {activeTab === 'catalog' && cartCount > 0 && (
            <motion.button
              id="floating-cart-btn"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => setIsCartOpen(true)}
              style={styles.floatingCart}
              className="animate-breathe"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div style={styles.floatingCartInner}>
                <div style={styles.floatingCartIcon}>
                  <ShoppingCart size={18} color="#fff" />
                  <span style={styles.floatingCartBadge}>{cartCount}</span>
                </div>
                <span style={styles.floatingCartText}>View Order ({cartCount})</span>
              </div>
              <ArrowRight size={18} color="#fff" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ─── Cart Drawer ─── */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQuantity={(id, q, e) => updateQuantity(id, q, e)}
          onPlaceOrder={handlePlaceOrder}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          reorderOrderId={reorderOrderId}
        />

        {/* ─── Show Order Detail ─── */}
        <ShowOrder
          order={orderToView}
          onClose={() => setOrderToView(null)}
          onResendWhatsApp={(order) => {
            const text = formatWhatsAppMessage(order);
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          onCancel={handleCancelOrder}
          onReorder={handleReorder}
        />

        {/* ─── Order Confirmed Overlay ─── */}
        <AnimatePresence>
          {confirmedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmedOrder(null)}
                style={styles.confirmedOverlay}
              />
              <div style={styles.confirmedCenter}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  style={styles.confirmedCard}
                >
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirmedOrder(null)}
                    style={styles.confirmedClose}
                  >
                    <X size={18} />
                  </motion.button>

                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    style={styles.confirmedIcon}
                  >
                    <CheckCircle2 size={40} color="#fff" />
                  </motion.div>

                  <h2 style={styles.confirmedTitle}>Order Placed! 🎉</h2>
                  <p style={styles.confirmedSub}>
                    #{confirmedOrder.id?.slice(-6).toUpperCase()} · {confirmedOrder.totalItems || confirmedOrder.items?.length} items
                  </p>

                  <div style={styles.confirmedPreview}>
                    {confirmedOrder.items?.slice(0, 4).map((item, idx) => (
                      <div key={idx} style={styles.confirmedRow}>
                        <span style={styles.confirmedItemName}>{item.name}</span>
                        <span style={styles.confirmedItemQty}>{item.quantity}{item.unit || ''}</span>
                      </div>
                    ))}
                    {confirmedOrder.items?.length > 4 && (
                      <p style={styles.confirmedMore}>+{confirmedOrder.items.length - 4} more</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSendToWhatsApp}
                    style={styles.confirmedWhatsApp}
                  >
                    <MessageCircle size={20} style={{ marginRight: '10px' }} />
                    Send to WhatsApp
                  </motion.button>

                  <div style={styles.confirmedSecondary}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyOrderText} style={styles.copyBtn}>
                      {copiedToClipboard ? <><Check size={14} style={{ marginRight: '6px' }} /> Copied!</> : <><Copy size={14} style={{ marginRight: '6px' }} /> Copy Text</>}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setConfirmedOrder(null)} style={styles.doneBtn}>
                      Done
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ─── Cancel Confirmation Dialog ─── */}
        <AnimatePresence>
          {orderToCancel && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setOrderToCancel(null)}
                style={styles.dialogOverlay}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={styles.dialogBox}
              >
                <div style={styles.dialogHeader}>
                  <AlertCircle size={24} color="var(--danger)" />
                  <h3 style={styles.dialogTitle}>Cancel Order?</h3>
                </div>
                <p style={styles.dialogMsg}>
                  Are you sure you want to cancel this order? This cannot be undone.
                </p>
                <div style={styles.dialogActions}>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOrderToCancel(null)} style={styles.dialogKeep}>
                    Keep Order
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCancelOrder(orderToCancel.id)} style={styles.dialogConfirm}>
                    Yes, Cancel
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = {
  /* Header */
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 110,
    backgroundColor: 'var(--glass-bg-strong)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerLogoSmall: {
    width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
    objectFit: 'contain', backgroundColor: '#ffffff', padding: '2px',
    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.25)', border: '1px solid var(--border)',
    flexShrink: 0,
  },
  headerTitle: { fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1' },
  headerProTag: {
    fontSize: '9px', fontWeight: '800', color: '#ffffff',
    background: 'var(--accent-gradient)', padding: '2px 6px',
    borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  headerSub: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' },
  headerTitleDesktop: { fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 },
  headerActions: { display: 'flex', gap: '8px' },
  iconBtn: {
    width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
  },

  /* Mobile Hero Banner */
  mobileHeroBanner: {
    margin: '12px 16px 4px',
    padding: '16px 18px',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(230, 126, 34, 0.25)',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '10px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.02em',
  },
  heroTitle: {
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: '1.2',
    margin: '0 0 2px 0',
    fontFamily: 'var(--font-heading)',
  },
  heroSub: {
    fontSize: '12px',
    opacity: 0.85,
    margin: 0,
    fontWeight: '500',
  },
  heroIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Content */
  contentArea: { flex: 1, display: 'flex', flexDirection: 'column' },

  /* Toolbar */
  toolbar: {
    position: 'sticky', top: '65px', zIndex: 100,
    padding: '12px 16px 8px',
    backgroundColor: 'var(--glass-bg-strong)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '14px', color: 'var(--text-muted)', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '12px 16px 12px 44px',
    borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)',
    backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '15px',
  },
  clearBtn: {
    position: 'absolute', right: '12px', width: '24px', height: '24px',
    borderRadius: 'var(--radius-full)', backgroundColor: 'var(--surface-secondary)',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
  },
  categoryBar: {
    display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
    whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch',
  },
  categoryPill: {
    padding: '8px 16px', borderRadius: 'var(--radius-full)',
    fontSize: '13px', fontWeight: '700', borderWidth: '1.5px', borderStyle: 'solid',
    cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
  },

  /* Loading */
  loadingGrid: {
    padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px',
  },
  skeletonCard: {
    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px',
    backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
  },
  skeletonThumb: { width: '56px', height: '56px', borderRadius: 'var(--radius-sm)' },

  /* Empty */
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
  },
  emptyCircle: {
    width: '80px', height: '80px', borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  emptyTitle: { fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '260px', marginBottom: '20px' },
  primaryBtn: {
    background: 'var(--accent-gradient)', color: '#fff', padding: '12px 24px',
    borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '14px',
    border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(230, 126, 34, 0.25)',
  },

  /* Catalog */
  catalogWrap: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' },
  categorySection: { display: 'flex', flexDirection: 'column', gap: '12px', scrollMarginTop: '150px' },
  catHeading: {
    fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase',
    letterSpacing: '0.02em', fontFamily: 'var(--font-heading)',
  },
  productCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
    gap: '14px', cursor: 'default', transition: 'all 0.2s ease',
  },
  productImg: { width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 },
  productBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  productName: {
    fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.25',
    fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em', wordBreak: 'break-word',
  },
  productMeta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  unitBadge: {
    fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
    color: 'var(--text-secondary)', backgroundColor: 'var(--surface-secondary)',
    padding: '3px 10px', borderRadius: 'var(--radius-full)', letterSpacing: '0.03em',
    border: '1px solid var(--border)',
  },
  priceBadge: {
    fontSize: '12px', fontWeight: '800', color: 'var(--success)',
    backgroundColor: 'var(--success-light)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
  },
  selectorWrap: { flexShrink: 0 },

  /* Floating Cart */
  floatingCart: {
    position: 'fixed',
    bottom: 'calc(80px + env(safe-area-inset-bottom))',
    left: '16px',
    right: '16px',
    maxWidth: '440px',
    margin: '0 auto',
    height: '52px',
    background: 'var(--accent-gradient)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px',
    border: 'none',
    cursor: 'pointer',
    zIndex: 900,
    boxShadow: '0 8px 24px rgba(255, 122, 0, 0.35)',
  },
  floatingCartInner: { display: 'flex', alignItems: 'center', gap: '12px' },
  floatingCartIcon: { position: 'relative', display: 'flex', alignItems: 'center' },
  floatingCartBadge: {
    position: 'absolute', top: '-6px', right: '-10px',
    backgroundColor: '#fff', color: 'var(--accent)',
    fontSize: '10px', fontWeight: '800', minWidth: '18px', height: '18px',
    borderRadius: 'var(--radius-full)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '0 4px',
  },
  floatingCartText: { fontSize: '14px', fontWeight: '700' },

  /* Orders */
  ordersHeader: {
    padding: '20px 20px 14px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'baseline',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' },
  orderCount: {
    color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'var(--surface-secondary)', padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
  },
  ordersList: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  orderCard: {
    backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px',
    boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
    gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
  },
  orderCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  orderId: { fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' },
  statusBadge: {
    fontSize: '9px', fontWeight: '800', padding: '3px 8px',
    borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center',
    textTransform: 'uppercase', letterSpacing: '0.03em',
  },
  orderDate: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' },
  orderPerson: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: 'var(--radius-full)',
    background: 'var(--accent-gradient)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '800', flexShrink: 0,
  },
  personName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' },
  personSub: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', display: 'block' },
  orderPreview: {
    backgroundColor: 'var(--surface-secondary)', padding: '10px 12px',
    borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  previewRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)' },
  previewName: { fontWeight: '500' },
  previewQty: { fontWeight: '700', color: 'var(--accent)' },
  previewMore: { fontSize: '11px', color: 'var(--text-muted)', paddingTop: '4px', borderTop: '1px dashed var(--border)' },
  orderActions: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid var(--border)', paddingTop: '10px',
  },
  orderActionsLeft: { display: 'flex', gap: '6px' },
  cancelBtn: {
    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
    fontSize: '12px', fontWeight: '600', backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)', border: '1px solid rgba(231, 76, 60, 0.2)', cursor: 'pointer',
  },
  reorderBtn: {
    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
    fontSize: '12px', fontWeight: '600', backgroundColor: 'var(--surface-secondary)',
    color: 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer',
  },
  whatsappBtn: {
    display: 'flex', alignItems: 'center', padding: '7px 14px',
    borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '700',
    backgroundColor: '#25D366', color: '#fff', border: 'none', cursor: 'pointer',
  },

  /* Confirmed Overlay */
  confirmedOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 22, 19, 0.5)', backdropFilter: 'blur(12px)',
    zIndex: 3000,
  },
  confirmedCenter: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 3001, padding: '24px', pointerEvents: 'none',
  },
  confirmedCard: {
    width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-xl)', padding: '32px 24px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--border)', position: 'relative', pointerEvents: 'auto',
  },
  confirmedClose: {
    position: 'absolute', top: '12px', right: '12px',
    width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
    border: 'none', cursor: 'pointer',
  },
  confirmedIcon: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px', boxShadow: '0 8px 24px rgba(39, 174, 96, 0.3)',
  },
  confirmedTitle: { fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' },
  confirmedSub: { fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '20px' },
  confirmedPreview: {
    width: '100%', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)',
    padding: '12px 14px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px',
  },
  confirmedRow: { display: 'flex', justifyContent: 'space-between' },
  confirmedItemName: { fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' },
  confirmedItemQty: { fontSize: '13px', fontWeight: '700', color: 'var(--accent)' },
  confirmedMore: { fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '4px' },
  confirmedWhatsApp: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '14px 24px', borderRadius: 'var(--radius-md)',
    backgroundColor: '#25D366', color: '#fff', fontSize: '16px', fontWeight: '700',
    border: 'none', cursor: 'pointer', marginBottom: '12px',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.25)',
  },
  confirmedSecondary: { width: '100%', display: 'flex', gap: '8px' },
  copyBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 16px', borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)',
    fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', cursor: 'pointer',
  },
  doneBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 16px', borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--surface-secondary)', color: 'var(--text-muted)',
    fontSize: '13px', fontWeight: '600', border: '1px solid var(--border)', cursor: 'pointer',
  },

  /* Cancel Dialog */
  dialogOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 22, 19, 0.5)', backdropFilter: 'blur(4px)',
    zIndex: 3000,
  },
  dialogBox: {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-xl)', padding: '24px',
    boxShadow: 'var(--shadow-xl)', zIndex: 3001, border: '1px solid var(--border)',
  },
  dialogHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  dialogTitle: { fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 },
  dialogMsg: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' },
  dialogActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  dialogKeep: {
    padding: '10px 20px', borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)', color: 'var(--text-primary)',
    fontSize: '13px', fontWeight: '700', border: '1px solid var(--border)', cursor: 'pointer',
  },
  dialogConfirm: {
    padding: '10px 20px', borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--danger)', color: '#fff',
    fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer',
  },
};
