import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, Download, TrendingUp, Layers, CheckCircle2,
  AlertTriangle, DollarSign, Clock, ShieldCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

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

const RISK_COLORS: Record<string, string> = {
  'Green': '#16A34A',
  'Amber': '#D97706',
  'Red': '#DC2626'
};

const PHASE_COLORS: Record<string, string> = {
  'Pre-Execution': '#78716C',
  'Initiation': '#4F46E5',
  'Discovery': '#2563EB',
  'Design': '#6D28D9',
  'Build': '#A21C20',
  'Validate': '#0891B2',
  'Deploy': '#4338CA',
  'Stabilize & Close': '#0D9488',
  'N/A': '#9CA3AF'
};

export const ReportsDashboard: React.FC = () => {
  const { workOrders } = useStore();

  // 1. Top 7 Business Units by Spend + Others (Clean Horizontal Layout, NO Overlapping Text)
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
      top7.push({ name: `Other BUs (${others.length})`, spendM: Number(othersSpend.toFixed(2)) });
    }
    return top7;
  }, [workOrders]);

  // 2. Count by Delivery Phase
  const countByPhase = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of workOrders) {
      const ph = w.deliveryPhase || 'Pre-Execution';
      map[ph] = (map[ph] || 0) + 1;
    }
    return Object.entries(map).map(([phase, count]) => ({
      phase,
      count,
      color: PHASE_COLORS[phase] || 'var(--asmo-primary)'
    }));
  }, [workOrders]);

  // 3. Grouped Governance Phases for Lifecycle Distribution
  const groupedPhaseDist = useMemo(() => {
    const phases = [
      { name: 'Initiation', full: 'Demand Initiation', statuses: ['Draft', 'Submitted', 'Qualified'] },
      { name: 'Review & SOW', full: 'Proposal & Review', statuses: ['SoW Issued', 'Proposal Submitted', 'Under Review', 'Revision Required'] },
      { name: 'Authorisation', full: 'Authorisation Gate', statuses: ['Approved', 'Authorised'] },
      { name: 'Execution', full: 'Active Execution', statuses: ['Discovery', 'Design', 'Build'] },
      { name: 'Validate & Deploy', full: 'Validation & Deploy', statuses: ['Validate', 'Deploy', 'Stabilise'] },
      { name: 'Closed', full: 'Closed & Terminal', statuses: ['Closed', 'Cancelled', 'Rejected'] },
    ];

    return phases.map(p => {
      const count = workOrders.filter(w => p.statuses.includes(w.lifecycleStatus)).length;
      return {
        name: p.name,
        fullName: p.full,
        count,
        color: STATUS_COLORS[p.statuses[0]] || '#4F46E5',
      };
    });
  }, [workOrders]);

  // 4. Risk Health Distribution
  const riskDist = useMemo(() => {
    const map: Record<string, number> = { 'Green': 0, 'Amber': 0, 'Red': 0 };
    for (const w of workOrders) {
      if (w.riskHealth && map[w.riskHealth] !== undefined) {
        map[w.riskHealth] = (map[w.riskHealth] || 0) + 1;
      }
    }
    return [
      { name: 'Green', value: map.Green, color: RISK_COLORS.Green },
      { name: 'Amber', value: map.Amber, color: RISK_COLORS.Amber },
      { name: 'Red', value: map.Red, color: RISK_COLORS.Red },
    ];
  }, [workOrders]);

  const totalValue = workOrders.reduce((sum, w) => sum + (w.proposedValue || 0), 0);
  const totalApproved = workOrders.reduce((sum, w) => sum + (w.approvedValue || 0), 0);
  const onHoldCount = workOrders.filter(w => w.isOnHold).length;

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Governance & Delivery Analytics
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Executive performance metrics across all {workOrders.length} Work Orders in the ASMO portfolio. Reference date: 14 October 2026.
              </p>
            </div>

            <button
              onClick={handlePrintSummary}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
            >
              <Download size={15} />
              <span>Export Executive Briefing</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Portfolio Value
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                SAR {(totalValue / 1000000).toFixed(1)}M
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Across {workOrders.length} registered orders
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Formally Authorised PO Value
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                SAR {(totalApproved / 1000000).toFixed(1)}M
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Committed through formal Release POs
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Healthy Delivery Ratio
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                {Math.round(((riskDist.find(r => r.name === 'Green')?.value || 0) / (workOrders.length || 1)) * 100)}%
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Green risk health classification
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                On Hold Overlays
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {onHoldCount} Orders
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Underlying execution paused
              </div>
            </div>
          </div>

          {/* Charts Row 1 (Fixed Layout, Zero Overlapping Text) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Chart 1: Spend by Business Unit (Horizontal Bar Chart with Perfect Readability) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                Capital Allocation by Business Unit (SAR Millions)
              </h3>
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
                      formatter={(val: any) => [`SAR ${val}M`, 'Committed Spend']}
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

            {/* Chart 2: Risk Health Distribution (Clean Donut, NO Criss-Crossing Labels) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                Portfolio Risk Health Status
              </h3>
              <div style={{ height: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      label={false}
                    >
                      {riskDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} Orders (${Math.round((val / (workOrders.length || 1)) * 100)}%)`, `${name} Health`]}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-dark)', lineHeight: 1 }}>
                    {workOrders.length}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>
                    Total Orders
                  </div>
                </div>
              </div>

              {/* Clean Legend Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                {riskDist.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}:</span>
                    <strong style={{ color: 'var(--color-text)' }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Chart 3: Count by Delivery Phase */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                Work Orders by Delivery Phase
              </h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countByPhase} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <XAxis dataKey="phase" tick={{ fontSize: 11, fill: 'var(--color-text)' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Work Orders`, 'Phase Volume']}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {countByPhase.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Grouped 6-Phase Lifecycle Distribution (Clean Bars, Replaced Messy 18-slice Pie) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                Governance Pipeline Distribution (40 Work Orders)
              </h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={groupedPhaseDist}
                    margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
                  >
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: 'var(--color-text)' }} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [`${val} Orders`, item?.payload?.fullName || 'Phase']}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Bar dataKey="count" fill="var(--asmo-primary)" radius={[0, 4, 4, 0]}>
                      {groupedPhaseDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsDashboard;
