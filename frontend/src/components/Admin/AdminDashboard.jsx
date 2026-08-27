import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, KpiCard, PageShell,
} from './ui';
import { listUsers, listFraudQueue, revenueReport, collectionVolumeReport } from '../../services/adminApi';
import { formatTaka } from './adminUtils';

const CATEGORY_COLORS = {
  Plastic: '#3b82f6',
  Paper: '#8b5cf6',
  Glass: '#06b6d4',
  Metal: '#f59e0b',
  'E-waste': '#ef4444',
  Organic: '#10b981',
  Textile: '#ec4899',
  Mixed: '#64748b',
};

/**
 * Small horizontal bar list used for the dashboard charts (pure CSS, no chart
 * dependency — keeps the frontend dependency footprint unchanged).
 * @param {object} props Component props.
 * @param {Array<{label: string, value: number, color?: string, display?: string}>} props.items Bar items.
 * @param {string} [props.unit] Unit suffix for the displayed value.
 * @returns {JSX.Element} The bar list.
 */
function BarList({ items, unit }) {
  const max = Math.max(1, ...items.map((i) => Number(i.value) || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((i) => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 110, fontSize: 12.5, color: '#475569', flexShrink: 0 }}>{i.label}</div>
          <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((Number(i.value) || 0) / max) * 100}%`, background: i.color || '#065f46', borderRadius: 9999 }} />
          </div>
          <div style={{ width: 90, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#0f172a', fontFamily: "'DM Mono', monospace" }}>
            {(i.display !== undefined ? i.display : (Number(i.value) || 0).toLocaleString())}{unit || ''}
          </div>
        </div>
      ))}
    </div>
  );
}
BarList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string,
    display: PropTypes.string,
  })).isRequired,
  unit: PropTypes.string,
};
BarList.defaultProps = { unit: undefined };

/**
 * Admin dashboard — platform KPIs, attention-required, and data-backed charts.
 * @returns {JSX.Element} The admin dashboard.
 */
function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [fraud, setFraud] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [u, f, r, c] = await Promise.allSettled([
          listUsers(),
          listFraudQueue(),
          revenueReport(),
          collectionVolumeReport(),
        ]);
        if (!active) { return; }
        setUsers(u.status === 'fulfilled' ? u.value : []);
        setFraud(f.status === 'fulfilled' ? f.value : []);
        setRevenue(r.status === 'fulfilled' ? r.value : null);
        setCollection(c.status === 'fulfilled' ? c.value : null);
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load dashboard'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const totalUsers = users.length;
  const activeCollectors = users.filter((u) => (u.role === 'local_collector' || u.role === 'global_collector') && u.status === 'active').length;
  const activeCompanies = users.filter((u) => u.role === 'company' && u.status === 'active').length;
  const pendingKyc = users.filter((u) => u.kyc_status === 'pending' || u.kyc_status === 'under_review').length;
  const fraudOpen = fraud.filter((f) => f.status === 'pending').length;
  const weightVariance = fraud.filter((f) => f.rule === 'weight_variance' && f.status === 'pending').length;
  const escalated = fraud.filter((f) => f.status === 'escalated').length;

  const revenueTotal = (revenue && revenue.available)
    ? (Number(revenue.commission) || 0) + (Number(revenue.subscription) || 0)
    : null;

  const kpis = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), accent: '#0f172a' },
    { label: 'Active Collectors', value: activeCollectors.toLocaleString(), accent: '#0f172a' },
    { label: 'Active Companies', value: activeCompanies.toLocaleString(), accent: '#0f172a' },
    { label: 'Pending KYC', value: pendingKyc.toLocaleString(), accent: '#f59e0b' },
    { label: 'Open Fraud Flags', value: fraudOpen.toLocaleString(), accent: '#ef4444' },
    { label: 'Platform Revenue', value: revenueTotal !== null ? formatTaka(revenueTotal) : '—' },
  ];

  const attention = [
    { type: 'Pending KYC', count: pendingKyc, color: '#f59e0b', icon: '🪪' },
    { type: 'Open Fraud Flags', count: fraudOpen, color: '#ef4444', icon: '🚨' },
    { type: 'Weight Variance', count: weightVariance, color: '#f97316', icon: '⚖️' },
    { type: 'Escalated', count: escalated, color: '#9d174d', icon: '🔥' },
  ];

  const collectionItems = (collection && collection.available && collection.byCategory)
    ? collection.byCategory.map((c) => ({
      label: c.waste_category,
      value: Number(c.total_weight) || 0,
      color: CATEGORY_COLORS[c.waste_category] || '#64748b',
      display: `${(Number(c.total_weight) || 0).toLocaleString()} kg`,
    }))
    : [];

  const revenueItems = (revenue && revenue.available)
    ? [
      { label: 'Commission', value: Number(revenue.commission) || 0, color: '#065f46', display: formatTaka(revenue.commission) },
      { label: 'Subscription', value: Number(revenue.subscription) || 0, color: '#0d9488', display: formatTaka(revenue.subscription) },
    ]
    : [];

  return (
    <PageShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#64748b' }}>Platform overview — SWEEP Admin Portal</p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          <span className="sweep-spinner" /> Loading platform data…
        </div>
      )}
      {error && !loading && (
        <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>
          Could not load some data: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map((k) => <KpiCard key={k.label} label={k.label} value={k.value} accent={k.accent} />)}
      </div>

      <Card style={{ padding: '20px 24px', marginBottom: 24, border: '1px solid #fde68a', background: '#fffbeb' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>⚠️ Attention Required</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {attention.map((item) => (
            <div key={item.type} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: `1px solid ${item.color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{item.type}</span>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 800, color: item.color }}>{item.count}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Collection by Category (kg)</h3>
          {collectionItems.length > 0
            ? <BarList items={collectionItems} />
            : <Placeholder text="Collection data is not available yet (listings table not created)." />}
        </Card>

        <Card style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Platform Revenue (৳)</h3>
          {revenueItems.length > 0
            ? <BarList items={revenueItems} />
            : <Placeholder text="Revenue data is not available yet (transactions/subscriptions tables not created)." />}
        </Card>
      </div>
    </PageShell>
  );
}

function Placeholder({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>📊</div>
      <div>{text}</div>
    </div>
  );
}
Placeholder.propTypes = { text: PropTypes.string.isRequired };

export default AdminDashboard;
