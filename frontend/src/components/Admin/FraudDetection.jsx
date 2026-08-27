import React, { useEffect, useState } from 'react';
import {
  Card, SectionHeader, StatusBadge, TableContainer, Th, Td, Btn, PageShell, FilterBar, Select,
} from './ui';
import { listFraudQueue, listFraudRules, clearFlag, escalateFlag } from '../../services/adminApi';
import { statusBadgeValue } from './adminUtils';

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];
const SEVERITY_COLORS = {
  Critical: { bg: '#fce7f3', color: '#9d174d' },
  High: { bg: '#fee2e2', color: '#b91c1c' },
  Medium: { bg: '#fef9c3', color: '#a16207' },
  Low: { bg: '#dcfce7', color: '#15803d' },
};
const STATUS_OPTIONS = ['All', 'pending', 'cleared', 'escalated'];
const STATUS_VALUES = { All: '', pending: 'pending', cleared: 'cleared', escalated: 'escalated' };

/**
 * Fraud Detection queue (FR-11 §3). Lists flags with risk summary, opens an
 * investigation panel, and lets the admin clear / escalate (audited, fail-closed).
 * @returns {JSX.Element} The fraud detection screen.
 */
function FraudDetection() {
  const [flags, setFlags] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [f, r] = await Promise.all([listFraudQueue({ status: STATUS_VALUES[statusFilter] || undefined }), listFraudRules()]);
      setFlags(f);
      setRules(r);
    } catch (err) {
      setError(err.message || 'Failed to load fraud queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const [f, r] = await Promise.all([listFraudQueue({ status: STATUS_VALUES[statusFilter] || undefined }), listFraudRules()]);
        if (active) { setFlags(f); setRules(r); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load fraud queue'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const runAction = async (fn) => {
    if (!selected) { return; }
    setBusy(true);
    setActionError('');
    try {
      await fn();
      setNote('');
      await load();
      const updated = flags.find((x) => x.id === selected.id);
      setSelected(updated || null);
    } catch (err) {
      setActionError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="Fraud Detection"
        subtitle="Review flagged accounts and suspicious activity"
        action={<Btn variant="secondary" onClick={() => load()}>Refresh</Btn>}
      />

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {SEVERITY_ORDER.map((sev) => {
          const count = flags.filter((f) => statusBadgeValue(f.severity) === sev).length;
          const colors = SEVERITY_COLORS[sev];
          return (
            <Card key={sev} style={{ padding: '16px 20px', borderLeft: `4px solid ${colors.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.color, marginBottom: 4 }}>{sev} Risk</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 800, color: colors.color }}>{count}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>flags</div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 16 }}>
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Fraud Flag Queue</h3>
            <FilterBar>
              <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            </FilterBar>
          </div>

          {loading
            ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading…</div>
            : (
              <TableContainer>
                <thead>
                  <tr>
                    <Th>Flag ID</Th><Th>User</Th><Th>Reason</Th><Th>Risk</Th><Th>Rule</Th><Th>Detected</Th><Th>Status</Th><Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.id} className="table-row-hover" style={{ cursor: 'pointer', background: selected && selected.id === f.id ? '#f0fdf4' : undefined }} onClick={() => { setSelected(f); setNote(''); setActionError(''); }}>
                      <Td mono><span style={{ color: '#065f46', fontWeight: 600 }}>FF-{f.id}</span></Td>
                      <Td><span style={{ fontWeight: 500 }}>{f.user_id ? `User #${f.user_id}` : '—'}</span></Td>
                      <Td><span style={{ fontSize: 12.5, color: '#475569' }}>{f.details || '—'}</span></Td>
                      <Td><StatusBadge status={statusBadgeValue(f.severity)} /></Td>
                      <Td><span style={{ fontSize: 12.5 }}>{f.rule || '—'}</span></Td>
                      <Td>{f.created_at ? String(f.created_at).slice(0, 10) : '—'}</Td>
                      <Td><StatusBadge status={statusBadgeValue(f.status)} /></Td>
                      <Td>
                        <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                          <Btn size="sm" variant="outline" onClick={() => { setSelected(f); setNote(''); setActionError(''); }}>Investigate</Btn>
                          {f.status === 'pending' && <Btn size="sm" variant="secondary" onClick={() => runAction(() => clearFlag(f.id, note))} disabled={busy}>Clear</Btn>}
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {flags.length === 0 && <tr><td colSpan={8} style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>No fraud flags match the current filter.</td></tr>}
                </tbody>
              </TableContainer>
            )}
        </Card>

        {selected && (
          <Card style={{ padding: 22, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Investigation Panel</h3>
              <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {actionError && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{actionError}</div>}

            <div style={{ marginBottom: 12 }}><StatusBadge status={statusBadgeValue(selected.severity)} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Flag ID', value: `FF-${selected.id}`, mono: true },
                { label: 'User', value: selected.user_id ? `User #${selected.user_id}` : '—' },
                { label: 'Rule', value: selected.rule || '—' },
                { label: 'Reason', value: selected.details || '—' },
                { label: 'Order', value: selected.order_id ? `#${selected.order_id}` : '—', mono: true },
                { label: 'Detected', value: selected.created_at ? String(selected.created_at) : '—' },
                { label: 'Status', value: statusBadgeValue(selected.status) },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f8fafc', paddingBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>{r.label}</span>
                  <span style={{ fontWeight: 600, fontFamily: r.mono ? "'DM Mono', monospace" : undefined, color: '#0f172a' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activity Timeline</h4>
            {[
              'Flag auto-detected by system',
              `Risk scored as ${statusBadgeValue(selected.severity)}`,
              'Assigned to review queue',
              selected.status === 'escalated' ? 'Escalated to senior admin' : selected.status === 'cleared' ? 'Flag cleared by admin' : 'Awaiting investigation',
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 4, flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, color: '#475569' }}>{ev}</div>
              </div>
            ))}

            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', margin: '16px 0 6px' }}>Decision Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the audit trail…" style={{ width: '100%', height: 70, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }} />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn variant="secondary" onClick={() => runAction(() => clearFlag(selected.id, note))} disabled={busy || selected.status !== 'pending'}>Clear Flag</Btn>
              <Btn variant="danger" onClick={() => runAction(() => escalateFlag(selected.id, note))} disabled={busy || selected.status !== 'pending'}>Escalate</Btn>
            </div>
          </Card>
        )}
      </div>

      {rules.length > 0 && (
        <Card style={{ padding: '20px 22px', marginTop: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Active Fraud Rules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {rules.map((rule) => (
              <div key={rule.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{rule.id}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{rule.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}

export default FraudDetection;
