import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeClass = (p: Priority) => {
    switch (p) {
      case 'Critical':
        return 'badge-priority-critical';
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(priority)}`}>
      {priority}
    </span>
  );
};
