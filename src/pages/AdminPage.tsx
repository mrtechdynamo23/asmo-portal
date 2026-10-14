import React, { useState } from 'react';
import {
  Settings, Users, BookOpen, RefreshCw, Shield,
  CheckCircle2, AlertTriangle, Key, Layers, Database
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { User, ServiceDefinition } from '../types';

export const AdminPage: React.FC = () => {
  const {
    users, serviceDefinitions, workOrders, currentUser,
    setCurrentUser, resetToSeedData
  } = useStore();

  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'system'>('users');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all Work Orders, reviews, and audit events back to the canonical 40-record acceptance test dataset?')) {
      resetToSeedData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.75rem 2.25rem', overflowY: 'auto' }}>
          {/* Header Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  System Administration
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Administration & Governance Controls
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Manage the 14 enterprise user personas, 8 catalog service definitions, and deterministic demo fixtures.
              </div>
            </div>

            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
            >
              <RefreshCw size={15} />
              <span>Reset Demo Seed Data</span>
            </button>
          </div>

          {resetSuccess && (
            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              color: '#065F46',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CheckCircle2 size={18} />
              <span>System successfully restored to the canonical 40 Work Orders, 14 users, and 8 service definitions.</span>
            </div>
          )}

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Work Orders
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{workOrders.length}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>40 canonical (2 On Hold overlays)</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Configured Personas
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>{users.length}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>14 distinct enterprise roles</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Service Definitions
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{serviceDefinitions.length}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>8 enterprise catalog services</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Fixed Reference Date
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-brand-dark)', fontFamily: 'var(--font-mono)' }}>
                14 Oct 2026
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Deterministic demo calculation</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            backgroundColor: '#FFFFFF',
            padding: '0 0.5rem',
            borderRadius: '10px 10px 0 0'
          }}>
            {[
              { id: 'users', label: `Users & Roles Directory (${users.length})` },
              { id: 'services', label: `Service Definitions (${serviceDefinitions.length})` },
              { id: 'system', label: 'System Diagnostics & Governance Rules' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-brand-dark)' }}>
                  Enterprise User Directory (14 Canonical Personas)
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Active Persona: <strong>{currentUser.name}</strong> ({currentUser.role})
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>User ID</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Full Name</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Governance Role</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Department</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Email</th>
                      <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Persona Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <tr key={u.id} style={{ backgroundColor: isCurrent ? '#F0FDF4' : 'transparent' }}>
                          <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {u.id}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>
                            {u.name}
                            {isCurrent && (
                              <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.625rem' }}>
                                Active
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem' }}>
                            <span className="badge badge-default">{u.role}</span>
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', color: 'var(--color-text-secondary)' }}>
                            {u.department}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                            {!isCurrent ? (
                              <button
                                onClick={() => setCurrentUser(u)}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                              >
                                Switch To
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 700 }}>
                                Signed In
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE DEFINITIONS */}
          {activeTab === 'services' && (
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                Enterprise Service Catalogue Master Definitions (8 Services)
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Service ID</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Service Name</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>SLA Lead Time</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Default Model</th>
                      <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceDefinitions.map(s => (
                      <tr key={s.id}>
                        <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {s.id}
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{s.name}</td>
                        <td style={{ padding: '0.625rem 0.75rem' }}>
                          <span className="badge badge-default">{s.category}</span>
                        </td>
                        <td style={{ padding: '0.625rem 0.75rem' }}>{s.indicativeDuration}</td>
                        <td style={{ padding: '0.625rem 0.75rem' }}>{s.commercialGuidance}</td>
                        <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
                          {s.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM DIAGNOSTICS */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Acceptance Test Fixtures & Governance Verification
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-dark)', marginBottom: '0.5rem' }}>
                      Canonical Lifecycle Distribution Verification
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      Total Work Orders: <strong>40</strong>
                      <br />
                      On Hold Overlay Count: <strong>2</strong> (WO-ASMO-2026-00122, WO-ASMO-2026-00127)
                      <br />
                      Overlays do not create a 41st status record; prior states preserved.
                      <br />
                      Fixed Deterministic Evaluation Date: <strong>14 October 2026</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-dark)', marginBottom: '0.5rem' }}>
                      Four Golden Records Verification
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      <strong>Record A (WO-ASMO-2026-00128):</strong> Build, Lump Sum, 4 milestones (MS-003 overdue by 6 days), 5 deliverables, 3 RAID, Proposal v1 & v2, Authorised.
                      <br />
                      <strong>Record B (WO-ASMO-2026-00131):</strong> Under Review, Commercial approved, Arch pending, Cyber revision required, not authorised.
                      <br />
                      <strong>Record C (WO-ASMO-2026-00119):</strong> Closed with acceptance, handover, and access-revocation evidence.
                      <br />
                      <strong>Record D (WO-ASMO-2026-00140):</strong> Draft by Business Owner.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
