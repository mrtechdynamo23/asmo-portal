import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useStore();

  // Prefilled demo credentials per Section 7
  const [username, setUsername] = useState('asmo.admin');
  const [password, setPassword] = useState('Asmo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // Log in as Admin or default user
      const adminUser = users.find(u => u.role === 'Admin') || users[0];
      setCurrentUser(adminUser);

      // Section 7 Mandatory Rule: Navigate to Application Home (/home), not directly to dashboard!
      navigate('/home');
    }, 600);
  };

  return (
    <div className="asmo-login-page">
      {/* ── Left Atmosphere Panel: Technical Brand Visual ── */}
      <div className="asmo-login-left">
        {/* Geometric Network Grid SVG */}
        <div className="asmo-login-pattern">
          <svg viewBox="0 0 800 800" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="asmoGridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A21C20" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#A21C20" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[...Array(12)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 70} x2="800" y2={i * 70} stroke="#A21C20" strokeOpacity="0.08" strokeWidth="0.5" />
            ))}
            {[...Array(12)].map((_, i) => (
              <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="800" stroke="#A21C20" strokeOpacity="0.08" strokeWidth="0.5" />
            ))}
            {/* Connection nodes */}
            {[{ x: 140, y: 210 }, { x: 350, y: 140 }, { x: 560, y: 280 }, { x: 280, y: 420 }, { x: 490, y: 490 }, { x: 210, y: 560 }, { x: 420, y: 350 }, { x: 630, y: 420 }].map((pt, i) => (
              <React.Fragment key={`n${i}`}>
                <circle cx={pt.x} cy={pt.y} r="3" fill="#A21C20" opacity="0.6" />
                <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="#A21C20" strokeOpacity="0.3" strokeWidth="0.75" />
              </React.Fragment>
            ))}
            <polyline points="140,210 350,140 560,280 420,350" fill="none" stroke="#A21C20" strokeOpacity="0.2" strokeWidth="0.75" />
            <polyline points="280,420 490,490 630,420 420,350" fill="none" stroke="#A21C20" strokeOpacity="0.2" strokeWidth="0.75" />
            <line x1="350" y1="140" x2="420" y2="350" stroke="#A21C20" strokeOpacity="0.15" strokeWidth="0.75" />
          </svg>
        </div>

        <div className="asmo-login-left-content">
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              marginBottom: '1.5rem',
            }}
          >
            <img src="/brand/asmo-logo.jpg" alt="ASMO Logo" style={{ height: '42px', objectFit: 'contain' }} />
          </div>

          <div
            style={{
              width: '48px',
              height: '3px',
              backgroundColor: 'var(--asmo-primary)',
              borderRadius: '2px',
              marginBottom: '1.25rem',
            }}
          />

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem', lineHeight: 1.25 }}>
            Enterprise Work Order Control Tower
          </h2>

          <p style={{ fontSize: '0.875rem', color: '#D6CFC9', lineHeight: 1.6, maxWidth: '420px', marginBottom: '2rem' }}>
            Unified demand initiation, multi-disciplinary governance reviews, formal Release PO authorization, and milestone delivery management.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#A89E96',
            }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--asmo-primary)' }} />
            <span>Strict multi-role governance & audit compliance</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Authentication Card ── */}
      <div className="asmo-login-right">
        <div className="asmo-login-card">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                marginBottom: '1rem',
              }}
            >
              <img src="/brand/asmo-logo.jpg" alt="ASMO Logo" style={{ height: '28px', objectFit: 'contain' }} />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.25rem 0' }}>
              Sign in to Control Tower
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Enter your corporate credentials to access the ASMO workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '1.25rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                Corporate Username
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    fontSize: '13px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>
            </div>

            {/* Password with Visibility Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Password
                </label>
                <span style={{ fontSize: '11px', color: 'var(--asmo-primary)', fontWeight: 600 }}>
                  Demo Access
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 36px',
                    fontSize: '13px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Single Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Note */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '2px' }}>
              Prefilled Demo Credentials:
            </div>
            Username: <strong style={{ fontFamily: 'var(--font-mono)' }}>asmo.admin</strong> • Password: <strong style={{ fontFamily: 'var(--font-mono)' }}>Asmo@2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
