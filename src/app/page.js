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
  AlertCircle
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import QuantitySelector from '@/components/QuantitySelector';
import CartDrawer from '@/components/CartDrawer';

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
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'orders'
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]); // Array of { id, name, category, unit, quantity, image }
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Order submission statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        const yOffset = -140; // sticky header compensation
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        // Ensure we don't scroll to negative position
        const targetY = Math.max(0, y);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      } else {
        console.warn(`Category section not found: ${cat}`);
        // Try without encoding as fallback
        const fallbackEl = document.getElementById(`cat-section-${cat}`);
        if (fallbackEl) {
          const yOffset = -140;
          const y = fallbackEl.getBoundingClientRect().top + window.scrollY + yOffset;
          const targetY = Math.max(0, y);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
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
          storeName: formData.storeName,
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

        // Dynamic WhatsApp Formatting
        const whatsappText = formatWhatsAppMessage(data.order);
        const encodedText = encodeURIComponent(whatsappText);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;

        setTimeout(() => {
          setCart([]);
          setIsSubmitting(false);
          setIsSuccess(false);
          setIsCartOpen(false);

          // Launch WhatsApp redirect
          window.open(whatsappUrl, '_blank');
        }, 1400);
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
    let msg = `📦 *Inventory Order*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Date:* ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const grouped = order.items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    Object.keys(grouped).forEach((cat) => {
      msg += `*${cat.toUpperCase()}*\n`;
      grouped[cat].forEach((item) => {
        msg += `• ${item.name} (${item.unit}) x *${item.quantity}*\n`;
      });
      msg += `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*Total Items:* ${order.totalItems}\n`;
    if (order.notes) {
      msg += `*Notes:* _${order.notes}_\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return msg;
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container" style={styles.rootContainer}>
      {/* Designer Glassmorphic Header */}
      <header style={styles.header} className="glass-panel">
        <div>
          <h1 style={styles.appTitle}>Order Panel</h1>
          <p style={styles.appSubtitle}>Store Inventory Management</p>
        </div>

        {/* Light/Dark mode toggler */}
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
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: activeCategory === cat ? 'var(--accent)' : 'var(--surface)',
                      color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                      boxShadow: activeCategory === cat ? '0 4px 10px rgba(99, 102, 241, 0.25)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
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
                    <h3 style={styles.categoryTitle}>{cat}</h3>
                    <div style={styles.cardsGrid}>
                      {categoryItems.map((item) => {
                        const cartItem = cart.find((c) => c.id === item.id);
                        const quantity = cartItem ? cartItem.quantity : 0;

                        return (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            style={styles.productCard}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <img src={item.image} alt={item.name} style={styles.productThumb} />
                            <div style={styles.productInfo}>
                              <h4 style={styles.productName}>{item.name}</h4>
                              <span style={styles.productUnitBadge}>{item.unit}</span>
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
      ) : (
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
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  style={styles.orderCard}
                >
                  <div style={styles.orderCardHeader}>
                    <div>
                      <h4 style={styles.orderCardId}>{order.id}</h4>
                      <p style={styles.orderCardDate}>
                        {new Date(order.createdAt).toLocaleDateString()} •{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span style={styles.statusBadge}>
                      {order.status}
                    </span>
                  </div>

                  <div style={styles.orderStoreInfo}>
                    <MapPin size={14} style={{ marginRight: '6px', color: 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: '700' }}>{order.storeName}</span>
                  </div>

                  {/* Summary of items */}
                  <div style={styles.orderItemsSummary}>
                    <p style={styles.summaryLabel}>Ordered Items ({order.totalItems}):</p>
                    <div style={styles.orderItemsInlineList}>
                      {order.items.slice(0, 3).map((it, idx) => (
                        <span key={idx} style={styles.summaryItemToken}>
                          {it.name} ({it.quantity})
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span style={styles.summaryItemTokenMore}>
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div style={styles.orderNotesBlock}>
                      <FileText size={12} style={{ marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                      <p>
                        <span style={{ fontWeight: '700' }}>Delivery Instructions: </span>
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Order Footer card actions */}
                  <div style={styles.orderCardFooter}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const wText = formatWhatsAppMessage(order);
                        window.open(`https://wa.me/?text=${encodeURIComponent(wText)}`, '_blank');
                      }}
                      style={styles.resendWhatsAppButton}
                    >
                      <RefreshCw size={12} style={{ marginRight: '5px' }} />
                      Resend WhatsApp
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReorder(order)}
                      style={styles.reorderButton}
                    >
                      Reorder Items
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
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

      {/* Navigation tabs */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}

const styles = {
  rootContainer: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
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
    backgroundColor: 'var(--surface-secondary)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
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
    borderRadius: 'var(--radius-sm)',
    marginTop: '6px',
    marginRight: '8px',
    marginLeft: '8px',
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
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    width: '22px',
    height: '22px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--surface-secondary)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    border: '1px solid var(--border)',
    transition: 'all 0.15s ease',
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
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
  },
  skeletonThumb: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-sm)',
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
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderLeft: '4px solid var(--accent)',
    paddingLeft: '8px',
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
    padding: '12px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
  },
  productThumb: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-sm)',
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
    backgroundColor: 'var(--surface-secondary)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    width: 'fit-content',
    letterSpacing: '0.04em',
  },
  selectorWrapper: {
    flexShrink: 0,
  },
  floatingCart: {
    position: 'fixed',
    bottom: 'calc(76px + env(safe-area-inset-bottom))',
    left: '50%',
    width: 'calc(100% - 32px)',
    maxWidth: '448px',
    height: '52px',
    backgroundColor: 'var(--text-primary)',
    color: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
    zIndex: 900,
    border: 'none',
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
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderCardId: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  orderCardDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--success-light)',
    color: 'var(--success)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  orderStoreInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '700',
  },
  orderItemsSummary: {
    backgroundColor: 'var(--surface-secondary)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    border: '1px solid var(--border)',
  },
  summaryLabel: {
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  orderItemsInlineList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  summaryItemToken: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  summaryItemTokenMore: {
    color: 'var(--accent)',
    fontWeight: '700',
    padding: '2px 4px',
  },
  orderNotesBlock: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--accent-light)',
    borderLeft: '4px solid var(--accent)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-xs)',
    display: 'flex',
    alignItems: 'flex-start',
    lineHeight: '1.4',
  },
  orderCardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
  },
  resendWhatsAppButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '700',
  },
  reorderButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
  },
};
