import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, AlertTriangle, BookOpen, BarChart3, Building,
  DollarSign, Activity, FileCheck, Calendar
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const ApplicationHome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, workOrders, reviewTasks } = useStore();

  const totalCount = workOrders.length;
  const activeWOs = workOrders.filter(w => !['Closed', 'Cancelled'].includes(w.lifecycleStatus));
  const inDeliveryCount = workOrders.filter(w =>
    ['Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise'].includes(w.lifecycleStatus)
  ).length;
  const underReviewCount = workOrders.filter(w =>
    ['Submitted', 'Under Review', 'Proposal Submitted', 'Approved'].includes(w.lifecycleStatus)
  ).length;
  const onHoldCount = workOrders.filter(w => w.isOnHold).length;
  const totalValue = workOrders.reduce((sum, w) => sum + (w.proposedValue || 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
          {/* Welcome & Introduction Banner */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '1.75rem 2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '180px',
                background: 'linear-gradient(to right, transparent, rgba(162, 28, 32, 0.06))',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                    Welcome to ASMO Portal, {currentUser.name}
                  </h1>
                  <span className="badge badge-primary">
                    {currentUser.role}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{currentUser.department}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> Fixed Operational Reference Date: <strong>14 October 2026</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 8: PROMINENT TILE: WORK ORDER CONTROL TOWER ── */}
          <section style={{ marginBottom: '2.5rem' }}>
            <div
              onClick={() => navigate('/control-tower/dashboard')}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '16px',
                border: '2px solid var(--asmo-primary)',
                padding: '2.25rem',
                boxShadow: 'var(--shadow-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(162, 28, 32, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
            >
              {/* Highlight ribbon */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  backgroundColor: 'var(--asmo-primary)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--asmo-primary-light)',
                      color: 'var(--asmo-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(162, 28, 32, 0.15)',
                    }}
                  >
                    <Layers size={36} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                        Work Order Control Tower
                      </h2>
                      <span className="badge badge-success" style={{ fontSize: '11px', padding: '3px 8px' }}>
                        Core Platform
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', maxWidth: '780px', lineHeight: 1.5 }}>
                      Comprehensive multi-tier governance platform for demand initiation, multi-disciplinary review gates, formal Release PO authorization, milestone execution, defect tracking, and hypercare closure.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--asmo-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    backgroundColor: 'var(--asmo-primary-light)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                  }}
                >
                  <span>Open Control Tower Dashboard</span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Live Metric Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1.25rem',
                  backgroundColor: 'var(--color-bg)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Work Orders
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '4px' }}>
                    {activeWOs.length} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {totalCount} total</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    In Active Delivery
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--asmo-primary)', marginTop: '4px' }}>
                    {inDeliveryCount}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Reviews & Approvals
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-info)', marginTop: '4px' }}>
                    {underReviewCount}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    On Hold (Overlay)
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '4px' }}>
                    {onHoldCount}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Portfolio Committed Value
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                    SAR {(totalValue / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Shortcuts to Primary Modules (NO TLM, NO ITSM) */}
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
              Quick Navigation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div
                onClick={() => navigate('/control-tower')}
                className="card card-hover"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Layers size={18} style={{ color: 'var(--asmo-primary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Work Order Register</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Browse, search, sort, and export all 40 Work Orders across lifecycle stages.
                </p>
              </div>

              <div
                onClick={() => navigate('/control-tower/new')}
                className="card card-hover"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building size={18} style={{ color: '#2563EB' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Initiate Work Order</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  6-step guided wizard to create and submit business demand.
                </p>
              </div>

              <div
                onClick={() => navigate('/services')}
                className="card card-hover"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <BookOpen size={18} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Service Catalogue</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  8 pre-configured service definitions with scope templates and required reviewers.
                </p>
              </div>

              <div
                onClick={() => navigate('/reports')}
                className="card card-hover"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <BarChart3 size={18} style={{ color: '#D97706' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Reports & Analytics</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Executive charts, capital spend by BU, and RAID severity distributions.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
