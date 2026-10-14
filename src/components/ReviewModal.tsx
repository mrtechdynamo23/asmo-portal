import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';
import { ReviewTask, ReviewDecision, WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface ReviewModalProps {
  task: ReviewTask;
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ task, workOrder, isOpen, onClose }) => {
  const { recordReviewDecision } = useStore();
  const [decision, setDecision] = useState<ReviewDecision>('Approved');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision !== 'Approved' && !comments.trim()) {
      setError('Comments are required when requesting revisions or rejecting.');
      return;
    }
    recordReviewDecision(task.id, decision, comments.trim());
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
        maxWidth: '540px',
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
          backgroundColor: 'var(--color-surface-raised)'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Record {task.reviewType} Review Decision
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {workOrder.id} — {workOrder.title}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
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
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Review Decision *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDecision('Approved')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: decision === 'Approved' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                  backgroundColor: decision === 'Approved' ? 'var(--color-success-bg)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success)' }}>
                  Approve
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('Revision Required')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: decision === 'Revision Required' ? '2px solid var(--color-warning)' : '1px solid var(--color-border)',
                  backgroundColor: decision === 'Revision Required' ? 'var(--color-warning-bg)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <AlertCircle size={20} style={{ color: 'var(--color-warning)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                  Need Revision
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('Rejected')}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: decision === 'Rejected' ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                  backgroundColor: decision === 'Rejected' ? 'var(--color-danger-bg)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <XCircle size={20} style={{ color: 'var(--color-danger)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                  Reject
                </span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Evaluation Comments & Recommendations {decision !== 'Approved' && '*'}
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (error) setError('');
              }}
              placeholder={decision === 'Approved' ? 'Enter any commendations, conditions or delivery notes...' : 'Specify reasons, gaps, or required amendments for SI Partner...'}
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
            <button type="submit" className="btn btn-primary">
              Submit Review Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
