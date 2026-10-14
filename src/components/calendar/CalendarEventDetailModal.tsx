// ==========================================================================
// ASMO Work Order Control Tower — Calendar Event Detail Modal
// ==========================================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from '../../types/calendar';
import {
  Calendar as CalendarIcon, User, ExternalLink, X,
  AlertTriangle, PauseCircle, CheckCircle2, ShieldCheck,
  Milestone, PackageCheck, Clock, GitPullRequest
} from 'lucide-react';

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const CalendarEventDetailModal: React.FC<CalendarEventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!event) return null;

  const handleNavigateToWorkOrder = () => {
    onClose();
    let tab = 'overview';
    if (event.type === 'milestone') tab = 'plan-milestones';
    if (event.type === 'deliverable') tab = 'deliverables-testing';
    if (event.type === 'review') tab = 'approvals-authorisation';
    if (event.type === 'authorisation') tab = 'approvals-authorisation';
    if (event.type === 'change_request') tab = 'overview';
    if (event.type === 'closure') tab = 'deployment-closure';

    navigate(`/control-tower/${event.workOrderId}?tab=${tab}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          padding: '1.75rem',
          borderRadius: '12px',
          maxWidth: '540px',
          width: '92%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--asmo-primary-light)',
                  color: 'var(--asmo-primary)',
                }}
              >
                {event.type.replace('_', ' ')}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--asmo-primary)',
                }}
              >
                {event.workOrderId}
              </span>
              {event.isOverdue && (
                <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                  <AlertTriangle size={11} style={{ marginRight: '3px' }} /> Overdue
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)', lineHeight: 1.3 }}>
              {event.title}
            </h2>
          </div>

          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Warnings */}
        {event.isOnHold && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
              fontSize: '12px',
              color: '#B45309',
            }}
          >
            <PauseCircle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Parent Work Order is On Hold.</strong> Delivery progression and milestones are currently preserved.
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--color-surface-raised)',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '12px',
          }}
        >
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              Scheduled Date
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
              {event.date} {event.endDate ? `to ${event.endDate}` : ''}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Status
            </div>
            <div style={{ fontWeight: 700, color: 'var(--asmo-primary)', marginTop: '2px' }}>
              {event.status}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              Responsible Owner
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
              {event.ownerName}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
              Work Order Priority
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
              {event.priority || 'Medium'}
            </div>
          </div>
        </div>

        {/* Description / Scope details */}
        {event.description && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Governance Notes & Description
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text)', lineHeight: 1.5, margin: 0 }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Associated Work Order Card */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Associated Work Order
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
              {event.workOrderTitle}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--asmo-primary)', fontWeight: 700 }}>
            {event.workOrderId}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Close
          </button>
          <button
            onClick={handleNavigateToWorkOrder}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <span>Open Work Order Workspace</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
