import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface OnHoldModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const OnHoldModal: React.FC<OnHoldModalProps> = ({ workOrder, isOpen, onClose }) => {
  const { setWorkOrderHold } = useStore();
  const [reason, setReason] = useState('');
  const [resumeDate, setResumeDate] = useState('2026-10-28');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific justification for placing this Work Order on hold.');
      return;
    }
    setWorkOrderHold(workOrder.id, reason.trim(), resumeDate);
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
        maxWidth: '520px',
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
          backgroundColor: '#FFFBEB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400E', margin: 0 }}>
                Place Work Order On Hold
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                {workOrder.id} — {workOrder.title}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
            padding: '0.75rem',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '6px'
          }}>
            Placing a Work Order on hold pauses milestones and flags delivery schedules. Its underlying status (<strong>{workOrder.lifecycleStatus}</strong>) is preserved and will be restored immediately when resumed.
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Hold Reason & Blocker Description *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Awaiting client hardware delivery in Dammam site, or client architectural dependency resolution..."
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Expected Resume Date
            </label>
            <input
              type="date"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
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
              className="btn"
              style={{ backgroundColor: '#D97706', color: '#FFFFFF', borderColor: '#B45309' }}
            >
              Confirm Put On Hold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
