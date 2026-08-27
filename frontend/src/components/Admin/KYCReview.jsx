import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, SectionHeader, StatusBadge, Btn, PageShell,
} from './ui';
import { listUsers, kycVerifyUser, kycRejectUser } from '../../services/adminApi';
import { roleLabel, statusBadgeValue } from './adminUtils';

const DOC_TILES = ['NID Front', 'NID Back', 'Selfie', 'Address Proof'];

/**
 * Single verification checklist item (local toggle).
 * @param {object} props Component props.
 * @param {string} props.label Checklist label.
 * @returns {JSX.Element} The checklist item.
 */
function CheckItem({ label }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer' }} onClick={() => setChecked((c) => !c)}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? '#065f46' : '#d1d5db'}`,
        background: checked ? '#065f46' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
      >
        {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 12.5, color: checked ? '#065f46' : '#475569', lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}
CheckItem.propTypes = { label: PropTypes.string.isRequired };

/**
 * KYC Review screen (FR-11). Lists users awaiting KYC verification and lets the
 * admin approve / reject (reject requires a reason). Backend writes an audit
 * record for every decision (fail-closed).
 * @returns {JSX.Element} The KYC review screen.
 */
function KYCReview() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const all = await listUsers({});
      const queue = all.filter((u) => u.kyc_status && u.kyc_status !== 'verified');
      setUsers(queue);
      if (!selected && queue.length > 0) { setSelected(queue[0]); }
      else if (selected) { setSelected(queue.find((u) => u.id === selected.id) || null); }
    } catch (err) {
      setError(err.message || 'Failed to load KYC queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const all = await listUsers({});
        if (!active) { return; }
        const queue = all.filter((u) => u.kyc_status && u.kyc_status !== 'verified');
        setUsers(queue);
        if (queue.length > 0) { setSelected(queue[0]); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load KYC queue'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAction = async (fn) => {
    if (!selected) { return; }
    setBusy(true);
    setActionError('');
    try {
      await fn();
      setShowReject(false);
      setRejectReason('');
      await load();
    } catch (err) {
      setActionError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <SectionHeader title="KYC Review" subtitle="Verify applicant identities and approve or reject submissions" />

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}

      {loading
        ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading KYC queue…</div>
        : users.length === 0
          ? <Card style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No users are awaiting KYC review. 🎉</Card>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 16, minHeight: 480 }}>
              <Card style={{ padding: '16px 12px', overflowY: 'auto' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 12px' }}>
                  Pending ({users.length})
                </div>
                {users.map((app) => (
                  <div key={app.id} onClick={() => { setSelected(app); setShowReject(false); setRejectReason(''); setActionError(''); }} style={{ padding: '12px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 6, background: selected && selected.id === app.id ? '#f0fdf4' : 'transparent', border: selected && selected.id === app.id ? '1px solid #bbf7d0' : '1px solid transparent', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{app.name}</div>
                      <StatusBadge status={statusBadgeValue(app.kyc_status)} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{roleLabel(app.role)}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>USR-{app.id}</div>
                  </div>
                ))}
              </Card>

              <Card style={{ padding: '22px 24px', overflowY: 'auto' }}>
                {selected ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                      <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{selected.name}</h2>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{roleLabel(selected.role)} · USR-{selected.id}</div>
                      </div>
                      <StatusBadge status={statusBadgeValue(selected.kyc_status)} />
                    </div>

                    {actionError && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{actionError}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                      {[
                        { label: 'Full Name / Business', value: selected.name },
                        { label: 'User Type', value: roleLabel(selected.role) },
                        { label: 'Email', value: selected.email },
                        { label: 'Region', value: selected.region || '—' },
                        { label: 'Phone', value: selected.phone || '—' },
                        { label: 'Member Since', value: selected.joined || '—' },
                      ].map((f) => (
                        <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0f172a' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Submitted Documents</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
                      {DOC_TILES.map((doc) => (
                        <div key={doc} style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: '#fafafa', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#065f46'; e.currentTarget.style.background = '#f0fdf4'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa'; }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{doc}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Click to preview</div>
                        </div>
                      ))}
                    </div>

                    {showReject && (
                      <div style={{ marginBottom: 16, padding: 16, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                        <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8, fontSize: 13 }}>Rejection Reason (required)</div>
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this KYC application is being rejected..." style={{ width: '100%', height: 80, padding: 10, borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Btn onClick={() => runAction(() => kycVerifyUser(selected.id))} disabled={busy}>✓ Approve KYC</Btn>
                      {!showReject
                        ? <Btn variant="danger" onClick={() => setShowReject(true)}>✕ Reject</Btn>
                        : <Btn variant="danger" disabled={!rejectReason.trim() || busy} onClick={() => runAction(() => kycRejectUser(selected.id, rejectReason))}>Confirm Rejection</Btn>}
                      {showReject && <Btn variant="ghost" onClick={() => { setShowReject(false); setRejectReason(''); }}>Cancel</Btn>}
                      <Btn variant="secondary">Request More Info</Btn>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>Select an application from the queue</div>
                )}
              </Card>

              <Card style={{ padding: 20, overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Verification Checklist</h4>
                {[
                  'Identity document is valid and not expired',
                  'Photo matches NID',
                  'Address is legible and consistent',
                  'Documents are not altered or watermarked',
                  'Business registration is authentic (if applicable)',
                  'No duplicate account detected',
                ].map((item, i) => <CheckItem key={i} label={item} />)}
                <div style={{ marginTop: 20, padding: '12px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>Review Guidelines</div>
                  <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>All checks must pass before approving. Flag weight variance or unusual patterns to the Fraud Detection team.</div>
                </div>
              </Card>
            </div>
          )}
    </PageShell>
  );
}

export default KYCReview;
