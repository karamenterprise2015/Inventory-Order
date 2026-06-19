'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Package, DollarSign, BarChart3, Calendar, ArrowUp, ArrowDown, Crown, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// ─── Chart Colors ─────────────────────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

const calculateOrderValue = (order, items) => {
  if (!order.items || !items) return 0;
  return order.items.reduce((sum, item) => {
    const product = items.find(p => p.id === item.id);
    if (!product || product.price === null || product.price === undefined) return sum;
    return sum + (product.price * item.quantity);
  }, 0);
};

// ─── Product Value Distribution Pie Chart ─────────────────────────────────────
function ProductValuePieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyChart}>
        <Package size={24} color="var(--text-muted)" strokeWidth={1.5} />
        <span style={styles.emptyChartText}>No data available</span>
      </div>
    );
  }

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / data.payload.total) * 100).toFixed(1);
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipName}>{data.name}</p>
          <p style={styles.tooltipValue}>{formatCurrency(data.value)}</p>
          <p style={styles.tooltipPercent}>{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({ ...item, total: totalValue }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${percent.toFixed(1)}%`}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={renderCustomTooltip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Order Trend Line Chart ─────────────────────────────────────────────────
function OrderTrendChart({ data, timeRange }) {
  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyChart}>
        <TrendingUp size={24} color="var(--text-muted)" strokeWidth={1.5} />
        <span style={styles.emptyChartText}>No data available</span>
      </div>
    );
  }

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipName}>{label}</p>
          <p style={styles.tooltipValue}>{payload[0].value} orders</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="label" 
          stroke="var(--text-secondary)"
          fontSize={10}
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <YAxis 
          stroke="var(--text-secondary)"
          fontSize={10}
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <Tooltip content={renderCustomTooltip} />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="var(--accent)" 
          strokeWidth={2}
          dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ analytics, orders, analyticsLoading, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, items }) {
  const [trendTimeRange, setTrendTimeRange] = useState('day'); // 'day', 'week', 'month'

  // Get items from props or fetch
  const allItems = items || [];

  // ─── Order Value Analytics (useMemo) ───────────────────────────────────────
  const orderValueAnalytics = useMemo(() => {
    const ordersList = orders || [];
    const filteredOrders = ordersList.filter(o => o.status !== 'Cancelled');

    const orderValues = filteredOrders.map(order => ({
      id: order.id,
      value: calculateOrderValue(order, allItems),
      createdAt: order.createdAt
    }));

    const totalOrderValue = orderValues.reduce((sum, ov) => sum + ov.value, 0);
    const totalOrders = orderValues.length;
    const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
    const highestValueOrder = orderValues.length > 0 ? Math.max(...orderValues.map(ov => ov.value)) : 0;
    const lowestValueOrder = orderValues.length > 0 ? Math.min(...orderValues.map(ov => ov.value)) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orderValues.filter(ov => new Date(ov.createdAt) >= today);
    const todayOrderValue = todayOrders.reduce((sum, ov) => sum + ov.value, 0);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekOrders = orderValues.filter(ov => new Date(ov.createdAt) >= weekStart);
    const weekOrderValue = weekOrders.reduce((sum, ov) => sum + ov.value, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = orderValues.filter(ov => new Date(ov.createdAt) >= monthStart);
    const monthOrderValue = monthOrders.reduce((sum, ov) => sum + ov.value, 0);

    return {
      totalOrders,
      totalOrderValue,
      averageOrderValue,
      highestValueOrder,
      lowestValueOrder,
      todayOrderValue,
      weekOrderValue,
      monthOrderValue,
      orderValues
    };
  }, [orders, allItems]);

  // ─── Product Value Analytics (useMemo) ───────────────────────────────────────
  const productValueAnalytics = useMemo(() => {
    const ordersList = orders || [];
    const filteredOrders = ordersList.filter(o => o.status !== 'Cancelled');

    const productQuantities = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productQuantities[item.id]) {
          productQuantities[item.id] = {
            id: item.id,
            name: item.name,
            category: item.category,
            unit: item.unit,
            totalQuantity: 0
          };
        }
        productQuantities[item.id].totalQuantity += item.quantity;
      });
    });

    const productValues = Object.values(productQuantities).map(pq => {
      const product = allItems.find(i => i.id === pq.id);
      const price = product?.price || 0;
      return {
        ...pq,
        unitPrice: price,
        totalValue: price * pq.totalQuantity
      };
    }).filter(pv => pv.unitPrice > 0).sort((a, b) => b.totalValue - a.totalValue);

    return productValues;
  }, [orders, allItems]);

  // ─── Product Demand Analytics (useMemo) ───────────────────────────────────────
  const productDemandAnalytics = useMemo(() => {
    const productValues = productValueAnalytics;
    const totalUnitsOrdered = productValues.reduce((sum, pv) => sum + pv.totalQuantity, 0);
    const totalUniqueProducts = productValues.length;

    const mostOrdered = productValues.length > 0 ? productValues[0] : null;
    const leastOrdered = productValues.length > 0 ? productValues[productValues.length - 1] : null;

    const topProductsByQuantity = [...productValues]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)
      .map(p => ({
        ...p,
        shareOfTotal: totalUnitsOrdered > 0 ? ((p.totalQuantity / totalUnitsOrdered) * 100).toFixed(1) : 0
      }));

    return {
      mostOrdered,
      leastOrdered,
      totalUnitsOrdered,
      totalUniqueProducts,
      topProductsByQuantity
    };
  }, [productValueAnalytics]);

  // ─── Product Value Distribution for Pie Chart (useMemo) ─────────────────────
  const pieChartData = useMemo(() => {
    return productValueAnalytics.slice(0, 8).map(pv => ({
      name: pv.name,
      value: pv.totalValue
    }));
  }, [productValueAnalytics]);

  // ─── Order Trend Data (useMemo) ─────────────────────────────────────────────
  const trendData = useMemo(() => {
    const ordersList = orders || [];
    const filteredOrders = ordersList.filter(o => o.status !== 'Cancelled');

    if (trendTimeRange === 'day') {
      // Last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayOrders = filteredOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString();
        }).length;
        data.push({ label: dayStr, orders: dayOrders });
      }
      return data;
    } else if (trendTimeRange === 'week') {
      // Last 4 weeks
      const data = [];
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        const weekOrders = filteredOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        }).length;
        data.push({ label: `Week ${4 - i}`, orders: weekOrders });
      }
      return data;
    } else {
      // Last 6 months
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        const monthOrders = filteredOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        }).length;
        data.push({ label: monthStr, orders: monthOrders });
      }
      return data;
    }
  }, [orders, trendTimeRange]);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const card = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  return (
    <div style={styles.root}>
      {/* ── Filter Row ── */}
      <div style={styles.filterRow}>
        <div style={styles.filterGroup}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={styles.filterSelect}>
            <option value={undefined}>All Months</option>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={styles.filterSelect}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <span style={styles.filterPeriod}>
          {months[selectedMonth] || 'All'} {selectedYear}
        </span>
      </div>

      {analyticsLoading ? (
        <div style={styles.loadingGrid}>
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} style={{ ...styles.card, height: n <= 4 ? '120px' : '200px' }} className="animate-pulse">
              <div style={{ width: '40%', height: '14px', borderRadius: '6px', backgroundColor: 'var(--surface-secondary)' }} className="skeleton" />
              <div style={{ width: '60%', height: '28px', marginTop: '8px', borderRadius: '6px', backgroundColor: 'var(--surface-secondary)' }} className="skeleton" />
            </div>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}><Package size={32} color="var(--text-muted)" strokeWidth={1.5} /></div>
          <h3 style={styles.emptyTitle}>No Analytics Yet</h3>
          <p style={styles.emptyText}>Place some orders to see your dashboard come alive.</p>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>

          {/* ── Row 2: This Week's Order Value ── */}
          <motion.div {...card(0.35)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--success-light)' }}><Calendar size={16} color="var(--success)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>This Week's Value</span>
            </div>
            <div style={styles.bigValue}>{formatCurrency(orderValueAnalytics.weekOrderValue)}</div>
            <div style={styles.cardSubtext}>This week</div>
          </motion.div>

          {/* ── Row 2: This Month's Order Value ── */}
          <motion.div {...card(0.4)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--accent-light)' }}><Calendar size={16} color="var(--accent)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>This Month's Value</span>
            </div>
            <div style={styles.bigValue}>{formatCurrency(orderValueAnalytics.monthOrderValue)}</div>
            <div style={styles.cardSubtext}>This month</div>
          </motion.div>

          {/* ── Row 3: Product Value Distribution Pie Chart ── */}
          <motion.div {...card(0.45)} style={{ ...styles.card, ...styles.fullWidthCard }}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Product Value Distribution</span>
            </div>
            <ProductValuePieChart data={pieChartData} />
          </motion.div>

          {/* ── Row 4: Order Trend Chart ── */}
          <motion.div {...card(0.5)} style={{ ...styles.card, ...styles.fullWidthCard }}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Order Trend Analysis</span>
              <div style={styles.trendToggle}>
                {['day', 'week', 'month'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTrendTimeRange(range)}
                    style={{
                      ...styles.trendButton,
                      backgroundColor: trendTimeRange === range ? 'var(--accent)' : 'var(--surface-secondary)',
                      color: trendTimeRange === range ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <OrderTrendChart data={trendData} timeRange={trendTimeRange} />
          </motion.div>

          {/* ── Row 5: Most Ordered Product ── */}
          <motion.div {...card(0.55)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--accent-light)' }}><Crown size={16} color="var(--accent)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>Most Ordered</span>
            </div>
            {productDemandAnalytics.mostOrdered ? (
              <>
                <div style={styles.productName}>{productDemandAnalytics.mostOrdered.name}</div>
                <div style={styles.productValue}>{productDemandAnalytics.mostOrdered.totalQuantity} units</div>
                <div style={styles.cardSubtext}>{formatCurrency(productDemandAnalytics.mostOrdered.totalValue)}</div>
              </>
            ) : (
              <div style={styles.noData}>No data</div>
            )}
          </motion.div>

          {/* ── Row 5: Least Ordered Product ── */}
          <motion.div {...card(0.6)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--surface-secondary)' }}><Package size={16} color="var(--text-secondary)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>Least Ordered</span>
            </div>
            {productDemandAnalytics.leastOrdered ? (
              <>
                <div style={styles.productName}>{productDemandAnalytics.leastOrdered.name}</div>
                <div style={styles.productValue}>{productDemandAnalytics.leastOrdered.totalQuantity} units</div>
                <div style={styles.cardSubtext}>{formatCurrency(productDemandAnalytics.leastOrdered.totalValue)}</div>
              </>
            ) : (
              <div style={styles.noData}>No data</div>
            )}
          </motion.div>

          {/* ── Row 5: Total Units Ordered ── */}
          <motion.div {...card(0.65)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--success-light)' }}><Package size={16} color="var(--success)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>Total Units</span>
            </div>
            <div style={styles.bigValue}>{productDemandAnalytics.totalUnitsOrdered}</div>
            <div style={styles.cardSubtext}>Units ordered</div>
          </motion.div>

          {/* ── Row 5: Total Unique Products ── */}
          <motion.div {...card(0.7)} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--accent-light)' }}><ShoppingBag size={16} color="var(--accent)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>Unique Products</span>
            </div>
            <div style={styles.bigValue}>{productDemandAnalytics.totalUniqueProducts}</div>
            <div style={styles.cardSubtext}>Different SKUs</div>
          </motion.div>

          {/* ── Row 6: Highest Value Product ── */}
          <motion.div {...card(0.75)} style={{ ...styles.card, ...styles.highlightCard }}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconWrapper, backgroundColor: 'var(--accent-light)' }}><Award size={16} color="var(--accent)" strokeWidth={2.5} /></div>
              <span style={styles.cardLabel}>Highest Value Product</span>
            </div>
            {productValueAnalytics.length > 0 ? (
              <>
                <div style={styles.productName}>{productValueAnalytics[0].name}</div>
                <div style={styles.productValue}>{productValueAnalytics[0].totalQuantity} units</div>
                <div style={styles.cardSubtext}>{formatCurrency(productValueAnalytics[0].totalValue)}</div>
              </>
            ) : (
              <div style={styles.noData}>No data</div>
            )}
          </motion.div>

          {/* ── Row 7: Top 5 Products by Value ── */}
          <motion.div {...card(0.8)} style={{ ...styles.card, ...styles.fullWidthCard }}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Top 5 Products by Value</span>
            </div>
            <div style={styles.topProductsList}>
              {productValueAnalytics.slice(0, 5).map((product, idx) => (
                <div key={product.id} style={styles.topProductRow}>
                  <div style={styles.topProductRank}>#{idx + 1}</div>
                  <div style={styles.topProductInfo}>
                    <div style={styles.topProductName}>{product.name}</div>
                    <div style={styles.topProductMeta}>
                      {product.totalQuantity} units × {formatCurrency(product.unitPrice)}
                    </div>
                  </div>
                  <div style={styles.topProductValue}>{formatCurrency(product.totalValue)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Row 8: Product Analytics Table ── */}
          <motion.div {...card(0.85)} style={{ ...styles.card, ...styles.fullWidthCard }}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Product Value Analytics</span>
              <span style={styles.cardBadge}>{productValueAnalytics.length} products</span>
            </div>
            <div style={styles.tableContainer}>
              <div style={styles.tableHeader}>
                <div style={styles.tableCell}>Product</div>
                <div style={styles.tableCell}>Quantity</div>
                <div style={styles.tableCell}>Unit Price</div>
                <div style={styles.tableCell}>Total Value</div>
              </div>
              <div style={styles.tableBody}>
                {productValueAnalytics.map((product, idx) => (
                  <div key={product.id} style={styles.tableRow}>
                    <div style={styles.tableCell}>
                      <div style={styles.tableProductName}>{product.name}</div>
                    </div>
                    <div style={styles.tableCell}>{product.totalQuantity} {product.unit || ''}</div>
                    <div style={styles.tableCell}>{formatCurrency(product.unitPrice)}</div>
                    <div style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--accent)' }}>
                      {formatCurrency(product.totalValue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingBottom: '8px',
    overflowY: 'auto',
    flex: 1,
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  filterPeriod: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '-0.01em',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  card: {
    backgroundColor: 'var(--surface)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fullWidthCard: {
    gridColumn: 'span 2',
  },
  highlightCard: {
    gridColumn: 'span 2',
    borderColor: 'var(--accent)',
    borderWidth: '2px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    backgroundColor: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  cardBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-light)',
    padding: '4px 10px',
    borderRadius: '99px',
  },
  bigValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.03em',
  },
  cardSubtext: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  productName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--accent)',
  },
  noData: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  trendToggle: {
    display: 'flex',
    gap: '6px',
  },
  trendButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  topProductsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  topProductRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: '10px',
  },
  topProductRank: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--accent)',
    width: '28px',
    flexShrink: 0,
  },
  topProductInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  topProductName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  topProductMeta: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  topProductValue: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr',
    gap: '8px',
    padding: '10px 6px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.8fr',
    gap: '8px',
    padding: '10px 6px',
    backgroundColor: 'var(--surface)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  tableCell: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  tableProductName: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  tableProductCategory: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  emptyChart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '180px',
    gap: '8px',
  },
  emptyChartText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  tooltip: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: 'var(--shadow-md)',
  },
  tooltipName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  tooltipValue: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--accent)',
    margin: '4px 0 0 0',
  },
  tooltipPercent: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '16px',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    maxWidth: '280px',
  },
};

// ─── Responsive Styles ─────────────────────────────────────────────────────
const responsiveStyles = `
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .full-width-card {
      grid-column: span 2 !important;
    }
    .highlight-card {
      grid-column: span 2 !important;
    }
  }

  @media (max-width: 640px) {
    .dashboard-grid {
      grid-template-columns: 1fr !important;
    }
    .full-width-card {
      grid-column: span 1 !important;
    }
    .highlight-card {
      grid-column: span 1 !important;
    }
    .loading-grid {
      grid-template-columns: 1fr !important;
    }
    .table-header,
    .table-row {
      grid-template-columns: 1.5fr 1fr 1fr 1fr !important;
      gap: 8px !important;
    }
    .table-cell {
      font-size: 11px !important;
    }
    .table-product-name {
      font-size: 11px !important;
    }
  }
`;

// Inject responsive styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = responsiveStyles;
  document.head.appendChild(styleEl);
}
