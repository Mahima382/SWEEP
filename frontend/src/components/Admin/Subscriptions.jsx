import React, { useEffect, useState } from 'react';
import {
  Card, SectionHeader, TableContainer, Th, Td, Btn, PageShell, Select,
} from './ui';
import { listPlans, createPlan, updatePlan, archivePlan } from '../../services/adminApi';

const labelStyle = {
  display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6,
};

/**
 * Parse the features column (stored as JSON) into an array of strings.
 * @param {*} features Raw features value from the API.
 * @returns {string[]} Feature list.
 */
function parseFeatures(features) {
  if (!features) { return []; }
  if (Array.isArray(features)) { return features.map((f) => String(f)); }
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) { return parsed.map((f) => String(f)); }
      if (parsed && typeof parsed === 'object') { return Object.values(parsed).map((f) => String(f)); }
    } catch (err) {
      return [features];
    }
  }
  return [];
}

/**
 * Subscription Management (FR-11 §2). Plans are created / edited / archived.
 * Plans are never deleted — archiving removes them from new signups while
 * existing subscribers are preserved.
 * @returns {JSX.Element} The subscriptions screen.
 */
function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', durationDays: '', currency: 'BDT', features: '' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listPlans(showArchived);
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const data = await listPlans(showArchived);
        if (active) { setPlans(data); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load plans'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const openCreate = () => {
    setForm({ name: '', price: '', durationDays: '', currency: 'BDT', features: '' });
    setFormError('');
    setDrawer({ mode: 'create' });
  };

  const openEdit = (plan) => {
    setForm({
      name: plan.name,
      price: String(plan.price),
      durationDays: String(plan.duration_days),
      currency: plan.currency || 'BDT',
      features: parseFeatures(plan.features).join('\n'),
    });
    setFormError('');
    setDrawer({ mode: 'edit', planId: plan.id });
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      durationDays: Number(form.durationDays),
      currency: form.currency,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (drawer.mode === 'create') {
        await createPlan(payload);
      } else {
        await updatePlan(drawer.planId, payload);
      }
      setDrawer(null);
      await load();
    } catch (err) {
      setFormError(err.message || 'Failed to save plan');
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async (plan) => {
    if (!window.confirm(`Archive plan "${plan.name}"? Existing subscribers are unaffected; it becomes unavailable for new signups.`)) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await archivePlan(plan.id);
      await load();
      if (res && res.note) {
        setError(''); // success; note shown via alert
        window.alert(res.note);
      }
    } catch (err) {
      setError(err.message || 'Failed to archive plan');
    } finally {
      setBusy(false);
    }
  };

  const fieldStyle = {
    height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  return (
    <PageShell>
      <SectionHeader
        title="Subscription Management"
        subtitle="Create, edit, and archive subscription plans"
        action={<Btn onClick={openCreate}>+ New Plan</Btn>}
      />

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}

      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Plans</h3>
          <Btn variant="ghost" onClick={() => setShowArchived((v) => !v)}>{showArchived ? 'Hide Archived' : 'Show Archived'}</Btn>
        </div>

        {loading
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading…</div>
          : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Plan</Th><Th>Price</Th><Th>Duration</Th><Th>Currency</Th><Th>Features</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <Td><span style={{ fontWeight: 600 }}>{p.name}</span></Td>
                    <Td mono>{Number(p.price).toLocaleString()}</Td>
                    <Td>{p.duration_days} days</Td>
                    <Td>{p.currency || 'BDT'}</Td>
                    <Td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {parseFeatures(p.features).map((f, i) => <span key={i} style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 6, color: '#475569' }}>{f}</span>)}
                      </div>
                    </Td>
                    <Td>{p.archived ? <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12.5 }}>Archived</span> : <span style={{ color: '#15803d', fontWeight: 600, fontSize: 12.5 }}>Active</span>}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="ghost" onClick={() => openEdit(p)} disabled={busy}>Edit</Btn>
                        {!p.archived && <Btn size="sm" variant="secondary" onClick={() => handleArchive(p)} disabled={busy}>Archive</Btn>}
                      </div>
                    </Td>
                  </tr>
                ))}
                {plans.length === 0 && <tr><td colSpan={7} style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>No plans found.</td></tr>}
              </tbody>
            </TableContainer>
          )}
      </Card>

      {drawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} onClick={() => setDrawer(null)}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 420, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{drawer.mode === 'create' ? 'New Plan' : 'Edit Plan'}</h2>
              <button type="button" onClick={() => setDrawer(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {formError && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{formError}</div>}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={labelStyle}>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={fieldStyle} required />
              <label style={labelStyle}>Price</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={fieldStyle} required />
              <label style={labelStyle}>Duration (days)</label>
              <input type="number" min="1" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} style={fieldStyle} required />
              <label style={labelStyle}>Currency</label>
              <Select options={['BDT', 'USD']} value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
              <label style={labelStyle}>Features (one per line)</label>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} style={{ ...fieldStyle, height: 90, padding: 10, resize: 'none' }} />
              <Btn type="submit" disabled={busy}>{drawer.mode === 'create' ? 'Create Plan' : 'Save Changes'}</Btn>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default Subscriptions;
