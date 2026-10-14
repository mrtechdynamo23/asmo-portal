import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Layers, Clock, AlertTriangle, ShieldCheck, CheckCircle2,
  DollarSign, Activity, FileCheck, AlertOctagon, TrendingUp,
  ArrowRight, PlusCircle, PauseCircle, ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { KPICard } from '../components/KPICard';

const STATUS_COLORS: Record<string, string> = {
  'Draft': '#78716C',
  'Submitted': '#4F46E5',
  'Qualified': '#7C3AED',
  'SoW Issued': '#9333EA',
  'Proposal Submitted': '#0284C7',
  'Under Review': '#0369A1',
  'Revision Required': '#D97706',
  'Approved': '#16A34A',
  'Authorised': '#059669',
  'Discovery': '#2563EB',
  'Design': '#6D28D9',
  'Build': '#A21C20',
  'Validate': '#0891B2',
  'Deploy': '#4338CA',
  'Stabilise': '#0D9488',
  'Closed': '#4B5563',
  'Cancelled': '#DC2626',
  'Rejected': '#991B1B',
};

const PHASE_COLORS: Record<string, string> = {
  'Demand Initiation': '#4F46E5',
  'Proposal & Review': '#0284C7',
  'Authorisation Gate': '#059669',
  'Active Execution': '#A21C20',
  'Validation & Deploy': '#0891B2',
  'Closed & Inactive': '#4B5563',
};

