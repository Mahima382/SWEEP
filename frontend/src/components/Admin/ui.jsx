import React from 'react';
import PropTypes from 'prop-types';

export const STATUS_CONFIG = {
  Completed: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Accepted: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Active: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Verified: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Cleared: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Confirmed: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  Processing: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'En Route': { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'In Transit': { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'Under Review': { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  Arrived: { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  'Handed Over': { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  Escalated: { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  Collected: { bg: '#f0fdf4', color: '#166534', dot: '#4ade80' },
  Held: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  Pending: { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  'Ready for Global Collector': { bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' },
  Failed: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Suspended: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Banned: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Rejected: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Open: { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  Low: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  Medium: { bg: '#fef9c3', color: '#a16207', dot: '#eab308' },
  High: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  Critical: { bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', marginRight: 5 }} />
      {status}
    </span>
  );
}
StatusBadge.propTypes = { status: PropTypes.string.isRequired };

export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e8eef0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      ...style,
    }}
    >
      {children}
    </div>
  );
}
Card.propTypes = { children: PropTypes.node, style: PropTypes.object };
Card.defaultProps = { style: undefined };

export function KpiCard({ label, value, trend, trendLabel, icon, accent }) {
  const isPos = trend && !trend.startsWith('-');
  return (
    <Card style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: accent || '#0f172a', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.5px' }}>{value}</div>
          {trend && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <span style={{ color: isPos ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{trend}</span>
              <span style={{ color: '#94a3b8' }}>{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: accent ? `${accent}15` : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  trend: PropTypes.string,
  trendLabel: PropTypes.string,
  icon: PropTypes.node,
  accent: PropTypes.string,
};
KpiCard.defaultProps = {
  trend: undefined, trendLabel: undefined, icon: undefined, accent: undefined,
};

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: action ? 'center' : 'flex-start', marginBottom: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};
SectionHeader.defaultProps = { subtitle: undefined, action: undefined };

const BTN_STYLES = {
  primary: { background: '#065f46', color: '#fff', border: '1px solid #065f46' },
  secondary: { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' },
  outline: { background: 'transparent', color: '#065f46', border: '1px solid #065f46' },
  ghost: { background: 'transparent', color: '#64748b', border: '1px solid transparent' },
  danger: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
};

export function Btn({
  children, onClick, variant, size, disabled, type,
}) {
  const paddings = { sm: '5px 12px', md: '8px 16px' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_STYLES[variant],
        padding: paddings[size],
        borderRadius: 8,
        fontSize: size === 'sm' ? 12.5 : 13.5,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
Btn.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md']),
  disabled: PropTypes.bool,
  type: PropTypes.string,
};
Btn.defaultProps = {
  children: undefined,
  onClick: undefined,
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
};

export function PageShell({ children }) {
  return (
    <div style={{ padding: '28px 32px', height: '100%', overflowY: 'auto', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {children}
    </div>
  );
}
PageShell.propTypes = { children: PropTypes.node.isRequired };

export function TableContainer({ children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        {children}
      </table>
    </div>
  );
}
TableContainer.propTypes = { children: PropTypes.node.isRequired };

export function Th({ children, align }) {
  return (
    <th style={{
      padding: '10px 14px',
      textAlign: align || 'left',
      fontSize: 11.5,
      fontWeight: 600,
      color: '#64748b',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      borderBottom: '1px solid #e8eef0',
      whiteSpace: 'nowrap',
      background: '#f8fafc',
    }}
    >
      {children}
    </th>
  );
}
Th.propTypes = { children: PropTypes.node, align: PropTypes.string };
Th.defaultProps = { align: undefined };

export function Td({ children, align, mono }) {
  return (
    <td style={{
      padding: '11px 14px',
      textAlign: align || 'left',
      borderBottom: '1px solid #f1f5f9',
      color: '#1e293b',
      fontFamily: mono ? "'DM Mono', monospace" : undefined,
      fontSize: mono ? 12.5 : 13.5,
      verticalAlign: 'middle',
    }}
    >
      {children}
    </td>
  );
}
Td.propTypes = {
  children: PropTypes.node,
  align: PropTypes.string,
  mono: PropTypes.bool,
};
Td.defaultProps = { align: undefined, mono: false };

export function FilterBar({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}
FilterBar.propTypes = { children: PropTypes.node.isRequired };

export function Select({ options, value, onChange, style }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 36, paddingLeft: 10, paddingRight: 28,
        borderRadius: 8, border: '1px solid #e2e8f0',
        background: '#fff', fontSize: 13, color: '#334155',
        cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2394a3b8\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        ...style,
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object,
};
Select.defaultProps = { style: undefined };

export function SearchInput({ placeholder, value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }}>🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{
          height: 36, paddingLeft: 30, paddingRight: 12,
          borderRadius: 8, border: '1px solid #e2e8f0',
          background: '#fff', fontSize: 13, color: '#0f172a',
          outline: 'none', fontFamily: 'inherit', width: 220,
        }}
      />
    </div>
  );
}
SearchInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
SearchInput.defaultProps = { placeholder: undefined };

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid #e8eef0', marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          style={{
            padding: '9px 16px',
            fontSize: 13.5,
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: active === t ? '#065f46' : '#64748b',
            borderBottom: active === t ? '2px solid #065f46' : '2px solid transparent',
            marginBottom: -2,
            transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
TabBar.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default {
  StatusBadge,
  Card,
  KpiCard,
  SectionHeader,
  Btn,
  PageShell,
  TableContainer,
  Th,
  Td,
  FilterBar,
  Select,
  SearchInput,
  TabBar,
};
