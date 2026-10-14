import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: string;
  trend?: number;
  trendPeriod?: string;
  isPositiveGood?: boolean;
  status?: 'normal' | 'warning' | 'danger' | 'success';
  sparklineData?: number[];
  subtitle?: string;
  tooltip?: string;
  onClick?: () => void;
  accentColor?: string;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = '',
  target,
  status = 'normal',
  subtitle,
  tooltip,
  onClick,
  accentColor,
  icon: Icon,
  className = '',
}) => {
  const getTopBorderColor = () => {
    if (status === 'danger') return 'var(--color-danger)';
    if (status === 'warning') return 'var(--color-warning)';
    if (status === 'success') return 'var(--color-success)';
    if (accentColor) return accentColor;
    return 'transparent';
  };

  return (
    <div
      className={`kpi-card ${onClick ? 'interactive' : ''} ${className}`}
      style={{
        padding: '10px 12px',
        minWidth: 0,
        borderTop: status !== 'normal' || accentColor ? `3px solid ${getTopBorderColor()}` : undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {Icon && (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '5px',
                background: 'var(--asmo-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--asmo-primary)',
                flexShrink: 0,
              }}
            >
              <Icon size={12} />
            </div>
          )}
          <span
            className="kpi-title"
            style={{
              fontSize: '10px',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={title}
          >
            {title}
          </span>
        </div>

        {tooltip && (
          <span title={tooltip} style={{ color: 'var(--color-text-muted)', cursor: 'help', flexShrink: 0, marginLeft: '4px' }}>
            <HelpCircle size={12} />
          </span>
        )}
      </div>

      {/* Main Value Row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="kpi-value" style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Footer / Context */}
      {(subtitle || target) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid var(--color-border)',
            fontSize: '10px',
            color: 'var(--color-text-secondary)',
            minWidth: 0,
          }}
        >
          <span
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={subtitle || (target ? `Target: ${target}` : '')}
          >
            {subtitle || (target ? `Target: ${target}` : '')}
          </span>

          {onClick && <ChevronRight size={12} style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', flexShrink: 0 }} />}
        </div>
      )}
    </div>
  );
};
