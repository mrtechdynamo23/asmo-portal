import React, { useState } from 'react';
import { Send, FileText, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface ProposalModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ workOrder, isOpen, onClose }) => {
  const { submitProposal, currentUser } = useStore();
  const [technicalProposal, setTechnicalProposal] = useState('Comprehensive architecture and implementation approach aligning with ASMO standards and delivery milestones.');
  const [commercialProposal, setCommercialProposal] = useState('Firm-fixed deliverables breakdown with standard rate card and milestone schedule.');
  const [proposedValue, setProposedValue] = useState(workOrder.proposedValue || 250000);
  const [keyPersonnel, setKeyPersonnel] = useState('Lead Solution Architect, Senior Fullstack Dev, DevOps Engineer, QA Lead');
  const [proposedMilestones, setProposedMilestones] = useState('M1: Architecture Sign-off, M2: Core Sprint Complete, M3: SIT & UAT, M4: Handover');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedValue <= 0) {
      setError('Proposed value must be greater than 0.');
      return;
    }

    submitProposal({
      workOrderId: workOrder.id,
      submittedBy: currentUser.name,
      technicalProposal: technicalProposal.trim(),
      commercialProposal: commercialProposal.trim(),
      keyPersonnel: keyPersonnel.split(',').map(s => s.trim()).filter(Boolean),
      proposedMilestones: proposedMilestones.trim(),
      pricingModel: workOrder.commercialModel,
      proposedValue: Number(proposedValue),
      changeSummary: 'Formal proposal submitted for multi-disciplinary review',
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
        maxWidth: '580px',
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
          backgroundColor: '#EFF6FF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF', margin: 0 }}>
                Submit SI Partner Proposal
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#3B82F6' }}>
                {workOrder.id} — {workOrder.title}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E40AF' }}>
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
              Proposed Commercial Value (SAR) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={proposedValue}
              onChange={(e) => setProposedValue(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.875rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontWeight: 600
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Technical Proposal Summary *
            </label>
            <textarea
              rows={3}
              required
              value={technicalProposal}
              onChange={(e) => setTechnicalProposal(e.target.value)}
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
              Key Personnel (comma separated)
            </label>
            <input
              type="text"
              value={keyPersonnel}
              onChange={(e) => setKeyPersonnel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Proposed Milestone Plan
            </label>
            <input
              type="text"
              value={proposedMilestones}
              onChange={(e) => setProposedMilestones(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
