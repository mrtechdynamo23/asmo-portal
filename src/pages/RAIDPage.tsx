import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon, Search, Filter, ShieldAlert,
  AlertTriangle, ChevronRight, CheckCircle2, Shield
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataTable, Column } from '../components/DataTable';
import { RAIDRecord, RAIDType, Priority } from '../types';

export const RAIDPage: React.FC = () => {
  const { raidRecords, workOrders } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalCount = raidRecords.length;
  const criticalCount = raidRecords.filter(r => ['Critical', 'High'].includes(r.severity)).length;
  const risksCount = raidRecords.filter(r => r.type === 'Risk').length;
  const issuesCount = raidRecords.filter(r => r.type === 'Issue').length;

  const filteredRecords = useMemo(() => {
    return raidRecords.filter(r => {
      const matchesSearch =
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.mitigationPlan && r.mitigationPlan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'All' || r.type === typeFilter;
      const matchesSeverity = severityFilter === 'All' || r.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [raidRecords, searchTerm, typeFilter, severityFilter, statusFilter]);

  const columns: Column<RAIDRecord>[] = [
    {
      key: 'type',
      label: 'RAID Type',
      sortable: true,
      render: (r) => (
        <span className={`badge ${r.type === 'Risk' ? 'badge-danger' : r.type === 'Issue' ? 'badge-warning' : r.type === 'Assumption' ? 'badge-info' : 'badge-default'}`}>
          {r.type}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Item Description & Mitigation',
      sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-brand-dark)', fontSize: '0.875rem' }}>
            {r.description}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', maxWidth: '380px' }}>
            <strong>Mitigation:</strong> {r.mitigationPlan || 'Active monitoring and SLA controls.'}
          </div>
        </div>
      )
    },
    {
      key: 'workOrderId',
      label: 'Work Order',
      sortable: true,
      render: (r) => {
        const wo = workOrders.find(w => w.id === r.workOrderId);
        return (
          <div>
            <Link
              to={`/control-tower/${r.workOrderId}?tab=raid`}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {r.workOrderId}
            </Link>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {wo?.title}
            </div>
          </div>
        );
      }
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (r) => (
        <span className={`badge ${r.severity === 'Critical' ? 'badge-danger' : r.severity === 'High' ? 'badge-warning' : 'badge-default'}`}>
          {r.severity}
        </span>
      )
    },
    {
      key: 'impact',
      label: 'Impact Scope',
      sortable: true,
      render: (r) => <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{r.impact}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) => (
        <span className="badge badge-default">
          {r.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'center',
      render: (r) => (
        <Link
          to={`/control-tower/${r.workOrderId}?tab=raid`}
          className="btn btn-sm btn-ghost"
          style={{ padding: '2px 6px' }}
          title="Inspect Work Order RAID"
        >
          <ChevronRight size={14} />
        </Link>
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
                  Risk & Governance
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Enterprise RAID Register
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Centralized registry for Risks, Assumptions, Issues, and Dependencies across portfolio Work Orders.
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total RAID Items
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>{totalCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Registered governance items</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase' }}>
                Critical / High Items
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '0.25rem' }}>{criticalCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-danger)' }}>Requiring executive mitigation</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--asmo-primary)', textTransform: 'uppercase' }}>
                Active Risks
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--asmo-primary)', marginTop: '0.25rem' }}>{risksCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Anticipated threats to delivery</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                Open Issues
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>{issuesCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Active blockers under triage</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 340px', minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by description, mitigation, or Work Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.75rem', width: '100%', height: '44px', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="select"
                style={{ fontSize: '0.875rem', height: '44px' }}
              >
                <option value="All">All Types</option>
                <option value="Risk">Risk</option>
                <option value="Issue">Issue</option>
                <option value="Assumption">Assumption</option>
                <option value="Dependency">Dependency</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="select"
                style={{ fontSize: '0.875rem', height: '44px' }}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            title="Portfolio RAID Log"
            subtitle={`Risk, assumption, issue, and dependency tracking across ${filteredRecords.length} records`}
            data={filteredRecords}
            columns={columns}
            pageSize={10}
            exportFilename="asmo-raid-register"
          />
        </main>
      </div>
    </div>
  );
};

export default RAIDPage;
