import React, { useEffect, useState } from 'react';
import {
  Card, SectionHeader, StatusBadge, TableContainer, Th, Td, Btn, FilterBar, Select, SearchInput, PageShell,
} from './ui';
import { listUsers, suspendOrBanUser, reinstateUser, kycVerifyUser, kycRejectUser } from '../../services/adminApi';
import { roleLabel, initials, statusBadgeValue } from './adminUtils';

const ROLE_OPTIONS = ['All Roles', 'Household', 'Local Collector', 'Global Collector', 'Company', 'Admin'];
const ROLE_VALUES = {
  'All Roles': '', Household: 'household', 'Local Collector': 'local_collector', 'Global Collector': 'global_collector', Company: 'company', Admin: 'admin',
};
const STATUS_OPTIONS = ['All Statuses', 'Active', 'Suspended', 'Banned', 'Pending'];
const STATUS_VALUES = {
  'All Statuses': '', Active: 'active', Suspended: 'suspended', Banned: 'banned', Pending: 'pending',
};

/**
 * Trigger a CSV download of the currently listed users.
 * @param {object[]} users User rows.
 */
function downloadUsersCsv(users) {
  const header = ['id', 'name', 'email', 'phone', 'role', 'region', 'kyc_status', 'status', 'joined'];
  const escape = (v) => `"${(v === null || v === undefined ? '' : String(v)).replace(/"/g, '""')}"`;
  const lines = users.map((u) => header.map((h) => escape(u[h])).join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * User Management screen (FR-11). Lists users with search/filter and opens a
 * drawer to suspend / ban / reinstate / verify / reject KYC — all audited on the
 * backend (fail-closed).
 * @returns {JSX.Element} The user management screen.
 */
function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listUsers({
          search: search || undefined,
          role: ROLE_VALUES[roleFilter] || undefined,
          status: STATUS_VALUES[statusFilter] || undefined,
        });
        if (active) { setUsers(data); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load users'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    load();
    return () => { active = false; };
  }, [search, roleFilter, statusFilter]);

  const refreshAndSelect = async (id) => {
    const data = await listUsers({
      search: search || undefined,
      role: ROLE_VALUES[roleFilter] || undefined,
      status: STATUS_VALUES[statusFilter] || undefined,
    });
    setUsers(data);
    const updated = data.find((u) => u.id === id);
    if (updated) { setSelectedUser(updated); }
  };

  const runAction = async (fn) => {
    setBusy(true);
    setActionError('');
    try {
      await fn();
      await refreshAndSelect(selectedUser.id);
      setConfirmAction(null);
    } catch (err) {
      setActionError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="User Management"
        subtitle="Manage platform users, KYC status, and account access"
        action={(
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={() => downloadUsersCsv(users)}>Export</Btn>
            <Btn>+ Invite User</Btn>
          </div>
        )}
      />

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>
      )}

      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>All Users</h3>
          <FilterBar>
            <SearchInput placeholder="Search name, email..." value={search} onChange={setSearch} />
            <Select options={ROLE_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
            <Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          </FilterBar>
        </div>

        {loading
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13, padding: '20px 0' }}><span className="sweep-spinner" /> Loading users…</div>
          : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Contact</Th>
                  <Th>Region</Th>
                  <Th>KYC</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="table-row-hover" style={{ cursor: 'pointer' }} onClick={() => { setSelectedUser(u); setConfirmAction(null); setActionError(''); }}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #065f46, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{initials(u.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>USR-{u.id}</div>
                        </div>
                      </div>
                    </Td>
                    <Td><span style={{ fontSize: 12.5, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontWeight: 500, color: '#475569' }}>{roleLabel(u.role)}</span></Td>
                    <Td>
                      <div style={{ fontSize: 12.5 }}>
                        <div style={{ color: '#334155' }}>{u.email}</div>
                        <div style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>{u.phone || '—'}</div>
                      </div>
                    </Td>
                    <Td>{u.region || '—'}</Td>
                    <Td><StatusBadge status={statusBadgeValue(u.kyc_status)} /></Td>
                    <Td><StatusBadge status={statusBadgeValue(u.status)} /></Td>
                    <Td><span style={{ fontSize: 12.5, color: '#64748b' }}>{u.joined || '—'}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <Btn size="sm" variant="ghost" onClick={() => { setSelectedUser(u); setConfirmAction(null); setActionError(''); }}>View</Btn>
                        {u.status === 'active' && <Btn size="sm" variant="danger" onClick={() => { setSelectedUser(u); setConfirmAction({ action: 'Suspend', reason: '' }); setActionError(''); }}>Suspend</Btn>}
                        {u.status === 'suspended' && <Btn size="sm" variant="secondary" onClick={() => runAction(() => reinstateUser(u.id))}>Reinstate</Btn>}
                        {u.status === 'banned' && <Btn size="sm" variant="secondary" onClick={() => runAction(() => reinstateUser(u.id))}>Reinstate</Btn>}
                      </div>
                    </Td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>No users match the current filters.</td></tr>
                )}
              </tbody>
            </TableContainer>
          )}
      </Card>

      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }} onClick={() => { setSelectedUser(null); setConfirmAction(null); setActionError(''); }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 420, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>User Profile</h2>
              <button type="button" onClick={() => { setSelectedUser(null); setConfirmAction(null); setActionError(''); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #065f46, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>{initials(selectedUser.name)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{selectedUser.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>USR-{selectedUser.id} · {roleLabel(selectedUser.role)}</div>
                <div style={{ marginTop: 6 }}><StatusBadge status={statusBadgeValue(selectedUser.status)} /></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Email', value: selectedUser.email },
                { label: 'Phone', value: selectedUser.phone || '—', mono: true },
                { label: 'Region', value: selectedUser.region || '—' },
                { label: 'KYC Status', value: statusBadgeValue(selectedUser.kyc_status) },
                { label: 'Member Since', value: selectedUser.joined || '—' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, borderBottom: '1px solid #f8fafc', paddingBottom: 10 }}>
                  <span style={{ color: '#64748b' }}>{r.label}</span>
                  <span style={{ fontWeight: 600, fontFamily: r.mono ? "'DM Mono', monospace" : undefined, fontSize: r.mono ? 13 : undefined, color: '#0f172a' }}>{r.value}</span>
                </div>
              ))}
            </div>

            {actionError && (
              <div style={{ marginTop: 16, background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, border: '1px solid #fecaca' }}>{actionError}</div>
            )}

            {confirmAction && (
              <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>{confirmAction.action} User</div>
                <textarea
                  placeholder="Reason for this action (required)..."
                  value={confirmAction.reason}
                  onChange={(e) => setConfirmAction({ ...confirmAction, reason: e.target.value })}
                  style={{ width: '100%', height: 80, padding: 10, borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Btn variant="danger" disabled={!confirmAction.reason.trim() || busy} onClick={() => runAction(() => suspendOrBanUser(selectedUser.id, confirmAction.action, confirmAction.reason))}>Confirm {confirmAction.action}</Btn>
                  <Btn variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Btn>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {!confirmAction && selectedUser.status === 'active' && (
                <Btn variant="danger" onClick={() => setConfirmAction({ action: 'Suspend', reason: '' })}>Suspend</Btn>
              )}
              {!confirmAction && selectedUser.status === 'active' && (
                <Btn variant="danger" onClick={() => setConfirmAction({ action: 'Ban', reason: '' })}>Ban</Btn>
              )}
              {!confirmAction && selectedUser.status !== 'active' && (
                <Btn onClick={() => runAction(() => reinstateUser(selectedUser.id))} disabled={busy}>Reinstate</Btn>
              )}
              {!confirmAction && selectedUser.kyc_status !== 'verified' && selectedUser.kyc_status !== 'rejected' && (
                <Btn variant="outline" onClick={() => runAction(() => kycVerifyUser(selectedUser.id))} disabled={busy}>✓ Approve KYC</Btn>
              )}
              {!confirmAction && selectedUser.kyc_status !== 'verified' && (
                <Btn variant="danger" onClick={() => { setConfirmAction({ action: 'Reject KYC', reason: '' }); }}>✕ Reject KYC</Btn>
              )}
              {!confirmAction && selectedUser.kyc_status === 'verified' && (
                <Btn variant="secondary" onClick={() => { setActionError(''); }}>KYC Verified</Btn>
              )}
            </div>

            {confirmAction && confirmAction.action === 'Reject KYC' && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  placeholder="Reason for KYC rejection (required)..."
                  value={confirmAction.reason}
                  onChange={(e) => setConfirmAction({ ...confirmAction, reason: e.target.value })}
                  style={{ width: '100%', height: 70, padding: 10, borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Btn variant="danger" disabled={!confirmAction.reason.trim() || busy} onClick={() => runAction(() => kycRejectUser(selectedUser.id, confirmAction.reason))}>Confirm Rejection</Btn>
                  <Btn variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default UserManagement;
