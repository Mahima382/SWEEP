import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../../styles/admin.css';

/**
 * Top-level Admin Portal shell: guards the route to admins, then renders the
 * dark sidebar + light header chrome around the active admin screen (Outlet).
 * @returns {JSX.Element} The admin layout.
 */
function AdminLayout() {
  const { user, token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f4' }}>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminHeader />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