export const ControlTowerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, milestones, deliverables, raidRecords, reviewTasks } = useStore();

  // Metrics
  const totalCount = workOrders.length;
  const inProgressCount = workOrders.filter(w =>
    ['Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise'].includes(w.lifecycleStatus)
  ).length;

  const pendingApprovalsCount = workOrders.filter(w =>
    ['Submitted', 'Under Review', 'Proposal Submitted'].includes(w.lifecycleStatus)
  ).length;

  const overdueMilestonesCount = milestones.filter(m => m.isOverdue || m.status === 'Overdue').length;

  const atRiskCount = workOrders.filter(w => w.riskHealth === 'Red' || w.riskHealth === 'Amber').length;

  const deliverablesAwaitingCount = deliverables.filter(d =>
    ['Submitted', 'Under Review'].includes(d.reviewStatus)
  ).length;

  const onHoldCount = workOrders.filter(w => w.isOnHold).length;

  // Chart 1: Top 7 Business Units by Spend + Other (Clean Horizontal Layout, NO Overlapping Text)
  const topSpendByBU = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of workOrders) {
      const bu = w.requestingBusinessUnit || 'Operations';
      map[bu] = (map[bu] || 0) + (w.proposedValue || 0);
    }
    const sorted = Object.entries(map)
      .map(([name, val]) => ({ name, spendM: Number((val / 1000000).toFixed(2)) }))
      .sort((a, b) => b.spendM - a.spendM);

    const top7 = sorted.slice(0, 7);
    const others = sorted.slice(7);
    if (others.length > 0) {
      const othersSpend = others.reduce((acc, curr) => acc + curr.spendM, 0);
      top7.push({ name: 'Other BUs (' + others.length + ')', spendM: Number(othersSpend.toFixed(2)) });
    }
    return top7;
  }, [workOrders]);

  // Chart 2: Grouped 6 Core Lifecycle Governance Phases (Clean Legible Horizontal X-Axis)
  const groupedPhaseDist = useMemo(() => {
    const phases = [
      { name: 'Initiation', full: 'Demand Initiation', statuses: ['Draft', 'Submitted', 'Qualified'] },
      { name: 'Review & SOW', full: 'Proposal & Review', statuses: ['SoW Issued', 'Proposal Submitted', 'Under Review', 'Revision Required'] },
      { name: 'Authorisation', full: 'Authorisation Gate', statuses: ['Approved', 'Authorised'] },
      { name: 'Execution', full: 'Active Execution', statuses: ['Discovery', 'Design', 'Build'] },
      { name: 'Validate & Deploy', full: 'Validation & Deploy', statuses: ['Validate', 'Deploy', 'Stabilise'] },
      { name: 'Closed', full: 'Closed & Inactive', statuses: ['Closed', 'Cancelled', 'Rejected'] },
    ];

    return phases.map(p => {
      const count = workOrders.filter(w => p.statuses.includes(w.lifecycleStatus)).length;
      return {
        name: p.name,
        fullName: p.full,
        count,
        color: PHASE_COLORS[p.full] || 'var(--asmo-primary)',
        statuses: p.statuses
      };
    });
  }, [workOrders]);

  // 18 Detailed Status Counts for Interactive Filter Bar
  const status18Counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of workOrders) {
      map[w.lifecycleStatus] = (map[w.lifecycleStatus] || 0) + 1;
    }
    return map;
  }, [workOrders]);

  // Chart 3: RAID Severity Distribution
  const raidSeverityDist = useMemo(() => {
    const map: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const r of raidRecords) {
      if (r.severity && map[r.severity] !== undefined) {
        map[r.severity] = (map[r.severity] || 0) + 1;
      }
    }
    return [
      { name: 'Critical', value: map.Critical, color: '#DC2626' },
      { name: 'High', value: map.High, color: '#EA580C' },
      { name: 'Medium', value: map.Medium, color: '#D97706' },
      { name: 'Low', value: map.Low, color: '#2563EB' },
    ];
  }, [raidRecords]);

  const totalRAIDCount = raidRecords.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Top Title Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  Work Order Control Tower Dashboard
                </h1>
                <span className="badge badge-primary">Operational Portfolio</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Live operational intelligence across {totalCount} Work Orders. Reference date: 14 October 2026.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/control-tower/new')}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={15} />
                <span>Initiate Work Order</span>
              </button>

              <button
                onClick={() => navigate('/control-tower')}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={15} />
                <span>View Full Register</span>
              </button>
            </div>
          </div>

          {/* Clean KPI Tiles (All 7 cards fit on the same line) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: '0.625rem',
              marginBottom: '1.75rem',
              width: '100%',
            }}
          >
            <KPICard
              title="Total Work Orders"
              value={totalCount}
              subtitle="All registered orders"
              icon={Layers}
              onClick={() => navigate('/control-tower?status=All')}
            />

            <KPICard
              title="In Active Execution"
              value={inProgressCount}
              subtitle="Discovery through Stabilise"
              icon={Activity}
              onClick={() => navigate('/control-tower?status=Execution+%26+Delivery')}
            />

            <KPICard
              title="Pending Reviews"
              value={pendingApprovalsCount}
              subtitle="Awaiting governance gates"
              icon={Clock}
              status="warning"
              onClick={() => navigate('/control-tower?status=Review+%26+Approval')}
            />

            <KPICard
              title="Overdue Milestones"
              value={overdueMilestonesCount}
              subtitle="Past target completion"
              icon={AlertTriangle}
              status={overdueMilestonesCount > 0 ? 'danger' : 'normal'}
              onClick={() => navigate('/milestones')}
            />

            <KPICard
              title="At-Risk Orders"
              value={atRiskCount}
              subtitle="Red & Amber health"
              icon={AlertOctagon}
              status={atRiskCount > 0 ? 'warning' : 'normal'}
              onClick={() => navigate('/control-tower?risk=Red')}
            />

            <KPICard
              title="Awaiting Acceptance"
              value={deliverablesAwaitingCount}
              subtitle="Submitted deliverables"
              icon={FileCheck}
              onClick={() => navigate('/deliverables')}
            />

            <KPICard
              title="On Hold (Overlay)"
              value={onHoldCount}
              subtitle="Preserving states"
              icon={PauseCircle}
              status="warning"
              onClick={() => navigate('/control-tower?status=On+Hold')}
            />
          </div>

          {/* Section 10.2: Charts and Visualizations (Fixed Layout, Zero Overlapping Text) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Chart 1: Committed Portfolio Value by Business Unit (Horizontal Bar Chart with Perfect Readability) */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                    Committed Portfolio Value by Business Unit
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Amounts in SAR Millions (Top Business Units)
                  </div>
                </div>
              </div>

              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topSpendByBU}
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      unit="M"
                      tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      tick={{ fontSize: 11, fill: 'var(--color-text)' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`SAR ${val}M`, 'Committed Value']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar
                      dataKey="spendM"
                      fill="var(--asmo-primary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: RAID Register Severity Profile (Clean Donut with Dedicated Legend, NO Criss-Crossing Lines) */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                    RAID Register Severity Profile
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Total: {totalRAIDCount} Governance Items Logged
                  </div>
                </div>
              </div>

              <div style={{ height: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={raidSeverityDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      label={false}
                    >
                      {raidSeverityDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} Items`, `${name} Severity`]}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Metric */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-dark)', lineHeight: 1 }}>
                    {totalRAIDCount}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>
                    RAID Items
                  </div>
                </div>
              </div>

              {/* Clean Legend Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                {raidSeverityDist.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Core Governance Lifecycle Phases (Clean, Well-Spaced, Legible) */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                  Work Orders Across 6 Governance Lifecycle Phases
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Total: {totalCount} Work Orders across 18 canonical stages + {onHoldCount} On-Hold Overlays
                </div>
              </div>
              <button
                onClick={() => navigate('/control-tower')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Open Full Register</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupedPhaseDist} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [`${val} Work Orders`, item?.payload?.fullName || 'Phase']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {groupedPhaseDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive 18-Stage Status Grid Below */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                Detailed Canonical 18-Stage Status Breakdown:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(STATUS_COLORS).map(([status, color]) => {
                  const count = status18Counts[status] || 0;
                  return (
                    <button
                      key={status}
                      onClick={() => navigate(`/control-tower?status=${encodeURIComponent(status)}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = color;
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{status}</span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: count > 0 ? color : 'var(--color-text-muted)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ControlTowerDashboard;
