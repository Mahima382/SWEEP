import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, SectionHeader, KpiCard, TabBar, PageShell,
} from './ui';
import { collectionVolumeReport, revenueReport, environmentalImpactReport } from '../../services/adminApi';
import { formatTaka } from './adminUtils';

const CATEGORY_COLORS = {
  Plastic: '#3b82f6', Paper: '#8b5cf6', Glass: '#06b6d4', Metal: '#f59e0b', 'E-waste': '#ef4444', Organic: '#10b981', Textile: '#ec4899', Mixed: '#64748b',
};

/**
 * Horizontal bar list for report charts (pure CSS, no chart dependency).
 * @param {object} props Component props.
 * @param {Array<{label: string, value: number, color?: string, display?: string}>} props.items Items.
 * @param {string} [props.unit] Unit suffix.
 * @returns {JSX.Element} The bar list.
 */
function BarList({ items, unit }) {
  const max = Math.max(1, ...items.map((i) => Number(i.value) || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((i) => (
        <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 120, fontSize: 12.5, color: '#475569', flexShrink: 0 }}>{i.label}</div>
          <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((Number(i.value) || 0) / max) * 100}%`, background: i.color || '#065f46', borderRadius: 9999 }} />
          </div>
          <div style={{ width: 110, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#0f172a', fontFamily: "'DM Mono', monospace" }}>
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
 * Operational Reports screen (FR-11 §5). Collection volume, revenue, and
 * environmental impact. Degrades gracefully when the underlying tables are not
 * yet created in the shared schema.
 * @returns {JSX.Element} The reports screen.
 */
function Reports() {
  const [tab, setTab] = useState('Collection Volume');
  const [collection, setCollection] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [env, setEnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const [c, r, e] = await Promise.allSettled([collectionVolumeReport(), revenueReport(), environmentalImpactReport()]);
        if (!active) { return; }
        setCollection(c.status === 'fulfilled' ? c.value : null);
        setRevenue(r.status === 'fulfilled' ? r.value : null);
        setEnv(e.status === 'fulfilled' ? e.value : null);
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load reports'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const categoryItems = (collection && collection.available && collection.byCategory)
    ? collection.byCategory.map((c) => ({
      label: c.waste_category,
      value: Number(c.total_weight) || 0,
      color: CATEGORY_COLORS[c.waste_category] || '#64748b',
      display: `${(Number(c.total_weight) || 0).toLocaleString()} kg`,
    }))
    : [];

  const regionItems = (collection && collection.available && collection.byRegion)
    ? collection.byRegion.map((r) => ({
      label: r.region,
      value: Number(r.total_weight) || 0,
      display: `${(Number(r.total_weight) || 0).toLocaleString()} kg`,
    }))
    : [];

  const envItems = (env && env.available && env.byCategory)
    ? env.byCategory.map((c) => ({
      label: c.wasteCategory,
      value: Number(c.estimatedCO2) || 0,
      color: CATEGORY_COLORS[c.wasteCategory] || '#64748b',
      display: `${(Number(c.estimatedCO2) || 0).toFixed(1)} kg`,
    }))
    : [];

  return (
    <PageShell>
      <SectionHeader title="Operational Reports" subtitle="Platform collection, revenue, and environmental impact" />
      <TabBar tabs={['Collection Volume', 'Revenue', 'Environmental Impact']} active={tab} onChange={setTab} />

      {loading && <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading reports…</div>}
      {error && !loading && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}

      {!loading && tab === 'Collection Volume' && (
        (collection && collection.available)
          ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>By Category (kg)</h3>
                <BarList items={categoryItems} />
              </Card>
              <Card style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>By Region (kg)</h3>
                <BarList items={regionItems} />
              </Card>
            </div>
          )
          : <Unavailable note={collection ? collection.note : 'Collection data unavailable.'} />
      )}

      {!loading && tab === 'Revenue' && (
        (revenue && revenue.available)
          ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <KpiCard label="Commission Revenue" value={formatTaka(revenue.commission)} accent="#065f46" />
              <KpiCard label="Subscription Revenue" value={formatTaka(revenue.subscription)} accent="#0d9488" />
            </div>
          )
          : <Unavailable note={revenue ? revenue.note : 'Revenue data unavailable.'} />
      )}

      {!loading && tab === 'Environmental Impact' && (
        (env && env.available)
          ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card style={{ padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Estimated CO₂ Saved (kg)</h3>
                <BarList items={envItems} />
              </Card>
              <Card style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>Total Estimated CO₂ Saved</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 800, color: '#16a34a' }}>{Number(env.totalEstimatedCO2 || 0).toFixed(1)} kg</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Figures are estimated from average emission factors per category (see DB-requirements). A precise co2_factors table will replace this.</div>
              </Card>
            </div>
          )
          : <Unavailable note={env ? env.note : 'Environmental data unavailable.'} />
      )}
    </PageShell>
  );
}

function Unavailable({ note }) {
  return (
    <Card style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>📊</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Report data not available yet</div>
      <div style={{ fontSize: 12.5, marginTop: 6 }}>{note}</div>
    </Card>
  );
}
Unavailable.propTypes = { note: PropTypes.string.isRequired };

export default Reports;
