import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Milestone as MilestoneIcon, Search, Filter, Calendar,
  CheckCircle2, AlertTriangle, Clock, ChevronRight, Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataTable, Column } from '../components/DataTable';
import { Milestone } from '../types';

export const MilestonesPage: React.FC = () => {
  const { milestones, workOrders, updateMilestone } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const totalCount = milestones.length;
  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const inProgressCount = milestones.filter(m => m.status === 'In Progress').length;
  const overdueCount = milestones.filter(m => m.status === 'Overdue').length;

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.workOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPhase = phaseFilter === 'All' || m.phase === phaseFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

      return matchesSearch && matchesPhase && matchesStatus;
    });
  }, [milestones, searchTerm, phaseFilter, statusFilter]);

  const columns: Column<Milestone>[] = [
    {
      key: 'name',
      label: 'Milestone & Description',
      sortable: true,
      render: (m) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-brand-dark)', fontSize: '0.875rem' }}>
            {m.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {m.description}
          </div>
        </div>
      )
    },
    {
      key: 'workOrderId',
      label: 'Work Order',
      sortable: true,
      render: (m) => {
        const wo = workOrders.find(w => w.id === m.workOrderId);
        return (
          <div>
            <Link
              to={`/control-tower/${m.workOrderId}?tab=plan-milestones`}
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              {m.workOrderId}
            </Link>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {wo?.title}
            </div>
          </div>
        );
      }
    },
    {
      key: 'phase',
      label: 'Phase',
      sortable: true,
      render: (m) => <span className="badge badge-default">{m.phase}</span>
    },
    {
      key: 'plannedEndDate',
      label: 'Planned Schedule',
      sortable: true,
      render: (m) => (
        <div style={{ fontSize: '0.75rem' }}>
          <div>{m.plannedStartDate} → {m.plannedEndDate}</div>
          {m.status === 'Overdue' && (
            <div style={{ color: '#B42318', fontWeight: 700, fontSize: '0.6875rem' }}>
              6 Days Overdue (Ref: 14 Oct 2026)
            </div>
          )}
        </div>
      )
    },
    {
      key: 'completionPercentage',
      label: 'Progress',
      sortable: true,
      render: (m) => (
        <div style={{ minWidth: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 600, marginBottom: '2px' }}>
            <span>{m.completionPercentage}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${m.completionPercentage}%`,
                height: '100%',
                backgroundColor: m.completionPercentage === 100 ? 'var(--color-success)' : m.status === 'Overdue' ? '#B42318' : 'var(--color-primary)'
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (m) => (
        <span className={`badge ${m.status === 'Completed' ? 'badge-success' : m.status === 'Overdue' ? 'badge-danger' : m.status === 'In Progress' ? 'badge-info' : 'badge-default'}`}>
          {m.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'center',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          {m.status !== 'Completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateMilestone(m.id, { completionPercentage: 100, status: 'Completed', actualEndDate: '2026-10-14' });
              }}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
            >
              Mark Done
            </button>
          )}
          <Link
            to={`/control-tower/${m.workOrderId}?tab=plan-milestones`}
            className="btn btn-sm btn-ghost"
            style={{ padding: '2px 6px' }}
            title="Open Details"
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
                  Delivery Management
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Enterprise Milestones Register
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Delivery milestones schedule, progress tracking, and delay indicators across all active Work Orders.
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Milestones
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>{totalCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Across 40 Work Orders</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                Completed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>{completedCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{Math.round((completedCount / (totalCount || 1)) * 100)}% completion rate</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--asmo-primary)', textTransform: 'uppercase' }}>
                In Progress
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--asmo-primary)', marginTop: '0.25rem' }}>{inProgressCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Active delivery phases</div>
            </div>

            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase' }}>
                Overdue Milestones
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '0.25rem' }}>{overdueCount}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-danger)' }}>Breached relative to 14 Oct 2026</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 360px', minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by milestone name, ID, or Work Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.75rem', width: '100%', height: '44px', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Phase:</span>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="select"
                style={{ fontSize: '0.875rem', height: '44px' }}
              >
                <option value="All">All Phases</option>
                <option value="Initiation">Initiation</option>
                <option value="Discovery">Discovery</option>
                <option value="Design">Design</option>
                <option value="Build">Build</option>
                <option value="Validate">Validate</option>
                <option value="Deploy">Deploy</option>
                <option value="Stabilize & Close">Stabilize & Close</option>
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
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Overdue">Overdue</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            title="Portfolio Milestones Schedule"
            subtitle={`Delivery timeline across ${filteredMilestones.length} tracked milestones`}
            data={filteredMilestones}
            columns={columns}
            pageSize={10}
            exportFilename="asmo-milestones-register"
          />
        </main>
      </div>
    </div>
  );
};

export default MilestonesPage;
