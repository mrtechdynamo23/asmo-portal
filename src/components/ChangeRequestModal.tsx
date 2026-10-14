import React, { useState } from 'react';
import { GitPullRequest, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface ChangeRequestModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeRequestModal: React.FC<ChangeRequestModalProps> = ({ workOrder, isOpen, onClose }) => {
  const { addChangeRequest, currentUser } = useStore();
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [scopeImpact, setScopeImpact] = useState('');
  const [scheduleImpact, setScheduleImpact] = useState('2 weeks extension');
  const [costImpact, setCostImpact] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !justification.trim()) {
      setError('Description and business justification are required.');
      return;
    }

    addChangeRequest({
      workOrderId: workOrder.id,
      requestorId: currentUser.id,
      changeDescription: description.trim(),
      businessJustification: justification.trim(),
      scopeImpact: scopeImpact.trim() || 'Minor module enhancement',
      scheduleImpact: scheduleImpact.trim(),
      commercialImpact: Number(costImpact),
      riskImpact: 'Low risk to production',
      technicalImpact: 'Additional API parameter validation and DB index',
    });

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
        maxWidth: '560px',
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
          backgroundColor: '#FAF5FF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#F3E8FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitPullRequest size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#6B21A8', margin: 0 }}>
                Raise Change Request (CR)
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#7E22CE' }}>
                {workOrder.id} — {workOrder.title}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B21A8' }}>
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

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Change Request Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the requested variance in scope, technology, or deliverables..."
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Business Justification *
            </label>
            <textarea
              rows={2}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why is this change necessary and what is the operational impact if not approved?"
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Schedule Impact
              </label>
              <input
                type="text"
                value={scheduleImpact}
                onChange={(e) => setScheduleImpact(e.target.value)}
                placeholder="+2 weeks or No change"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Commercial Impact (SAR)
              </label>
              <input
                type="number"
                value={costImpact}
                onChange={(e) => setCostImpact(Number(e.target.value))}
                placeholder="0 or positive amount"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Change Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
