// ==========================================================================
// ASMO Work Order Control Tower — Calendar Filter Bar
// ==========================================================================
import React from 'react';
import {
  Filter, RotateCcw, Milestone, PackageCheck, ShieldCheck,
  GitPullRequest, CheckCircle2, Clock
} from 'lucide-react';
import { CalendarEventType } from '../../types/calendar';
import { WorkOrder, User } from '../../types';

interface CalendarFilterBarProps {
  selectedTypes: CalendarEventType[];
  categoryCounts: Record<CalendarEventType, number>;
  selectedWorkOrderId: string;
  selectedOwnerId: string;
  selectedStatus: string;
  workOrders: WorkOrder[];
  users: User[];
  onToggleType: (type: CalendarEventType) => void;
  onWorkOrderChange: (woId: string) => void;
  onOwnerChange: (ownerId: string) => void;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
}

const CATEGORY_CONFIG: {
  type: CalendarEventType;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}[] = [
  { type: 'milestone', label: 'Milestones', icon: Milestone, color: '#A21C20' },
  { type: 'deliverable', label: 'Deliverables', icon: PackageCheck, color: '#0891B2' },
  { type: 'review', label: 'Reviews', icon: Clock, color: '#D97706' },
  { type: 'authorisation', label: 'PO Gates', icon: ShieldCheck, color: '#059669' },
  { type: 'change_request', label: 'CRs', icon: GitPullRequest, color: '#7C3AED' },
  { type: 'closure', label: 'Closures', icon: CheckCircle2, color: '#4B5563' },
];

export const CalendarFilterBar: React.FC<CalendarFilterBarProps> = ({
  selectedTypes,
  categoryCounts,
  selectedWorkOrderId,
  selectedOwnerId,
  selectedStatus,
  workOrders,
  users,
  onToggleType,
  onWorkOrderChange,
  onOwnerChange,
  onStatusChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedWorkOrderId !== 'All' ||
    selectedOwnerId !== 'All' ||
    selectedStatus !== 'All';

  return (
    <div
      className="card"
      style={{
        padding: '0.875rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.875rem',
      }}
    >
      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>
          Categories:
        </span>
        {CATEGORY_CONFIG.map(cat => {
          const isSelected = selectedTypes.includes(cat.type);
          const Icon = cat.icon;
          const count = categoryCounts[cat.type] || 0;

          return (
            <button
              key={cat.type}
              onClick={() => onToggleType(cat.type)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--color-border)',
                backgroundColor: isSelected ? `${cat.color}15` : 'transparent',
                color: isSelected ? cat.color : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={12} style={{ color: cat.color }} />
              <span>{cat.label}</span>
              <span
                style={{
                  backgroundColor: isSelected ? cat.color : 'var(--color-bg-alt)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  marginLeft: '2px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Work Order Selector */}
        <select
          value={selectedWorkOrderId}
          onChange={(e) => onWorkOrderChange(e.target.value)}
          className="select"
          style={{ height: '34px', minHeight: '34px', padding: '4px 8px', fontSize: '11px' }}
        >
          <option value="All">All Work Orders</option>
          {workOrders.map(wo => (
            <option key={wo.id} value={wo.id}>
              {wo.id} — {wo.title.slice(0, 28)}...
            </option>
          ))}
        </select>

        {/* Owner Selector */}
        <select
          value={selectedOwnerId}
          onChange={(e) => onOwnerChange(e.target.value)}
          className="select"
          style={{ height: '34px', minHeight: '34px', padding: '4px 8px', fontSize: '11px' }}
        >
          <option value="All">All Owners</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="select"
          style={{ height: '34px', minHeight: '34px', padding: '4px 8px', fontSize: '11px' }}
        >
          <option value="All">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">⚠️ Overdue</option>
          <option value="On Hold">⏸️ On Hold</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="btn btn-secondary btn-sm"
            style={{
              height: '34px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--color-danger)',
            }}
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
