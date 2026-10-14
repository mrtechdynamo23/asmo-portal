import React from 'react';
import { RiskHealth } from '../types';

interface RiskBadgeProps {
  risk: RiskHealth;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  const getBadgeClass = (r: RiskHealth) => {
    switch (r) {
      case 'Red':
        return 'badge-risk-red';
      case 'Amber':
        return 'badge-risk-amber';
      case 'Green':
        return 'badge-risk-green';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(risk)}`}>
      <span className="badge-dot" />
      {risk}
    </span>
  );
};
