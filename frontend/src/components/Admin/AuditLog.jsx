import React, { useEffect, useState } from 'react';
import {
  Card, SectionHeader, TableContainer, Th, Td, Btn, PageShell, FilterBar, SearchInput,
} from './ui';
import { listAuditLogs, exportAuditLogsCsv } from '../../services/adminApi';

/**
 * Trigger a CSV download of audit logs with the active filters.
 * @param {object} filters Active filters.
 */
function downloadCsv(filters) {
  exportAuditLogsCsv(filters)
    .then((csv) => {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => { /* ignore export errors */ });
}

/**
 * Audit Logs screen (FR-11 §4). Immutable, tamper-evident records with search
 * and date filtering, plus CSV export.
 * @returns {JSX.Element} The audit log screen.
 */
function AuditLog() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await listAuditLogs(filters);
        if (active) { setLogs(data); }
      } catch (err) {
        if (active) { setError(err.message || 'Failed to load audit logs'); }
      } finally {
        if (active) { setLoading(false); }
      }
    };
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dateFrom, dateTo]);

  const dateStyle = {
    height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <PageShell>
      <SectionHeader
        title="Audit Logs"
        subtitle="Immutable record of all platform administrative actions"
        action={<Btn variant="secondary" onClick={() => downloadCsv(filters)}>Export CSV</Btn>}
      />

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
        <span>🔒</span>
        <span>Audit logs are immutable and cannot be edited or deleted. All administrative actions are recorded automatically.</span>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginBottom: 16, border: '1px solid #fecaca' }}>{error}</div>}

      <Card style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Event Log</h3>
          <FilterBar>
            <SearchInput placeholder="Search action, target, details..." value={search} onChange={setSearch} />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateStyle} title="From date" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateStyle} title="To date" />
          </FilterBar>
        </div>

        {loading
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748b', fontSize: 13 }}><span className="sweep-spinner" /> Loading…</div>
          : (
            <TableContainer>
              <thead>
                <tr>
                  <Th>Timestamp</Th><Th>Actor</Th><Th>Action</Th><Th>Target</Th><Th>Details</Th><Th>Result</Th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="table-row-hover">
                    <Td mono><span style={{ color: '#475569', fontSize: 12 }}>{log.created_at}</span></Td>
                    <Td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: log.actor_role === 'system' ? '#f1f5f9' : '#f0fdf4', borderRadius: 6, padding: '2px 8px' }}>
                        <span style={{ fontSize: 11 }}>{log.actor_role === 'system' ? '⚙️' : '👤'}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: log.actor_role === 'system' ? '#475569' : '#065f46', fontWeight: 500 }}>{log.actor_role || '—'}</span>
                      </div>
                    </Td>
                    <Td><span style={{ fontWeight: 600, fontSize: 13.5 }}>{log.action}</span></Td>
                    <Td><span style={{ fontSize: 12.5, color: '#475569', fontFamily: "'DM Mono', monospace" }}>{`${log.target_type || '—'} #${log.target_id ?? '—'}`}</span></Td>
                    <Td><span style={{ fontSize: 12, color: '#64748b' }}>{log.details ? (typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)) : '—'}</span></Td>
                    <Td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        Success
                      </span>
                    </Td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={6} style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>No audit records match your search.</td></tr>}
              </tbody>
            </TableContainer>
          )}
      </Card>
    </PageShell>
  );
}

export default AuditLog;
