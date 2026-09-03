/**
 * @fileoverview FR-01 — role picker: household, local/global collector, company.
 * @module AccountTypeSelect
 */

import React from 'react';
import PropTypes from 'prop-types';

const types = [
  {
    id: 'household',
    icon: '🏠',
    title: 'Household',
    description: 'Sell recyclable waste and schedule convenient pickups from your home.',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    cta: 'Register as Household',
  },
  {
    id: 'collector',
    icon: '🚛',
    title: 'Local Collector',
    description: 'Collect waste from households and manage your local inventory and bulk lots.',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    cta: 'Register as Local Collector',
  },
  {
    id: 'global',
    icon: '🚚',
    title: 'Global Collector',
    description: 'Transport aggregated waste lots between collectors and recycling facilities.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    cta: 'Register as Global Collector',
  },
  {
    id: 'company',
    icon: '🏭',
    title: 'Recycling Company',
    description: 'Purchase waste lots from the marketplace and manage recycling procurement.',
    color: '#065f46',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    cta: 'Register as Company',
  },
];

/**
 * Account type picker (FR-01) — household, local/global collector, or company.
 * @param {object} props Component props.
 * @param {Function} props.onSelect Called with the chosen account type id.
 * @param {Function} props.onBack Returns to the login screen.
 * @returns {JSX.Element} The account type selection page.
 */
export default function AccountTypeSelect({ onSelect, onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40,
      }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        >
          <span style={{ fontSize: 18 }}>♻️</span>
        </div>
        <div>
          <div style={{
            fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.3px',
          }}
          >
            SWEEP
          </div>
          <div style={{ fontSize: 10, color: '#10b981', fontWeight: 500 }}>Smart Waste Exchange & Eco Platform</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 860 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{
            margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px',
          }}
          >
            How will you use SWEEP?
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: '#64748b' }}>Choose your account type to get started. You can always add more roles later.</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28,
        }}
        >
          {types.map((t) => (
            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
               jsx-a11y/no-static-element-interactions */
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              style={{
                background: '#fff',
                border: '2px solid #e8eef0',
                borderRadius: 14,
                padding: '24px 26px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.color;
                e.currentTarget.style.background = t.bg;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${t.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e8eef0';
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: t.bg,
                  border: `1.5px solid ${t.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
                >
                  {t.icon}
                </div>
                <div>
                  <div style={{
                    fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 4,
                  }}
                  >
                    {t.title}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>{t.description}</div>
                </div>
              </div>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 9,
                  border: `1.5px solid ${t.color}`,
                  background: 'transparent',
                  color: t.color,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.color; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.color; }}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: '#64748b' }}>
          Already have an account?
          {' '}
          <button
            type="button"
            onClick={onBack}
            style={{
              color: '#065f46', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5,
            }}
          >
            Sign in
          </button>
        </div>
        <div style={{
          textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8',
        }}
        >
          Admin accounts are platform-managed and cannot be registered here.
        </div>
      </div>
    </div>
  );
}

AccountTypeSelect.propTypes = {
  /** Called with the chosen account type. */
  onSelect: PropTypes.func.isRequired,
  /** Returns to the login screen. */
  onBack: PropTypes.func.isRequired,
};
