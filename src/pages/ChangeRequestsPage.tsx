import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GitPullRequest, Search, Filter, CheckCircle2,
  AlertTriangle, DollarSign, Clock, ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataTable, Column } from '../components/DataTable';
import { ChangeRequest, ChangeRequestStatus } from '../types';

export const ChangeRequestsPage: React.FC = () => {
  const { changeRequests, workOrders, reviewChangeRequest } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalCount = changeRequests.length;
  const approvedCount = changeRequests.filter(c => c.status === 'Approved').length;
  const pendingCount = changeRequests.filter(c => c.status === 'Raised').length;
  const totalImpactSAR = changeRequests
    .filter(c => c.status === 'Approved')
    .reduce((acc, c) => acc + (c.commercialImpact || 0), 0);

  const filteredCRs = useMemo(() => {
    return changeRequests.filter(c => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.changeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.businessJustification && c.businessJustification.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [changeRequests, searchTerm, statusFilter]);

  const columns: Column<ChangeRequest>[] = [
    {
      key: 'id',
      label: 'CR ID',
      sortable: true,
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
          {c.id}
        </span>
      )
    },
    {
      key: 'changeDescription',
      label: 'Change Description & Justification',
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-brand-dark)', fontSize: '0.875rem' }}>
            {c.changeDescription}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', maxWidth: '360px' }}>
            {c.businessJustification}
          </div>
        </div>
      )
    },
    {
      key: 'workOrderId',
      label: 'Work Order',
      sortable: true,
      render: (c) => {
        const wo = workOrders.find(w => w.id === c.workOrderId);
        return (
          <div>
            <Link
              to={`/control-tower/${c.workOrderId}?tab=activity-audit`}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {c.workOrderId}
            </Link>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {wo?.title}
            </div>
          </div>
        );
      }
    },
    {
      key: 'scheduleImpact',
      label: 'Schedule Impact',
      sortable: true,
      render: (c) => <span style={{ fontSize: '0.75rem' }}>{c.scheduleImpact}</span>
    },
    {
      key: 'commercialImpact',
      label: 'Cost Impact',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem' }}>
          SAR {c.commercialImpact.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c) => (
        <span className={`badge ${c.status === 'Approved' ? 'badge-success' : c.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
          {c.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'center',
      render: (c) => (
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          {c.status === 'Raised' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reviewChangeRequest(c.id, 'Approved', 'Approved via Change Requests module.');
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.6875rem', padding: '2px 6px', color: '#059669' }}
              >
                Approve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reviewChangeRequest(c.id, 'Rejected', 'Rejected via Change Requests module.');
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.6875rem', padding: '2px 6px', color: '#B42318' }}
              >
                Reject
              </button>
            </>
          )}
          <Link
            to={`/control-tower/${c.workOrderId}?tab=activity-audit`}
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
                  Baseline Governance
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Enterprise Change Request Register
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Manage scope, schedule, and commercial change requests with formal audit baseline preservation.
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Change Requests
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Registered contractual changes</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                Approved CRs
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>{approvedCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Baselines updated with audit trail</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                Pending Board Review
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.6875rem', color: '#D97706' }}>Awaiting governance decision</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Approved Net Commercial Impact
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                SAR {totalImpactSAR.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Accumulated scope cost adjustments</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by CR ID, description, justification, or Work Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.25rem', width: '100%', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
                style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Raised">Raised</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            title="Change Request (CR) Register"
            subtitle={`Scope, schedule, and commercial variations across ${filteredCRs.length} change requests`}
            data={filteredCRs}
            columns={columns}
            pageSize={10}
            exportFilename="asmo-change-requests-register"
          />
        </main>
      </div>
    </div>
  );
};

export default ChangeRequestsPage;
