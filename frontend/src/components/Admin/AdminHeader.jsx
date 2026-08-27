import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const viewLabels = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/kyc': 'KYC Review',
  '/admin/pricing': 'Pricing & Commission',
  '/admin/fraud': 'Fraud Detection',
  '/admin/audit': 'Audit Logs',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/reports': 'Reports',
};

const displayLabels = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/kyc': 'KYC Review',
  '/admin/pricing': 'Pricing & Commission',
  '/admin/fraud': 'Fraud Detection',
  '/admin/audit': 'Audit Logs',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/reports': 'Reports',
};

/**
 * Light admin header with breadcrumb + search + user chip + logout.
 * @returns {JSX.Element} The admin header.
 */
function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const label = displayLabels[location.pathname] || viewLabels[location.pathname] || 'Admin Portal';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      height: 64,
      background: '#fff',
      borderBottom: '1px solid #e8eef0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
      zIndex: 5,
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>Admin Portal</span>
        <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
        <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative' }}>
          <button type="button" title="Notifications" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 15 }}>🔔</button>
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />
        </div>
        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #065f46, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12,
          }}
          >
            SA
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>{user ? (user.name || 'Super Admin') : 'Super Admin'}</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.2 }}>Administrator</div>
          </div>
        </div>
        <button type="button" onClick={handleLogout} title="Log out" style={{ marginLeft: 4, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, height: 36, padding: '0 10px', color: '#475569', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Log out</button>
      </div>
    </header>
  );
}

export default AdminHeader;
