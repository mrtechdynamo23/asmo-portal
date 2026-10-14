import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, ChevronRight, FileCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataTable, Column } from '../components/DataTable';
import { Deliverable, DeliverableStatus } from '../types';

export const DeliverablesPage: React.FC = () => {
  const { deliverables, workOrders, currentUser, reviewDeliverable } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalCount = deliverables.length;
  const acceptedCount = deliverables.filter(d => d.reviewStatus === 'Accepted').length;
  const pendingCount = deliverables.filter(d => ['Submitted', 'Under Review'].includes(d.reviewStatus)).length;
  const revisionCount = deliverables.filter(d => d.reviewStatus === 'Revision Required').length;

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.reviewerComments && d.reviewerComments.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || d.reviewStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliverables, searchTerm, statusFilter]);

  const columns: Column<Deliverable>[] = [
    {
      key: 'name',
      label: 'Deliverable Title',
      sortable: true,
      render: (d) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-brand-dark)', fontSize: '0.875rem' }}>
            {d.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {d.reviewerComments || 'No reviewer notes.'}
          </div>
        </div>
      )
    },
    {
      key: 'workOrderId',
      label: 'Work Order',
      sortable: true,
      render: (d) => {
        const wo = workOrders.find(w => w.id === d.workOrderId);
        return (
          <div>
            <Link
              to={`/control-tower/${d.workOrderId}?tab=deliverables-testing`}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {d.workOrderId}
            </Link>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {wo?.title}
            </div>
          </div>
        );
      }
    },
    {
      key: 'plannedSubmissionDate',
      label: 'Planned Date',
      sortable: true,
      render: (d) => <span style={{ fontSize: '0.75rem' }}>{d.plannedSubmissionDate}</span>
    },
    {
      key: 'actualSubmissionDate',
      label: 'Actual Date',
      sortable: true,
      render: (d) => <span style={{ fontSize: '0.75rem' }}>{d.actualSubmissionDate || '—'}</span>
    },
    {
      key: 'reviewStatus',
      label: 'Acceptance Status',
      sortable: true,
      render: (d) => (
        <span className={`badge ${d.reviewStatus === 'Accepted' ? 'badge-success' : d.reviewStatus === 'Revision Required' ? 'badge-warning' : d.reviewStatus === 'Submitted' ? 'badge-info' : 'badge-default'}`}>
          {d.reviewStatus}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'center',
      render: (d) => (
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          {d.reviewStatus !== 'Accepted' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                reviewDeliverable(d.id, 'Accepted', 'Deliverable accepted via Deliverables module.');
              }}
              className="btn btn-sm"
              style={{ backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0', padding: '2px 6px', fontSize: '0.6875rem' }}
              title="Accept Deliverable"
            >
              Accept
            </button>
          )}
          <Link
            to={`/control-tower/${d.workOrderId}?tab=deliverables-testing`}
            className="btn btn-sm btn-ghost"
            style={{ padding: '2px 6px' }}
            title="Inspect Work Order"
          >
            <ChevronRight size={14} />
          </Link>
        </div>
      )
    }
  ];

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
                  Quality & Assurance
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Enterprise Deliverables Register
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Deliverables tracking, peer review feedback, and formal business sign-offs across all Work Orders.
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Deliverables
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>{totalCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Registered contractual artifacts</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                Formally Accepted
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>{acceptedCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{Math.round((acceptedCount / (totalCount || 1)) * 100)}% accepted</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--asmo-primary)', textTransform: 'uppercase' }}>
                Under Review / Submitted
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--asmo-primary)', marginTop: '0.25rem' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Awaiting stakeholder review</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase' }}>
                Revision Required
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.25rem' }}>{revisionCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-warning)' }}>Feedback provided to SI</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 360px', minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by deliverable title, ID, or Work Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.75rem', width: '100%', height: '44px', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
                style={{ fontSize: '0.875rem', height: '44px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Accepted">Accepted</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            title="Deliverables & Acceptance Register"
            subtitle={`Governance status across ${filteredDeliverables.length} submitted and pending deliverables`}
            data={filteredDeliverables}
            columns={columns}
            pageSize={10}
            exportFilename="asmo-deliverables-register"
          />
        </main>
      </div>
    </div>
  );
};

export default DeliverablesPage;
