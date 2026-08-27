import React, { useEffect, useState } from 'react';
import {
  Card, SectionHeader, TableContainer, Th, Td, Btn, PageShell, Select,
} from './ui';
import { listPriceVersions, createPriceVersion, listCommissionVersions, createCommissionVersion } from '../../services/adminApi';
import { WASTE_CATEGORIES } from '../../utils/constants';

const labelStyle = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6,
};

const COMMISSION_TYPES = ['pickup', 'order'];
const REGIONS = ['Dhaka North', 'Dhaka South', 'Chittagong', 'Gazipur', 'National'];

/**
 * Pricing & Commission configuration (FR-11 §1). Versioned base prices per
 * waste category + region, and versioned commission rates per transaction type.
 * Overlapping effective dates are rejected by the backend (409).
 * @returns {JSX.Element} The pricing screen.
 */
function Pricing() {
  const [priceVersions, setPriceVersions] = useState([]);
  const [commissionVersions, setCommissionVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [priceForm, setPriceForm] = useState({ wasteCategory: WASTE_CATEGORIES[0], region: REGIONS[0], basePriceMin: '', basePriceMax: '', effectiveDate: '' });
  const [commissionForm, setCommissionForm] = useState({ transactionType: COMMISSION_TYPES[0], commissionRate: '', effectiveDate: '' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c] = await Promise.all([listPriceVersions(), listCommissionVersions()]);
      setPriceVersions(p);
      setCommissionVersions(c);
    } catch (err) {
      setError(err.message || 'Failed to load pricing configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const [p, c] = await Promise.all([listPriceVersions(), listCommissionVersions()]);
        if (active) { setPriceVersions(p); setCommissionVersions(c); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load pricing configuration'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPrice = async (e) => {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      await createPriceVersion({
        wasteCategory: priceForm.wasteCategory,
        region: priceForm.region,
        basePriceMin: Number(priceForm.basePriceMin),
        basePriceMax: Number(priceForm.basePriceMax),
        effectiveDate: priceForm.effectiveDate,
      });
      setPriceForm({ wasteCategory: WASTE_CATEGORIES[0], region: REGIONS[0], basePriceMin: '', basePriceMax: '', effectiveDate: '' });
      await load();
    } catch (err) {
      setFormError(err.message || 'Failed to create price version');
    } finally {
      setBusy(false);
    }
  };

  const submitCommission = async (e) => {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      await createCommissionVersion({
        transactionType: commissionForm.transactionType,
        commissionRate: Number(commissionForm.commissionRate),
        effectiveDate: commissionForm.effectiveDate,
      });
      setCommissionForm({ transactionType: COMMISSION_TYPES[0], commissionRate: '', effectiveDate: '' });
      await load();
    } catch (err) {
      setFormError(err.message || 'Failed to create commission version');
    } finally {
      setBusy(false);
    }
  };

  const fieldStyle = {
    height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <PageShell>
      <SectionHeader title="Pricing & Commission" subtitle="Configure versioned base prices and commission rates" />

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}
      {formError && <div style={{ background: '#fff7ed', color: '#c2410c', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fed7aa' }}>{formError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>New Base Price</h3>
          <form onSubmit={submitPrice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Waste Category</label>
            <Select options={WASTE_CATEGORIES} value={priceForm.wasteCategory} onChange={(v) => setPriceForm({ ...priceForm, wasteCategory: v })} />
            <label style={labelStyle}>Region</label>
            <Select options={REGIONS} value={priceForm.region} onChange={(v) => setPriceForm({ ...priceForm, region: v })} />
            <label style={labelStyle}>Base Price Min (৳)</label>
            <input type="number" step="0.01" min="0" value={priceForm.basePriceMin} onChange={(e) => setPriceForm({ ...priceForm, basePriceMin: e.target.value })} style={fieldStyle} required />
            <label style={labelStyle}>Base Price Max (৳)</label>
            <input type="number" step="0.01" min="0" value={priceForm.basePriceMax} onChange={(e) => setPriceForm({ ...priceForm, basePriceMax: e.target.value })} style={fieldStyle} required />
            <label style={labelStyle}>Effective Date</label>
            <input type="date" value={priceForm.effectiveDate} onChange={(e) => setPriceForm({ ...priceForm, effectiveDate: e.target.value })} style={fieldStyle} required />
            <Btn type="submit" disabled={busy}>Create Version</Btn>
          </form>
        </Card>

        <Card style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>New Commission Rate</h3>
          <form onSubmit={submitCommission} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>Transaction Type</label>
            <Select options={COMMISSION_TYPES} value={commissionForm.transactionType} onChange={(v) => setCommissionForm({ ...commissionForm, transactionType: v })} />
            <label style={labelStyle}>Commission Rate (fraction, e.g. 0.05 = 5%)</label>
            <input type="number" step="0.001" min="0" max="1" value={commissionForm.commissionRate} onChange={(e) => setCommissionForm({ ...commissionForm, commissionRate: e.target.value })} style={fieldStyle} required />
            <label style={labelStyle}>Effective Date</label>
            <input type="date" value={commissionForm.effectiveDate} onChange={(e) => setCommissionForm({ ...commissionForm, effectiveDate: e.target.value })} style={fieldStyle} required />
            <Btn type="submit" disabled={busy}>Create Version</Btn>
          </form>
        </Card>
      </div>

      <Card style={{ padding: '20px 22px', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Base Price Versions</h3>
        {loading
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading…</div>
          : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Category</Th><Th>Region</Th><Th>Min (৳)</Th><Th>Max (৳)</Th><Th>Effective Date</Th>
                </tr>
              </thead>
              <tbody>
                {priceVersions.map((v) => (
                  <tr key={v.id} className="table-row-hover">
                    <Td>{v.waste_category}</Td>
                    <Td>{v.region}</Td>
                    <Td mono>{Number(v.base_price_min).toLocaleString()}</Td>
                    <Td mono>{Number(v.base_price_max).toLocaleString()}</Td>
                    <Td>{v.effective_date}</Td>
                  </tr>
                ))}
                {priceVersions.length === 0 && <tr><td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>No price versions yet.</td></tr>}
              </tbody>
            </TableContainer>
          )}
      </Card>

      <Card style={{ padding: '20px 22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Commission Rate Versions</h3>
        {loading
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading…</div>
          : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Transaction Type</Th><Th>Rate</Th><Th>Effective Date</Th>
                </tr>
              </thead>
              <tbody>
                {commissionVersions.map((v) => (
                  <tr key={v.id} className="table-row-hover">
                    <Td>{v.transaction_type}</Td>
                    <Td mono>{`${(Number(v.commission_rate) * 100).toFixed(2)}%`}</Td>
                    <Td>{v.effective_date}</Td>
                  </tr>
                ))}
                {commissionVersions.length === 0 && <tr><td colSpan={3} style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>No commission versions yet.</td></tr>}
              </tbody>
            </TableContainer>
          )}
      </Card>
    </PageShell>
  );
}

export default Pricing;
