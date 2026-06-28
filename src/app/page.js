'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Moon,
  Sun,
  ShoppingCart,
  MapPin,
  RefreshCw,
  ArrowRight,
  ClipboardList,
  ChevronRight,
  FileText,
  AlertCircle,
  X,
  BarChart3,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  MessageCircle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import QuantitySelector from '@/components/QuantitySelector';
import CartDrawer from '@/components/CartDrawer';
import ProductSalesBarChart from '@/components/ProductSalesBarChart';
import CategoryDistributionDonutChart from '@/components/CategoryDistributionDonutChart';
import ShowOrder from '@/components/ShowOrder';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

// Animation variants for staggered catalog entrance
const catalogVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders' | 'analytics'
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]); // Array of { id, name, category, unit, quantity, image }
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showPrice, setShowPrice] = useState(false);
  
  // Order submission statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Cancel order confirmation
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Show order details
  const [orderToView, setOrderToView] = useState(null);

  // Confirmed order intermediate step (before WhatsApp)
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const catalogContainerRef = useRef(null);
  const observerRef = useRef(null);

  // Initialize theme and fetch database records
  useEffect(() => {
    // Load theme setting
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('inventory_theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Fetch initial inventory items
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setItems(data.items);
          if (data.items.length > 0) {
            setActiveCategory(data.items[0].category);
          }
        }
      })
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));

    // Fetch orders history records
    fetchOrders();
  }, []);

  // Fetch analytics when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth !== undefined) params.append('month', selectedMonth);
      
      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((err) => console.error('Failed to load orders:', err));
  };

  // Toggle Theme Mode
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('inventory_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Unique category extraction
  const categories = Array.from(new Set(items.map((item) => item.category)));

  // Filter items matching query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scrollspy to set active category during vertical scroll
  useEffect(() => {
    if (activeTab !== 'catalog' || loading || categories.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    const observerOptions = {
      root: null,
      rootMargin: '-12% 0px -75% 0px', // focused top-center window scrollspy
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryName = entry.target.getAttribute('data-category');
          if (categoryName) {
            setActiveCategory(categoryName);
          }
        }
      });
    }, observerOptions);

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-section-${encodeURIComponent(cat)}`);
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activeTab, loading, items, searchQuery]);

  // Scrollspy jumps scroll position smoothly to selected category section
  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const el = document.getElementById(`cat-section-${encodeURIComponent(cat)}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn(`Category section not found: ${cat}`);
        // Try without encoding as fallback
        const fallbackEl = document.getElementById(`cat-section-${cat}`);
        if (fallbackEl) {
          fallbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  // Custom Flying Particle Dot animation to Cart
  const triggerFlyAnimation = (e) => {
    if (!e) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const destEl = document.getElementById('nav-cart-btn');
    if (!destEl) return;

    const destRect = destEl.getBoundingClientRect();
    const destX = destRect.left + destRect.width / 2;
    const destY = destRect.top + destRect.height / 2;

    const particle = document.createElement('div');
    particle.className = 'flying-particle flying-particle-animated';
    particle.style.left = `${startX - 7}px`;
    particle.style.top = `${startY - 7}px`;

    // Coordinates calculations
    particle.style.setProperty('--mid-x', `${(destX - startX) * 0.45}px`);
    particle.style.setProperty('--mid-y', `${-120}px`);
    particle.style.setProperty('--dest-x', `${destX - startX}px`);
    particle.style.setProperty('--dest-y', `${destY - startY}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
      const badge = document.getElementById('cart-floating-badge');
      if (badge) {
        badge.classList.remove('animate-pop');
        void badge.offsetWidth; // restart pop
        badge.classList.add('animate-pop');
      }
    }, 600);
  };

  // Quantity updates
  const updateQuantity = (itemId, newQty, event) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const existing = cart.find((i) => i.id === itemId);
    const isIncrease = newQty > (existing ? existing.quantity : 0);
    
    if (isIncrease && event) {
      triggerFlyAnimation(event);
    }

    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setCart((prev) => {
        const index = prev.findIndex((i) => i.id === itemId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], quantity: newQty };
          return updated;
        } else {
          return [...prev, { ...item, quantity: newQty }];
        }
      });
    }
  };

  // Submit order + trigger WhatsApp
  const handlePlaceOrder = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: formData.personName,
          notes: formData.notes,
          items: cart.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            unit: i.unit,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        fetchOrders(); // update orders history in background

        // Show confirmed overlay immediately — no delay
        setCart([]);
        setIsSubmitting(false);
        setIsSuccess(false);
        setIsCartOpen(false);
        setConfirmedOrder(data.order);
      } else {
        alert(data.error || 'Failed to submit order');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Order request failed:', error);
      alert('Error submitting order. Please check connection and try again.');
      setIsSubmitting(false);
    }
  };

  const formatWhatsAppMessage = (order) => {
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let msg = `BURGER BHAU KOTHARIYA\n\n`;

    const grouped = order.items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    Object.keys(grouped).forEach((cat) => {
      msg += `▸ *${cat}*\n`;
      grouped[cat].forEach((item) => {
        const unitStr = item.unit ? item.unit : '';
        msg += `   ${item.name} - ${item.quantity}${unitStr}\n`;
      });
      msg += `\n`;
    });

    if (order.notes) {
      msg += `📝 *Notes:* ${order.notes}\n`;
    }

    return msg;
  };

  // Send confirmed order to WhatsApp
  const handleSendToWhatsApp = () => {
    if (!confirmedOrder) return;
    const whatsappText = formatWhatsAppMessage(confirmedOrder);
    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    setConfirmedOrder(null);
  };

  // Copy order text to clipboard
  const handleCopyOrderText = async () => {
    if (!confirmedOrder) return;
    const text = formatWhatsAppMessage(confirmedOrder);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch {
      // fallback
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

  // Dismiss the confirmed order overlay
  const handleDismissConfirmed = () => {
    setConfirmedOrder(null);
  };

  const handleReorder = (order) => {
    const restoredCart = order.items.map((ordItem) => {
      const baseItem = items.find((i) => i.id === ordItem.id) || {};
      return {
        id: ordItem.id,
        name: ordItem.name,
        category: ordItem.category,
        unit: ordItem.unit,
        quantity: ordItem.quantity,
        image: baseItem.image || 'https://images.unsplash.com/photo-1528750901443-d93a7782d132?w=400',
      };
    });

    setCart(restoredCart);
    setActiveTab('catalog');
    setIsCartOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders(); // Refresh orders list
        setOrderToCancel(null);
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Error cancelling order. Please try again.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container" style={styles.rootContainer}>
      {/* Designer Glassmorphic Header */}
      <header style={styles.header} className="glass-panel">
        <div>
          <h1 style={styles.appTitle}>Order Panel</h1>
          <p style={styles.appSubtitle}>Store Inventory Management</p>
        </div>
        <div style={{ display: 'flex',flexWrap: 'wrap', gap: '0.5rem'
        }}> {/* Light/Dark mode toggler */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={styles.themeToggle}
              aria-label="Toggle theme mode"
            >
              {theme === 'light' ? (
                <Moon size={18} strokeWidth={2.5} />
              ) : (
                <Sun size={18} strokeWidth={2.5} />
              )}
            </motion.button>

            {/* Price visibility toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPrice(!showPrice)}
              style={{
                ...styles.themeToggle,
                backgroundColor: showPrice ? 'var(--accent)' : 'var(--surface)',
                color: showPrice ? '#ffffff' : 'var(--text-secondary)',
              }}
              aria-label="Toggle price visibility"
            >
              {showPrice ? (
                <Eye size={18} strokeWidth={2.5} />
              ) : (
                <EyeOff size={18} strokeWidth={2.5} />
              )}
            </motion.button></div>
           
          </header>
      
        

      {/* Primary Panels views */}
      {activeTab === 'catalog' ? (
        <div ref={catalogContainerRef} style={styles.contentWrap}>
          {/* Sticky search input and scrollspy badges list */}
          <div style={styles.stickyToolbar} className="glass-panel">
            <div style={styles.searchWrapper}>
              <Search style={styles.searchIcon} size={16} strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={styles.clearSearch}
                  aria-label="Clear search query"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Horizontal badgelist */}
            {!searchQuery && categories.length > 0 && (
              <div style={styles.categoriesBar} className="no-scrollbar">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: activeCategory === cat ? 'var(--accent)' : 'var(--surface)',
                      color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                      boxShadow: activeCategory === cat ? '0 4px 10px rgba(99, 102, 241, 0.25)' : 'var(--shadow-3d)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Loading Skeletal State */}
          {loading ? (
            <div style={styles.loadingWrap}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={styles.skeletonCard} className="animate-pulse">
                  <div style={styles.skeletonThumb} className="skeleton" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '16px', width: '65%', borderRadius: 'var(--radius-xs)' }} className="skeleton" />
                    <div style={{ height: '12px', width: '30%', borderRadius: 'var(--radius-xs)' }} className="skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            // Custom Search empty state
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.emptyWrap}
            >
              <div style={styles.emptyCircleIcon}>
                <Search size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ marginTop: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800' }}>No Matches Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '6px', maxWidth: '240px' }}>
                We couldn't find items matching "{searchQuery}". Double-check spelling or try other keywords.
              </p>
            </motion.div>
          ) : (
            // Catalog listings
            <motion.div
              variants={catalogVariants}
              initial="hidden"
              animate="show"
              style={styles.catalogList}
            >
              {categories.map((cat) => {
                const categoryItems = filteredItems.filter((i) => i.category === cat);
                if (categoryItems.length === 0) return null;

                return (
                  <div
                    key={cat}
                    id={`cat-section-${encodeURIComponent(cat)}`}
                    data-category={cat}
                    style={styles.categorySection}
                  >
                    <h3 style={styles.categoryTitle}>
                      <span style={{ width: '4px', height: '16px', backgroundColor: 'var(--accent)', borderRadius: 'var(--radius-xs)', display: 'inline-block' }}></span>
                      {cat}
                    </h3>
                    <div style={styles.cardsGrid}>
                      {categoryItems.map((item) => {
                        const cartItem = cart.find((c) => c.id === item.id);
                        const quantity = cartItem ? cartItem.quantity : 0;

                        return (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            style={{
                              ...styles.productCard,
                              boxShadow: 'var(--shadow-3d)',
                            }}
                            whileHover={{ y: -2, boxShadow: 'var(--shadow-3d-hover)' }}
                            whileTap={{ y: 2, boxShadow: 'var(--shadow-3d-active)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            <img src={item.image} alt={item.name} style={styles.productThumb} />
                            <div style={styles.productInfo}>
                              <h4 style={styles.productName}>{item.name}</h4>
                              {item.unit && <span style={styles.productUnitBadge}>{item.unit}</span>}
                              {showPrice && item.price && (
                                <span style={styles.priceBadge}>₹{item.price.toFixed(2)}</span>
                              )}
                            </div>
                            <div style={styles.selectorWrapper}>
                              <QuantitySelector
                                quantity={quantity}
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
            </motion.div>
          )}
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders History Panel view */
        <div style={styles.contentWrap}>
          <div style={styles.historyHeader}>
            <h2 style={styles.sectionHeading}>Order History</h2>
            <span style={styles.historyCounter}>
              {orders.length} orders log
            </span>
          </div>

          {orders.length === 0 ? (
            // Custom Orders History empty state
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.emptyWrap}
            >
              <div style={styles.emptyCircleIcon}>
                <ClipboardList size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ marginTop: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800' }}>No Past Orders</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginTop: '6px', maxWidth: '240px' }}>
                You haven't submitted any inventory orders. Try ordering items from the catalog.
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('catalog')}
                style={styles.createFirstOrderButton}
              >
                Start Ordering
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              variants={catalogVariants}
              initial="hidden"
              animate="show"
              style={styles.historyList}
            >
              {orders.map((order) => {
                // Generate initials for avatar
                const initials = order.personName
                  ? order.personName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : '?';
                
                // Format date and time
                const orderDate = new Date(order.createdAt);
                const dateStr = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const isCancelled = order.status === 'Cancelled';

                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    style={{
                      ...styles.orderCard,
                      borderColor: isCancelled ? 'var(--border)' : 'rgba(16, 185, 129, 0.2)',
                      opacity: isCancelled ? 0.75 : 1,
                      boxShadow: isCancelled ? 'var(--shadow-sm)' : 'var(--shadow-3d)',
                    }}
                    onClick={() => setOrderToView(order)}
                    whileHover={isCancelled ? { y: -1, boxShadow: 'var(--shadow-md)' } : { y: -2, boxShadow: 'var(--shadow-3d-hover)' }}
                    whileTap={isCancelled ? { scale: 0.99 } : { y: 2, boxShadow: 'var(--shadow-3d-active)' }}
                  >
                    <div style={styles.orderCardHeader}>
                      <div style={styles.orderCardMeta}>
                        <span style={styles.orderCardIdText}>#{order.id.slice(-6).toUpperCase()}</span>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: isCancelled ? 'var(--danger-light)' : 'var(--success-light)',
                          color: isCancelled ? 'var(--danger)' : 'var(--success)',
                        }}>
                          <span style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: isCancelled ? 'var(--danger)' : 'var(--success)',
                            display: 'inline-block',
                            marginRight: '5px',
                          }} />
                          {order.status}
                        </span>
                      </div>
                      <span style={styles.orderCardDate}>{dateStr} • {timeStr}</span>
                    </div>

                    <div style={styles.orderStoreInfo}>
                      <div style={styles.orderAvatar}>
                        {initials}
                      </div>
                      <div style={styles.orderStoreDetails}>
                        <span style={styles.orderStoreName}>{order.personName}</span>
                        <span style={styles.orderStoreSubtitle}>Order Sheet Request</span>
                      </div>
                    </div>

                    {/* Summary of items */}
                    <div style={styles.orderItemsSummary}>
                      <div style={styles.summaryLabelRow}>
                        <span style={styles.summaryLabel}>Order Preview</span>
                        <span style={styles.summaryLabelCount}>{order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}</span>
                      </div>
                      <div style={styles.orderItemsInlineList}>
                        {order.items.slice(0, 3).map((it, idx) => (
                          <div key={idx} style={styles.summaryItemRow}>
                            <span style={styles.summaryItemName}>{it.name}</span>
                            <span style={styles.summaryItemQty}>
                              {it.quantity}{it.unit || ''}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div style={styles.summaryItemRowMore}>
                            <span>+ {order.items.length - 3} more products</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {order.notes && (
                      <div style={styles.orderNotesBlock}>
                        <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Notes: </span>
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Order Footer card actions */}
                    <div style={styles.orderCardFooter}>
                      <div style={styles.secondaryActions}>
                        {!isCancelled && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderToCancel(order);
                            }}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </motion.button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(order);
                          }}
                          style={styles.reorderButton}
                        >
                          Reorder
                        </motion.button>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const wText = formatWhatsAppMessage(order);
                          window.open(`https://wa.me/?text=${encodeURIComponent(wText)}`, '_blank');
                        }}
                        style={styles.resendWhatsAppButton}
                      >
                        Send to WhatsApp
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      ) : (
        /* Analytics Panel view */
        <div style={styles.contentWrap}>
          <AnalyticsDashboard
            analytics={analytics}
            orders={orders}
            items={items}
            loading={analyticsLoading}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        </div>
      )}

      {/* Floating Bottom Drawer Cart Trigger Button (Only Catalog view when items exist) */}
      <AnimatePresence>
        {activeTab === 'catalog' && cartCount > 0 && (
          <motion.button
            initial={{ y: 80, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 80, x: '-50%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            onClick={() => setIsCartOpen(true)}
            style={styles.floatingCart}
            whileHover={{ scale: 1.02, x: '-50%' }}
            whileTap={{ scale: 0.98, x: '-50%' }}
            aria-label="View Order Cart"
          >
            <div style={styles.floatingCartContent}>
              <div style={styles.floatingCartIconWrapper}>
                <ShoppingCart size={18} color="#ffffff" strokeWidth={2.5} />
                <span id="cart-floating-badge" style={styles.floatingCartBadge}>
                  {cartCount}
                </span>
              </div>
              <span style={styles.floatingCartText}>View Order Sheet</span>
            </div>
            <ArrowRight size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dynamic Slide Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={(id, q, e) => updateQuantity(id, q, e)}
        onPlaceOrder={handlePlaceOrder}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
      />

      {/* Show Order Details Drawer */}
      <ShowOrder
        order={orderToView}
        onClose={() => setOrderToView(null)}
        onResendWhatsApp={(order) => {
          const wText = formatWhatsAppMessage(order);
          window.open(`https://wa.me/?text=${encodeURIComponent(wText)}`, '_blank');
        }}
        onCancel={handleCancelOrder}
        onReorder={handleReorder}
      />

      {/* Order Confirmed Intermediate Overlay */}
      <AnimatePresence>
        {confirmedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissConfirmed}
              style={styles.confirmedOverlay}
            />
            {/* Centering wrapper - separate from motion so transforms don't conflict */}
            <div style={styles.confirmedWrapper}>
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={styles.confirmedCard}
            >
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDismissConfirmed}
                style={styles.confirmedCloseBtn}
                aria-label="Close confirmation"
              >
                <X size={18} strokeWidth={2.5} />
              </motion.button>

              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                style={styles.confirmedIconCircle}
              >
                <CheckCircle2 size={40} strokeWidth={2} color="#ffffff" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={styles.confirmedTitle}
              >
                Order Confirmed!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={styles.confirmedSubtitle}
              >
                #{confirmedOrder.id?.slice(-6).toUpperCase()} • {confirmedOrder.totalItems || confirmedOrder.items?.length} items
              </motion.p>

              {/* Order summary preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                style={styles.confirmedSummary}
              >
                {confirmedOrder.items?.slice(0, 4).map((item, idx) => (
                  <div key={idx} style={styles.confirmedSummaryRow}>
                    <span style={styles.confirmedSummaryName}>{item.name}</span>
                    <span style={styles.confirmedSummaryQty}>{item.quantity}{item.unit || ''}</span>
                  </div>
                ))}
                {confirmedOrder.items?.length > 4 && (
                  <div style={styles.confirmedSummaryMore}>
                    + {confirmedOrder.items.length - 4} more items
                  </div>
                )}
              </motion.div>

              {/* Primary WhatsApp button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(37, 211, 102, 0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSendToWhatsApp}
                style={styles.confirmedWhatsAppBtn}
              >
                <MessageCircle size={20} strokeWidth={2.5} style={{ marginRight: '10px' }} />
                Send to WhatsApp
              </motion.button>

              {/* Secondary actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={styles.confirmedSecondaryActions}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyOrderText}
                  style={styles.confirmedCopyBtn}
                >
                  {copiedToClipboard ? (
                    <><Check size={14} style={{ marginRight: '6px' }} /> Copied!</>
                  ) : (
                    <><Copy size={14} style={{ marginRight: '6px' }} /> Copy Order Text</>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismissConfirmed}
                  style={styles.confirmedDismissBtn}
                >
                  Done
                </motion.button>
              </motion.div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Navigation tabs */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Cancel Order Confirmation Dialog */}
      <AnimatePresence>
        {orderToCancel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToCancel(null)}
              style={styles.confirmOverlay}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={styles.confirmDialog}
            >
              <div style={styles.confirmHeader}>
                <AlertCircle size={24} style={{ color: 'var(--danger)' }} />
                <h3 style={styles.confirmTitle}>Cancel Order?</h3>
              </div>
              <p style={styles.confirmMessage}>
                Are you sure you want to cancel order {orderToCancel.id}? This action cannot be undone.
              </p>
              <div style={styles.confirmActions}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOrderToCancel(null)}
                  style={styles.confirmCancelButton}
                >
                  Keep Order
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCancelOrder(orderToCancel.id)}
                  style={styles.confirmConfirmButton}
                >
                  Yes, Cancel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  rootContainer: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(6, 182, 212, 0.05) 100%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 110,
    borderBottomLeftRadius: 'var(--radius-sm)',
    borderBottomRightRadius: 'var(--radius-sm)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  },
  appTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  appSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginTop: '1px',
  },
  themeToggle: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  },
  contentWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  stickyToolbar: {
    position: 'sticky',
    top: '72px',
    zIndex: 100,
    padding: '12px 16px 8px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderRadius: '16px',
    marginTop: '6px',
    marginRight: '8px',
    marginLeft: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '11px 16px 11px 40px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    width: '22px',
    height: '22px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  categoriesBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
    whiteSpace: 'nowrap',
    WebkitOverflowScrolling: 'touch',
  },
  categoryBadge: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '700',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.15s ease',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  loadingWrap: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  skeletonCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  skeletonThumb: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
  },
  emptyWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
  },
  emptyCircleIcon: {
    width: '72px',
    height: '72px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  createFirstOrderButton: {
    marginTop: '20px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: 'var(--radius-full)',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
  },
  catalogList: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    scrollMarginTop: '160px',
  },
  categoryTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textTransform: 'uppercase',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  productThumb: {
    width: '60px',
    height: '60px',
    borderRadius: '14px',
    objectFit: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: '0 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.3',
  },
  productUnitBadge: {
    fontSize: '9px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content',
    letterSpacing: '0.04em',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  priceBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '3px 8px',
    borderRadius: '10px',
    marginTop: '4px',
    display: 'inline-block',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  selectorWrapper: {
    flexShrink: 0,
  },
  floatingCart: {
    position: 'fixed',
    bottom: 'calc(76px + env(safe-area-inset-bottom))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '448px',
    height: '52px',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: 'var(--surface)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    zIndex: 900,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    marginBottom:'6px'
  },
  floatingCartContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  floatingCartIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  floatingCartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-10px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '800',
    minWidth: '16px',
    height: '16px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  floatingCartText: {
    fontSize: '13px',
    fontWeight: '700',
  },
  historyHeader: {
    padding: '24px 20px 14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottom: '1px solid var(--border)',
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  historyCounter: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'var(--surface-secondary)',
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
  },
  historyList: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orderCardIdText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  statusBadge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  orderCardDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  orderStoreInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  orderAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  orderStoreDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  orderStoreName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  orderStoreSubtitle: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  orderItemsSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  summaryLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontWeight: '700',
    color: 'var(--text-secondary)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryLabelCount: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  orderItemsInlineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryItemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-primary)',
  },
  summaryItemName: {
    fontWeight: '500',
  },
  summaryItemQty: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  summaryItemRowMore: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    paddingTop: '4px',
    borderTop: '1px dashed var(--border)',
  },
  orderNotesBlock: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    padding: '8px 12px',
    borderRadius: '12px',
    lineHeight: '1.4',
  },
  orderCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border)',
    paddingTop: '10px',
    marginTop: '4px',
  },
  secondaryActions: {
    display: 'flex',
    gap: '6px',
  },
  resendWhatsAppButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 140, 126, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.15s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'var(--danger)',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.15s ease',
  },
  reorderButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'var(--text-primary)',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'all 0.15s ease',
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 3000,
  },
  confirmDialog: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '24px',
    paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    zIndex: 3001,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderBottom: 'none',
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
  },
  confirmMessage: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  confirmActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  confirmCancelButton: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '700',
  },
  confirmConfirmButton: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    padding: '16px',
    borderBottom: '1px solid var(--border)',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
  },
  analyticsContainer: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  summaryCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-xs)',
    padding: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  summaryLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  analyticsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  analyticsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
  },
  analyticsBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--surface-secondary)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
  },
  chartCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  personList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  personStat: {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  personAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    flexShrink: 0,
  },
  personInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  personName: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  personStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  personStatItem: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  personStatValue: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  personStatDot: {
    fontSize: '8px',
    color: 'var(--text-muted)',
  },

  // Order Confirmed Intermediate Overlay styles
  confirmedOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 3000,
  },
  confirmedWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3001,
    padding: '24px',
    pointerEvents: 'none',
  },
  confirmedCard: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    position: 'relative',
    pointerEvents: 'auto',
  },
  confirmedCloseBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
  },
  confirmedIconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
  },
  confirmedTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
    textAlign: 'center',
  },
  confirmedSubtitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    textAlign: 'center',
  },
  confirmedSummary: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  confirmedSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedSummaryName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  confirmedSummaryQty: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  confirmedSummaryMore: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textAlign: 'center',
    paddingTop: '4px',
  },
  confirmedWhatsAppBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    borderRadius: '16px',
    backgroundColor: 'rgba(37, 211, 102, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    transition: 'all 0.2s ease',
  },
  confirmedSecondaryActions: {
    width: '100%',
    display: 'flex',
    gap: '8px',
  },
  confirmedCopyBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
  },
  confirmedDismissBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
  },
};
