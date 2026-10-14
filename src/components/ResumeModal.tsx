import React, { useState } from 'react';
import { PlayCircle, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface ResumeModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ workOrder, isOpen, onClose }) => {
  const { resumeWorkOrder } = useStore();
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const targetStatus = workOrder.previousStatusBeforeHold || workOrder.lifecycleStatus;

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    resumeWorkOrder(workOrder.id, notes.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(3px)'
    }}>
      <div className="card modal-content" style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ECFDF5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#065F46', margin: 0 }}>
                Resume Work Order
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                {workOrder.id} — {workOrder.title}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleResume} style={{ padding: '1.5rem' }}>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '6px'
          }}>
            Resuming this Work Order will remove the <strong>ON HOLD</strong> banner and reactivate delivery tracking in stage: <strong style={{ color: 'var(--color-primary-dark)' }}>{targetStatus}</strong>.
            {workOrder.holdReason && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                <em>Original Hold Reason:</em> {workOrder.holdReason}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Resolution Notes / Unblocking Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dependency resolved, site access granted, resuming active sprint execution..."
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Confirm Resume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
