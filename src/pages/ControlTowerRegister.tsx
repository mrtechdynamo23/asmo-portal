import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Layers, PlusCircle, Search, Filter, RotateCcw, LayoutGrid,
  List, ShieldAlert, ArrowUpDown, ChevronRight, CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { RiskBadge } from '../components/RiskBadge';
import { WorkOrder, Priority, RiskHealth } from '../types';

type ViewMode = 'table' | 'kanban' | 'risk';

export const ControlTowerRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workOrders, users, serviceDefinitions } = useStore();

  const urlStatus = searchParams.get('status') || 'All';
  const urlRisk = searchParams.get('risk') || 'All';
  const urlView = (searchParams.get('view') as ViewMode) || 'table';

  const [selectedPipelineTab, setSelectedPipelineTab] = useState<string>(urlStatus);
  const [selectedBU, setSelectedBU] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>(urlRisk);
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>(urlView);

  // Business Units list
  const businessUnits = useMemo(() => {
    const bus = new Set(workOrders.map(w => w.requestingBusinessUnit));
    return ['All', ...Array.from(bus).sort()];
  }, [workOrders]);

  // Filtered dataset
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Pipeline tab
      if (selectedPipelineTab === 'On Hold') {
        if (!wo.isOnHold) return false;
      } else if (selectedPipelineTab === 'Initiation & Qualification') {
        if (!['Draft', 'Submitted', 'Qualified', 'SoW Issued'].includes(wo.lifecycleStatus)) return false;
      } else if (selectedPipelineTab === 'Review & Approval') {
        if (!['Proposal Submitted', 'Under Review', 'Revision Required', 'Approved', 'Authorised'].includes(wo.lifecycleStatus)) return false;
      } else if (selectedPipelineTab === 'Execution & Delivery') {
        if (!['Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise'].includes(wo.lifecycleStatus)) return false;
      } else if (selectedPipelineTab === 'Closed & Settled') {
        if (!['Closed', 'Cancelled', 'Rejected'].includes(wo.lifecycleStatus)) return false;
      } else if (selectedPipelineTab !== 'All') {
        if (wo.lifecycleStatus !== selectedPipelineTab) return false;
      }

      if (selectedBU !== 'All' && wo.requestingBusinessUnit !== selectedBU) return false;
      if (selectedPriority !== 'All' && wo.priority !== selectedPriority) return false;
      if (selectedRisk !== 'All' && wo.riskHealth !== selectedRisk) return false;
      if (selectedModel !== 'All' && wo.commercialModel !== selectedModel) return false;

      return true;
    });
  }, [workOrders, selectedPipelineTab, selectedBU, selectedPriority, selectedRisk, selectedModel]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedPipelineTab('All');
    setSelectedBU('All');
    setSelectedPriority('All');
    setSelectedRisk('All');
    setSelectedModel('All');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedPipelineTab !== 'All' ||
    selectedBU !== 'All' ||
    selectedPriority !== 'All' ||
    selectedRisk !== 'All' ||
    selectedModel !== 'All';

  // Columns definition for DataTable
  const columns: Column<WorkOrder>[] = [
    {
      key: 'id',
      label: 'WO ID',
      width: '160px',
      render: (wo) => (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: 'var(--asmo-primary)',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          letterSpacing: '-0.01em',
        }}>
          {wo.id}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title & Summary',
      render: (wo) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '13px' }}>{wo.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {wo.scopeDescription || wo.businessOutcome}
          </div>
        </div>
      ),
    },
    {
      key: 'requestingBusinessUnit',
      label: 'Business Unit',
      render: (wo) => <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{wo.requestingBusinessUnit}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '90px',
      render: (wo) => <PriorityBadge priority={wo.priority} />,
    },
    {
      key: 'lifecycleStatus',
      label: 'Status',
      render: (wo) => <StatusBadge status={wo.lifecycleStatus} isOnHold={wo.isOnHold} />,
    },
    {
      key: 'proposedValue',
      label: 'Value (SAR)',
      align: 'right',
      width: '120px',
      render: (wo) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
          {wo.proposedValue.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'deliveryPhase',
      label: 'Phase',
      render: (wo) => <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{wo.deliveryPhase}</span>,
    },
    {
      key: 'deliveryProgress',
      label: 'Progress',
      width: '120px',
      render: (wo) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${wo.deliveryProgress}%`,
                height: '100%',
                backgroundColor: wo.deliveryProgress === 100 ? 'var(--color-success)' : 'var(--asmo-primary)',
                borderRadius: '3px',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, minWidth: '28px', textAlign: 'right', whiteSpace: 'nowrap' }}>
            {wo.deliveryProgress}%
          </span>
        </div>
      ),
    },
    {
      key: 'riskHealth',
      label: 'Risk',
      align: 'center',
      width: '80px',
      render: (wo) => <RiskBadge risk={wo.riskHealth} />,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Header Title & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  Work Order Register
                </h1>
                <span className="badge badge-primary">
                  {filteredWorkOrders.length} of {workOrders.length}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Single source of truth tracking all 40 Work Orders from demand through hypercare.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/control-tower/new"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={15} />
                <span>Initiate Work Order</span>
              </Link>
            </div>
          </div>

          {/* Pipeline Stage Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1rem',
              overflowX: 'auto',
              paddingBottom: '2px',
            }}
          >
            {[
              { id: 'All', label: 'All Orders', count: workOrders.length },
              { id: 'Initiation & Qualification', label: 'Initiation & Qualification', count: workOrders.filter(w => ['Draft', 'Submitted', 'Qualified', 'SoW Issued'].includes(w.lifecycleStatus)).length },
              { id: 'Review & Approval', label: 'Review & Approval', count: workOrders.filter(w => ['Proposal Submitted', 'Under Review', 'Revision Required', 'Approved', 'Authorised'].includes(w.lifecycleStatus)).length },
              { id: 'Execution & Delivery', label: 'Active Execution', count: workOrders.filter(w => ['Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise'].includes(w.lifecycleStatus)).length },
              { id: 'Closed & Settled', label: 'Closed / Archived', count: workOrders.filter(w => ['Closed', 'Cancelled', 'Rejected'].includes(w.lifecycleStatus)).length },
              { id: 'On Hold', label: '⚠️ On Hold (Overlay)', count: workOrders.filter(w => w.isOnHold).length },
            ].map(tab => {
              const isSelected = selectedPipelineTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPipelineTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--asmo-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--asmo-primary-light)' : 'var(--color-surface)',
                    color: isSelected ? 'var(--asmo-primary)' : 'var(--color-text)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      backgroundColor: isSelected ? 'var(--asmo-primary)' : 'var(--color-bg-alt)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Bar & View Toggles */}
          <div
            className="card"
            style={{
              padding: '10px 16px',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={selectedBU}
                onChange={(e) => setSelectedBU(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
              >
                <option value="All">All Business Units</option>
                {businessUnits.filter(b => b !== 'All').map(bu => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
              >
                <option value="All">All Risks</option>
                <option value="Green">Green Health</option>
                <option value="Amber">Amber Health</option>
                <option value="Red">Red Health</option>
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FFFFFF' }}
              >
                <option value="All">All Commercial Models</option>
                <option value="Lump Sum">Lump Sum</option>
                <option value="Time & Materials">Time & Materials</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--asmo-primary)' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* View Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'var(--color-bg)', padding: '2px', borderRadius: '6px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <List size={13} />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'kanban' ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === 'kanban' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  boxShadow: viewMode === 'kanban' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <LayoutGrid size={13} />
                <span>Kanban</span>
              </button>

              <button
                onClick={() => setViewMode('risk')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: viewMode === 'risk' ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === 'risk' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  boxShadow: viewMode === 'risk' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <ShieldAlert size={13} />
                <span>Risk Matrix</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: DATA TABLE */}
          {viewMode === 'table' && (
            <DataTable<WorkOrder>
              title="Work Order Operational Register"
              subtitle={`Live operational portfolio • Displaying ${filteredWorkOrders.length} of ${workOrders.length} registered orders`}
              columns={columns}
              data={filteredWorkOrders}
              defaultSortField="id"
              defaultSortDir="asc"
              pageSize={10}
              exportFilename={`ASMO-Work-Orders-${new Date().toISOString().split('T')[0]}.csv`}
              searchPlaceholder="Filter table records..."
              onRowClick={(wo) => navigate(`/control-tower/${wo.id}`)}
              emptyMessage="No Work Orders match the selected filters."
            />
          )}

          {/* VIEW MODE 2: KANBAN */}
          {viewMode === 'kanban' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'flex-start' }}>
              {[
                { title: 'Demand & Triage', statuses: ['Draft', 'Submitted', 'Qualified', 'SoW Issued'] },
                { title: 'Proposal & Review', statuses: ['Proposal Submitted', 'Under Review', 'Revision Required'] },
                { title: 'Approval & Release', statuses: ['Approved', 'Authorised'] },
                { title: 'Delivery & Build', statuses: ['Discovery', 'Design', 'Build', 'Validate'] },
                { title: 'Deploy & Close', statuses: ['Deploy', 'Stabilise', 'Closed', 'Cancelled', 'Rejected'] },
              ].map(col => {
                const colOrders = filteredWorkOrders.filter(w => col.statuses.includes(w.lifecycleStatus));
                return (
                  <div key={col.title} className="card" style={{ padding: '12px', backgroundColor: 'var(--color-surface-raised)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid var(--color-border)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>{col.title}</span>
                      <span className="badge badge-default" style={{ fontSize: '10px' }}>{colOrders.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '340px' }}>
                      {colOrders.map(wo => (
                        <div
                          key={wo.id}
                          onClick={() => navigate(`/control-tower/${wo.id}`)}
                          className="card card-hover"
                          style={{
                            padding: '12px',
                            cursor: 'pointer',
                            border: wo.isOnHold ? '1px solid #F59E0B' : '1px solid var(--color-border)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--asmo-primary)' }}>
                              {wo.id}
                            </span>
                            <PriorityBadge priority={wo.priority} />
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px', lineHeight: 1.3 }}>
                            {wo.title}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                            <span>{wo.requestingBusinessUnit}</span>
                            <span style={{ fontWeight: 700 }}>SAR {(wo.proposedValue / 1000).toFixed(0)}k</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge status={wo.lifecycleStatus} isOnHold={wo.isOnHold} />
                            <RiskBadge risk={wo.riskHealth} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 3: RISK MATRIX */}
          {viewMode === 'risk' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {[
                { risk: 'Red', label: 'Critical Risk (Red)', bg: '#FEF2F2', border: '#FECACA', color: '#B42318' },
                { risk: 'Amber', label: 'Moderate Risk (Amber)', bg: '#FFFBEB', border: '#FDE68A', color: '#A66A13' },
                { risk: 'Green', label: 'On Track (Green)', bg: '#ECFDF5', border: '#BBF7D0', color: '#237A52' },
              ].map(tier => {
                const tierOrders = filteredWorkOrders.filter(w => w.riskHealth === tier.risk);
                return (
                  <div key={tier.risk} className="card" style={{ backgroundColor: tier.bg, borderColor: tier.border, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${tier.border}` }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: tier.color, margin: 0 }}>{tier.label}</h3>
                      <span style={{ backgroundColor: '#FFFFFF', color: tier.color, padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        {tierOrders.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                      {tierOrders.map(wo => (
                        <div
                          key={wo.id}
                          onClick={() => navigate(`/control-tower/${wo.id}`)}
                          className="card card-hover"
                          style={{ padding: '12px', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--asmo-primary)' }}>
                              {wo.id}
                            </span>
                            <PriorityBadge priority={wo.priority} />
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{wo.title}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <StatusBadge status={wo.lifecycleStatus} isOnHold={wo.isOnHold} />
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>SAR {wo.proposedValue.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
