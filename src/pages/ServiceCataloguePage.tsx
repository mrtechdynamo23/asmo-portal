import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, PlusCircle, ArrowRight, ShieldCheck, Clock,
  FileCheck, Layers, Sparkles
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const ServiceCataloguePage: React.FC = () => {
  const navigate = useNavigate();
  const { serviceDefinitions, workOrders } = useStore();

  const handleUseTemplate = (serviceId: string) => {
    navigate(`/control-tower/new?serviceId=${serviceId}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                  Standard Service Catalogue
                </h1>
                <span className="badge badge-info">
                  {serviceDefinitions.length} Pre-configured Services
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Standardized service templates with pre-defined scope boundaries, mandated deliverables, and multi-disciplinary governance review requirements.
              </p>
            </div>

            <Link to="/control-tower/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
              <PlusCircle size={16} />
              <span>Initiate Custom Demand</span>
            </Link>
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {serviceDefinitions.map((svc) => {
              const activeCount = workOrders.filter(w => w.serviceCategoryId === svc.id).length;
              return (
                <div
                  key={svc.id}
                  className="card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                        {svc.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        {activeCount} active orders
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: '0 0 0.5rem 0' }}>
                      {svc.name}
                    </h3>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {svc.description}
                    </p>

                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Scope Template
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
                        {svc.scopeTemplate}
                      </div>
                    </div>

                    {/* Standard Deliverables Chips */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                        Mandated Deliverables ({svc.standardDeliverables.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {svc.standardDeliverables.slice(0, 4).map((deliv, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontSize: '0.6875rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 500
                            }}
                          >
                            {deliv}
                          </span>
                        ))}
                        {svc.standardDeliverables.length > 4 && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', padding: '2px 4px' }}>
                            +{svc.standardDeliverables.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Required Reviewers */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                        Mandatory Review Gates
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {svc.requiredReviewers.map((rev, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#F3E8FF',
                              color: '#7E22CE',
                              fontSize: '0.6875rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 500
                            }}
                          >
                            {rev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {svc.indicativeDuration}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUseTemplate(svc.id)}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
                  >
                    <span>Initiate with this Template</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
