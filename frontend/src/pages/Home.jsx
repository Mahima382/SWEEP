import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

/**
 * Landing page for SWEEP: full-bleed gradient hero with the brand, a
 * headline, and the login form itself in the middle of the page — this is
 * the app's front door, not just marketing copy. Renders outside
 * MainLayout (see AppRoutes.jsx) so nothing else competes with the hero.
 * @returns {JSX.Element} The home page.
 */
function Home() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 12% 18%, rgba(16, 185, 129, 0.28), transparent 42%),
          radial-gradient(circle at 88% 82%, rgba(5, 150, 105, 0.32), transparent 46%),
          radial-gradient(circle at 50% 100%, rgba(4, 120, 87, 0.35), transparent 55%),
          linear-gradient(160deg, #04231a 0%, #063a29 40%, #0b5c3e 75%, #0f6b45 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 72px',
      }}
    >
      {/* Decorative rings, purely cosmetic. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-10%',
          width: 420,
          height: 420,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-16%',
          left: '-12%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
      >
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56,
        }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 11, background: '#a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0,
          }}
          >
            ♻️
          </div>
          <div>
            <div style={{
              fontWeight: 800, fontSize: 19, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2,
            }}
            >
              SWEEP
            </div>
            <div style={{ fontSize: 11.5, color: '#86efac', fontWeight: 500 }}>Smart Waste Exchange &amp; Eco Platform</div>
          </div>
        </div>

        <div style={{
          textAlign: 'center', maxWidth: 640, marginBottom: 48,
        }}
        >
          <h1 style={{
            margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2,
          }}
          >
            Turning waste into value through a smarter circular economy.
          </h1>
          <p style={{
            margin: 0, fontSize: 15.5, color: '#c9f3dd', lineHeight: 1.6,
          }}
          >
            Connect households, collectors, and recyclers on one unified
            platform. Track every kilogram from pickup to processing.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

export default Home;
