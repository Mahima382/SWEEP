import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const SweepLogo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="#10b981" />
    <path d="M14 6C9.58 6 6 9.58 6 14C6 18.42 9.58 22 14 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 22C18.42 22 22 18.42 22 14C22 9.58 18.42 6 14 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M19 11L22 8L19 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 17L6 20L9 23" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
    <circle cx="14" cy="14" r="2.5" fill="white" />
  </svg>
);

const navItems = [
  { id: 'admin', label: 'Dashboard', icon: '⊞', to: '/admin', end: true },
  { id: 'users', label: 'Users', icon: '👥', to: '/admin/users' },
  { id: 'kyc', label: 'KYC Review', icon: '🪪', to: '/admin/kyc' },
  { id: 'pricing', label: 'Pricing & Commission', icon: '💰', to: '/admin/pricing' },
  { id: 'fraud', label: 'Fraud Detection', icon: '🚨', to: '/admin/fraud' },
  { id: 'audit', label: 'Audit Logs', icon: '📝', to: '/admin/audit' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '⭐', to: '/admin/subscriptions' },
  { id: 'reports', label: 'Reports', icon: '📊', to: '/admin/reports' },
];

/**
 * Dark admin sidebar with section navigation. Closes over to the right column.
 * @param {object} props Component props.
 * @param {boolean} props.collapsed Whether the sidebar is collapsed.
 * @param {Function} props.onToggle Toggle collapse handler.
 * @returns {JSX.Element} The admin sidebar.
 */
function AdminSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <div style={{
      width: collapsed ? 64 : 240,
      background: '#0a1f1a',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}
    >
      <div style={{ padding: collapsed ? '20px 18px' : '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
        <div style={{ flexShrink: 0 }}><SweepLogo /></div>
        {!collapsed && (
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px', lineHeight: 1 }}>SWEEP</div>
            <div style={{ color: '#4ade80', fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', lineHeight: 1.3, marginTop: 2, opacity: 0.85 }}>Smart Waste Exchange &amp; Eco Platform</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#334155', textTransform: 'uppercase', padding: collapsed ? '4px 0 6px' : '4px 22px 6px' }}>
        {collapsed ? '' : 'Administration'}
      </div>

      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? item.label : undefined}
            style={{ justifyContent: collapsed ? 'center' : undefined, padding: collapsed ? '10px' : undefined }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: collapsed ? '14px 10px' : '14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0d9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}
        >
          SA
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user ? (user.name || 'Super Admin') : 'Super Admin'}
            </div>
            <div style={{ color: '#64748b', fontSize: 11.5, lineHeight: 1.2, marginTop: 1 }}>Administrator</div>
          </div>
        )}
        {!collapsed && (
          <button type="button" onClick={logout} title="Log out" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>⎋</button>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', top: 22, right: -12,
          width: 24, height: 24, borderRadius: '50%',
          background: '#1e3a34', border: '1px solid rgba(255,255,255,0.1)',
          color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, zIndex: 20,
        }}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  );
}

AdminSidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default AdminSidebar;
