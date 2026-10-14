import React from 'react';
import { LifecycleStatus } from '../types';

interface StatusBadgeProps {
  status: LifecycleStatus;
  isOnHold?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOnHold, className = '' }) => {
  const getBadgeClass = (s: LifecycleStatus) => {
    switch (s) {
      case 'Draft':
        return 'badge-draft';
      case 'Submitted':
        return 'badge-submitted';
      case 'Qualified':
        return 'badge-qualified';
      case 'SoW Issued':
        return 'badge-sow-issued';
      case 'Proposal Submitted':
        return 'badge-proposal-submitted';
      case 'Under Review':
        return 'badge-under-review';
      case 'Revision Required':
        return 'badge-revision-required';
      case 'Approved':
        return 'badge-approved';
      case 'Authorised':
        return 'badge-authorised';
      case 'Discovery':
        return 'badge-discovery';
      case 'Design':
        return 'badge-design';
      case 'Build':
        return 'badge-build';
      case 'Validate':
        return 'badge-validate';
      case 'Deploy':
        return 'badge-deploy';
      case 'Stabilise':
        return 'badge-stabilise';
      case 'Closed':
        return 'badge-closed';
      case 'Cancelled':
        return 'badge-cancelled';
      case 'Rejected':
        return 'badge-rejected';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className={`status-badge-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <span className={`badge ${getBadgeClass(status)}`}>
        <span className="badge-dot" />
        {status}
      </span>
      {isOnHold && (
        <span className="badge badge-on-hold" title="Work order execution is temporarily paused">
          <span className="badge-dot" style={{ backgroundColor: '#D97706' }} />
          ON HOLD
        </span>
      )}
    </div>
  );
};
