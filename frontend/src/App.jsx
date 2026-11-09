import React, { useState } from 'react';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import NotificationBell from './components/Shared/Notifications/NotificationBell';
import HouseholdDashboard from './components/Household/HouseholdDashboard';
import CollectorDashboard from './components/Collector/CollectorDashboard';
import CompanyDashboard from './components/Company/CompanyDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';

/**
 * Inner component to access notification context actions for the demo.
 */
function DemoControls() {
  const { loadNotifications } = useNotifications();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          backgroundColor: '#ffffff',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        onClick={loadNotifications}
        title="Sync latest notifications from backend"
      >
        🔄 Refresh Inbox
      </button>
    </div>
  );
}

/**
 * Main application component providing live demonstration of SWEEP features:
 * - Real-time Notification Bell & Dropdown
 * - Role-Based Dashboards (Household, Collector, Company, Admin)
 * - Notification Simulation Triggers for live demonstration
 */
function AppContent() {
  const [activeRole, setActiveRole] = useState('household');
  const [localAlerts, setLocalAlerts] = useState([]);

  const addDemoAlert = (type, title, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      category: type.toUpperCase(),
      priority: type === 'Security' ? 'Critical' : 'Important',
      title,
      message,
      body: message,
      is_read: false,
      created_at: new Date().toISOString(),
      actions: [
        { label: 'View Details', action: 'VIEW_DETAILS' },
      ],
    };

    setLocalAlerts((prev) => [newAlert, ...prev]);

    // Dispatch a browser-level synthetic event so NotificationContext or UI catches it
    window.dispatchEvent(new CustomEvent('sweep:demo-notification', { detail: newAlert }));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb',
    }}
    >
      {/* Top Navbar */}
      <header
        style={{
          backgroundColor: '#15803d',
          color: '#ffffff',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{
            margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em',
          }}
          >
            SWEEP
          </h1>
          <span style={{
            fontSize: '12px', opacity: 0.9, backgroundColor: '#166534', padding: '3px 8px', borderRadius: '4px',
          }}
          >
            Live Feature Demo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <DemoControls />
          <NotificationBell />
        </div>
      </header>

      {/* Role Navigation Bar */}
      <nav
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '8px 24px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <span style={{
          fontSize: '13px', color: '#6b7280', fontWeight: 600, marginRight: '8px',
        }}
        >
          Role View:
        </span>
        {[
          { key: 'household', label: '🏠 Household' },
          { key: 'collector', label: '🚚 Collector' },
          { key: 'company', label: '🏭 Recycling Company' },
          { key: 'admin', label: '⚙️ Admin' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: activeRole === tab.key ? '1px solid #15803d' : '1px solid transparent',
              backgroundColor: activeRole === tab.key ? '#f0fdf4' : 'transparent',
              color: activeRole === tab.key ? '#15803d' : '#4b5563',
              cursor: 'pointer',
            }}
            onClick={() => setActiveRole(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Demonstration Banner with Action Triggers */}
      <div
        style={{
          maxWidth: '1100px',
          width: '100%',
          margin: '20px auto 0',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dcfce7',
            borderRadius: '8px',
            padding: '16px 20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#166534' }}>
                ⚡ Test Live Notifications in Browser
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                Click a button below to simulate receiving an alert.
                Watch the 🔔 bell icon update in real time!
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => addDemoAlert('Pickup', 'Pickup Accepted', 'Collector Rahim accepted your plastic waste pickup.')}
              >
                + Pickup Alert
              </button>

              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => addDemoAlert('Order', 'Order In Transit', 'Bulk waste lot #401 is being transported to Bengal Recycling.')}
              >
                + Order Alert
              </button>

              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#eab308',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => addDemoAlert('Payment', 'Payment Received', '850.00 BDT credited to your wallet for Lot #401.')}
              >
                + Payment Alert
              </button>

              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => addDemoAlert('Security', 'Security Notice', 'New login detected from a new IP address.')}
              >
                + Security Alert
              </button>
            </div>
          </div>

          {localAlerts.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <div style={{
                fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px',
              }}
              >
                Latest Triggered Alerts (
                {localAlerts.length}
                ):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {localAlerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      fontSize: '12px',
                      backgroundColor: '#f8fafc',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${a.type === 'Security' ? '#ef4444' : '#22c55e'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      <strong>
                        [
                        {a.type}
                        ]
                      </strong>
                      {' '}
                      {a.title}
                      {' '}
                      —
                      {' '}
                      {a.message}
                    </span>
                    <span style={{ color: '#9ca3af' }}>just now</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '20px auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {activeRole === 'household' && <HouseholdDashboard />}
          {activeRole === 'collector' && <CollectorDashboard />}
          {activeRole === 'company' && <CompanyDashboard />}
          {activeRole === 'admin' && <AdminDashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        SWEEP — Smart Waste Exchange &amp; Eco Platform · CSE-404 Demonstration
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider userId={1}>
      <AppContent />
    </NotificationProvider>
  );
}
