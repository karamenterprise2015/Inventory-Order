'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Package, DollarSign, BarChart3,
  Calendar, ArrowUp, ArrowDown, Crown, Award, Flame, Clock,
  ChevronDown, Filter, RotateCcw
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';

// ─── Chart Colors ─────────────────────────────────────────
const CHART_COLORS = ['#e67e22', '#f39c12', '#e74c3c', '#3498db', '#27ae60', '#9b59b6', '#1abc9c', '#34495e'];

// ─── Helpers ──────────────────────────────────────────────
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
};

const calculateOrderValue = (order, items) => {
  if (!order.items || !items) return 0;
  return order.items.reduce((sum, item) => {
    const product = items.find(p => p.id === item.id);
    if (!product || !product.price) return sum;
    return sum + (product.price * item.quantity);
  }, 0);
};

// ─── KPI Card Component ──────────────────────────────────
function KPICard({ icon: Icon, label, value, subtext, trend, delay = 0, color = 'var(--accent)' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
      style={styles.kpiCard}
    >
      <div style={{ ...styles.kpiIconWrap, backgroundColor: color + '18', color }}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div style={styles.kpiContent}>
        <span style={styles.kpiLabel}>{label}</span>
        <span style={styles.kpiValue} className="animate-count">{value}</span>
        <div style={styles.kpiFooter}>
          {trend !== undefined && (
            <span style={{
              ...styles.kpiTrend,
              color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
              backgroundColor: trend >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
            }}>
              {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtext && <span style={styles.kpiSubtext}>{subtext}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chart Card Wrapper ──────────────────────────────────
function ChartCard({ title, badge, children, delay = 0, extra, fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{ ...styles.chartCard, ...(fullWidth ? { gridColumn: '1 / -1' } : {}) }}
    >
      <div style={styles.chartHeader}>
        <h3 style={styles.chartTitle}>{title}</h3>
        <div style={styles.chartHeaderRight}>
          {badge && <span style={styles.chartBadge}>{badge}</span>}
          {extra}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────
function CustomTooltip({ active, payload, label, valuePrefix = '', valueSuffix = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ ...styles.tooltipValue, color: entry.color || 'var(--accent)' }}>
          {valuePrefix}{typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}{valueSuffix}
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function AnalyticsDashboard({
  analytics, orders, items, analyticsLoading,
  selectedMonth, selectedYear, setSelectedMonth, setSelectedYear
}) {
  const [trendRange, setTrendRange] = useState('day');
  const allItems = items || [];
  const ordersList = orders || [];

  // ─── Filtered Orders Memo ──────────────────────────────
  const filteredOrders = useMemo(() => {
    return ordersList.filter(order => {
      if (order.status === 'Cancelled') return false;
      const orderDate = new Date(order.createdAt);

      if (selectedYear && selectedYear !== 'all' && selectedYear !== '' && !isNaN(selectedYear)) {
        if (orderDate.getFullYear() !== Number(selectedYear)) return false;
      }

      if (selectedMonth !== undefined && selectedMonth !== null && selectedMonth !== 'all' && selectedMonth !== '') {
        if (orderDate.getMonth() !== Number(selectedMonth)) return false;
      }

      return true;
    });
  }, [ordersList, selectedYear, selectedMonth]);

  // ─── Order Value Analytics ─────────────────────────────
  const orderAnalytics = useMemo(() => {
    const orderValues = filteredOrders.map(o => ({
      id: o.id,
      value: calculateOrderValue(o, allItems),
      createdAt: o.createdAt,
    }));

    const total = orderValues.reduce((s, o) => s + o.value, 0);
    const count = orderValues.length;
    const avg = count > 0 ? total / count : 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = orderValues.filter(o => new Date(o.createdAt) >= today);
    const weekOrders = orderValues.filter(o => new Date(o.createdAt) >= weekStart);
    const monthOrders = orderValues.filter(o => new Date(o.createdAt) >= monthStart);

    // Previous period comparisons
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(today);
    const yesterdayOrders = orderValues.filter(o => {
      const d = new Date(o.createdAt);
      return d >= yesterday && d < yesterdayEnd;
    });

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekOrders = orderValues.filter(o => {
      const d = new Date(o.createdAt);
      return d >= lastWeekStart && d < weekStart;
    });

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = monthStart;
    const lastMonthOrders = orderValues.filter(o => {
      const d = new Date(o.createdAt);
      return d >= lastMonthStart && d < lastMonthEnd;
    });

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalOrders: count,
      totalValue: total,
      avgValue: avg,
      todayCount: todayOrders.length,
      todayValue: todayOrders.reduce((s, o) => s + o.value, 0),
      weekValue: weekOrders.reduce((s, o) => s + o.value, 0),
      monthValue: monthOrders.reduce((s, o) => s + o.value, 0),
      todayTrend: calcTrend(todayOrders.length, yesterdayOrders.length),
      weekTrend: calcTrend(
        weekOrders.reduce((s, o) => s + o.value, 0),
        lastWeekOrders.reduce((s, o) => s + o.value, 0)
      ),
      monthTrend: calcTrend(
        monthOrders.reduce((s, o) => s + o.value, 0),
        lastMonthOrders.reduce((s, o) => s + o.value, 0)
      ),
    };
  }, [filteredOrders, allItems]);

  // ─── Product Analytics ─────────────────────────────────
  const productAnalytics = useMemo(() => {
    const products = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!products[item.id]) {
          products[item.id] = {
            id: item.id, name: item.name, category: item.category,
            unit: item.unit, totalQty: 0,
          };
        }
        products[item.id].totalQty += item.quantity;
      });
    });

    const list = Object.values(products).map(p => {
      const product = allItems.find(i => i.id === p.id);
      const price = product?.price || 0;
      return { ...p, price, totalValue: price * p.totalQty };
    }).sort((a, b) => b.totalValue - a.totalValue);

    const totalUnits = list.reduce((s, p) => s + p.totalQty, 0);

    return {
      products: list,
      topByValue: list.slice(0, 5),
      topByQty: [...list].sort((a, b) => b.totalQty - a.totalQty).slice(0, 5),
      totalUnits,
      uniqueProducts: list.length,
      mostOrdered: list.length > 0 ? [...list].sort((a, b) => b.totalQty - a.totalQty)[0] : null,
    };
  }, [filteredOrders, allItems]);

  // ─── Pie Chart Data ────────────────────────────────────
  const pieData = useMemo(() => {
    const categories = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!categories[item.category]) categories[item.category] = 0;
        const product = allItems.find(i => i.id === item.id);
        categories[item.category] += (product?.price || 0) * item.quantity;
      });
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders, allItems]);

  // ─── Trend Data ────────────────────────────────────────
  const trendData = useMemo(() => {
    if (trendRange === 'day') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const count = filteredOrders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).length;
        data.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), orders: count });
      }
      return data;
    } else if (trendRange === 'week') {
      const data = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const count = filteredOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d >= start && d <= end;
        }).length;
        data.push({ label: `Week ${4 - i}`, orders: count });
      }
      return data;
    } else {
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const count = filteredOrders.filter(o => {
          const od = new Date(o.createdAt);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        }).length;
        data.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), orders: count });
      }
      return data;
    }
  }, [filteredOrders, trendRange]);

  // ─── Bar Chart Data ────────────────────────────────────
  const barData = useMemo(() => {
    return productAnalytics.topByQty.map(p => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      fullName: p.name,
      quantity: p.totalQty,
      value: p.totalValue,
    }));
  }, [productAnalytics]);

  const months = [
    { value: 'all', label: 'All Months' },
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  const years = [
    { value: 'all', label: 'All Years' },
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
  ];

  const isFiltered = (selectedMonth !== undefined && selectedMonth !== 'all' && selectedMonth !== null && selectedMonth !== '') ||
                     (selectedYear !== undefined && selectedYear !== 'all' && selectedYear !== null && selectedYear !== '');

  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedYear('all');
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterLeft}>
          <BarChart3 size={22} color="var(--accent)" />
          <div>
            <h2 style={styles.pageTitle}>Business Reports</h2>
            {isFiltered && (
              <span style={styles.activeFilterBadge}>
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} for selected filter
              </span>
            )}
          </div>
        </div>

        <div style={styles.filterControls}>
          {/* Custom Month Dropdown */}
          <div style={styles.selectWrapper}>
            <Calendar size={14} style={styles.selectIcon} />
            <select
              value={selectedMonth ?? 'all'}
              onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              style={styles.customSelect}
            >
              {months.map(m => (
                <option key={m.value} value={m.value} style={styles.selectOption}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={styles.chevronIcon} />
          </div>

          {/* Custom Year Dropdown */}
          <div style={styles.selectWrapper}>
            <Filter size={14} style={styles.selectIcon} />
            <select
              value={selectedYear ?? 'all'}
              onChange={e => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              style={styles.customSelect}
            >
              {years.map(y => (
                <option key={y.value} value={y.value} style={styles.selectOption}>
                  {y.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={styles.chevronIcon} />
          </div>

          {/* Clear Filter Button */}
          {isFiltered && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={resetFilters}
              style={styles.resetFilterBtn}
              title="Reset filters"
            >
              <RotateCcw size={13} style={{ marginRight: '4px' }} />
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {analyticsLoading ? (
        <div className="kpi-row" style={{ marginBottom: '20px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ ...styles.kpiCard, height: '140px' }} className="animate-pulse">
              <div style={{ width: '40%', height: '14px', borderRadius: '6px' }} className="skeleton" />
              <div style={{ width: '70%', height: '28px', marginTop: '12px', borderRadius: '6px' }} className="skeleton" />
            </div>
          ))}
        </div>
      ) : !ordersList || ordersList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.emptyState}
        >
          <div style={styles.emptyIcon}>
            <Package size={40} color="var(--text-muted)" strokeWidth={1.5} />
          </div>
          <h3 style={styles.emptyTitle}>No Data Yet</h3>
          <p style={styles.emptyText}>Place some orders to see your reports come alive with charts and insights.</p>
        </motion.div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="kpi-row" style={{ marginBottom: '20px' }}>
            <KPICard
              icon={ShoppingBag}
              label="Today's Orders"
              value={orderAnalytics.todayCount}
              subtext="orders today"
              trend={orderAnalytics.todayTrend}
              delay={0.1}
              color="#e67e22"
            />
            <KPICard
              icon={DollarSign}
              label="This Week"
              value={formatCurrency(orderAnalytics.weekValue)}
              subtext="week total"
              trend={orderAnalytics.weekTrend}
              delay={0.2}
              color="#3498db"
            />
            <KPICard
              icon={TrendingUp}
              label="This Month"
              value={formatCurrency(orderAnalytics.monthValue)}
              subtext="month total"
              trend={orderAnalytics.monthTrend}
              delay={0.3}
              color="#27ae60"
            />
            <KPICard
              icon={Crown}
              label="Most Ordered"
              value={productAnalytics.mostOrdered?.name || 'N/A'}
              subtext={productAnalytics.mostOrdered ? `${productAnalytics.mostOrdered.totalQty} units` : ''}
              delay={0.4}
              color="#9b59b6"
            />
          </div>

          {/* Charts Grid */}
          <div className="analytics-grid">
            {/* Order Trend */}
            <ChartCard
              title="Order Trends"
              delay={0.5}
              fullWidth
              extra={
                <div style={styles.trendToggle}>
                  {['day', 'week', 'month'].map(r => (
                    <button
                      key={r}
                      onClick={() => setTrendRange(r)}
                      style={{
                        ...styles.trendBtn,
                        backgroundColor: trendRange === r ? 'var(--accent)' : 'var(--surface-secondary)',
                        color: trendRange === r ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              }
            >
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip valueSuffix=" orders" />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--accent)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'var(--accent)', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.chartEmpty}>No data available</div>
              )}
            </ChartCard>

            {/* Category Pie */}
            <ChartCard title="Spending by Category" delay={0.6}>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip valuePrefix="₹" />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.legendGrid}>
                    {pieData.slice(0, 6).map((item, i) => (
                      <div key={item.name} style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span style={styles.legendName}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={styles.chartEmpty}>No data available</div>
              )}
            </ChartCard>

            {/* Top Products Bar */}
            <ChartCard title="Top Products" badge={`${productAnalytics.uniqueProducts} items`} delay={0.7}>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-primary)' }} width={100} />
                    <Tooltip content={<CustomTooltip valueSuffix=" units" />} />
                    <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.chartEmpty}>No data available</div>
              )}
            </ChartCard>

            {/* Top Products by Value — Table */}
            <ChartCard title="Product Value Rankings" badge="By total spend" delay={0.8} fullWidth>
              <div style={styles.tableWrap}>
                <div style={styles.tableHeaderRow}>
                  <span style={{ ...styles.tableHeaderCell, flex: 0.3 }}>#</span>
                  <span style={{ ...styles.tableHeaderCell, flex: 2 }}>Product</span>
                  <span style={{ ...styles.tableHeaderCell, flex: 1 }}>Qty</span>
                  <span style={{ ...styles.tableHeaderCell, flex: 1 }}>Unit Price</span>
                  <span style={{ ...styles.tableHeaderCell, flex: 1 }}>Total</span>
                </div>
                {productAnalytics.products.filter(p => p.price > 0).slice(0, 10).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.05 }}
                    style={styles.tableRow}
                  >
                    <span style={{ ...styles.tableCell, flex: 0.3, fontWeight: '800', color: idx < 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {idx + 1}
                    </span>
                    <span style={{ ...styles.tableCell, flex: 2 }}>
                      <span style={styles.tableName}>{product.name}</span>
                      <span style={styles.tableCategory}>{product.category}</span>
                    </span>
                    <span style={{ ...styles.tableCell, flex: 1 }}>
                      {product.totalQty} {product.unit || ''}
                    </span>
                    <span style={{ ...styles.tableCell, flex: 1 }}>
                      {formatCurrency(product.price)}
                    </span>
                    <span style={{ ...styles.tableCell, flex: 1, fontWeight: '700', color: 'var(--accent)' }}>
                      {formatCurrency(product.totalValue)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </ChartCard>

            {/* Summary Stats */}
            <ChartCard title="Summary" delay={1.0}>
              <div style={styles.summaryList}>
                <SummaryRow label="Total Orders" value={formatNumber(orderAnalytics.totalOrders)} />
                <SummaryRow label="Total Value" value={formatCurrency(orderAnalytics.totalValue)} />
                <SummaryRow label="Avg Order Value" value={formatCurrency(orderAnalytics.avgValue)} />
                <SummaryRow label="Unique Products" value={formatNumber(productAnalytics.uniqueProducts)} />
                <SummaryRow label="Total Units Ordered" value={formatNumber(productAnalytics.totalUnits)} />
              </div>
            </ChartCard>

            {/* Top Products Quick List */}
            <ChartCard title="Top 5 by Volume" delay={1.1}>
              <div style={styles.quickList}>
                {productAnalytics.topByQty.map((p, idx) => (
                  <div key={p.id} style={styles.quickItem}>
                    <div style={styles.quickRank}>
                      {idx === 0 ? <Crown size={14} color="var(--accent)" /> : <span>{idx + 1}</span>}
                    </div>
                    <div style={styles.quickInfo}>
                      <span style={styles.quickName}>{p.name}</span>
                      <span style={styles.quickMeta}>{p.category}</span>
                    </div>
                    <span style={styles.quickQty}>{p.totalQty} {p.unit || ''}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Summary Row ─────────────────────────────────────────
function SummaryRow({ label, value }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={styles.summaryValue}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    flex: 1,
  },

  /* Filter Bar */
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px',
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
    lineHeight: '1.1',
  },
  activeFilterBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--accent)',
    display: 'inline-block',
    marginTop: '2px',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--accent)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  customSelect: {
    padding: '10px 32px 10px 34px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)',
    backgroundColor: 'var(--surface)',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    boxShadow: 'var(--shadow-xs)',
    transition: 'all 0.15s ease',
    outline: 'none',
    fontFamily: 'var(--font-heading)',
  },
  selectOption: {
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    padding: '8px',
  },
  chevronIcon: {
    position: 'absolute',
    right: '10px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  resetFilterBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '9px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    border: '1px solid rgba(230, 126, 34, 0.25)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  /* KPI Cards */
  kpiCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s ease',
    cursor: 'default',
  },
  kpiIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  kpiFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '2px',
  },
  kpiTrend: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  kpiSubtext: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },

  /* Chart Cards */
  chartCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chartTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    margin: 0,
  },
  chartHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chartBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-light)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(230, 126, 34, 0.15)',
  },
  chartEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-sm)',
  },

  /* Trend Toggle */
  trendToggle: {
    display: 'flex',
    gap: '4px',
  },
  trendBtn: {
    padding: '5px 12px',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid var(--border)',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* Legend */
  legendGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100px',
  },

  /* Tooltip */
  tooltip: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    boxShadow: 'var(--shadow-lg)',
  },
  tooltipLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 4px 0',
  },
  tooltipValue: {
    fontSize: '14px',
    fontWeight: '800',
    margin: 0,
  },

  /* Table */
  tableWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowX: 'auto',
  },
  tableHeaderRow: {
    display: 'flex',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-xs)',
    gap: '8px',
  },
  tableHeaderCell: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    display: 'flex',
    padding: '10px 12px',
    borderRadius: 'var(--radius-xs)',
    gap: '8px',
    borderBottom: '1px solid var(--border)',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tableName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tableCategory: {
    fontSize: '10px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },

  /* Summary */
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  summaryLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },

  /* Quick List */
  quickList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
  },
  quickRank: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  quickInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  quickName: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  quickMeta: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  quickQty: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--accent)',
    flexShrink: 0,
  },

  /* Empty State */
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
};
