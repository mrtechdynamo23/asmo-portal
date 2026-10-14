import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useStore } from '../store/useStore';

interface AuthorisationModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorisationModal: React.FC<AuthorisationModalProps> = ({ workOrder, isOpen, onClose }) => {
  const { recordAuthorisation } = useStore();
  const [poReference, setPoReference] = useState(`PO-ASMO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [authorisedValue, setAuthorisedValue] = useState(workOrder.proposedValue || 0);
  const [evidenceName, setEvidenceName] = useState(`Signed_Release_PO_${workOrder.id}.pdf`);
  const [comments, setComments] = useState('Scope, deliverables, commercial rates and schedule formally verified and authorized by Procurement & Governance.');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poReference.trim()) {
      setError('Release PO Reference is required.');
      return;
    }
    if (authorisedValue <= 0) {
      setError('Authorised value must be greater than 0.');
      return;
    }

    recordAuthorisation({
      workOrderId: workOrder.id,
      workOrderReference: workOrder.id,
      releasePOReference: poReference.trim(),
      approvedScope: workOrder.scopeDescription || workOrder.title,
      approvedDates: `${workOrder.plannedStartDate} to ${workOrder.plannedEndDate}`,
      pricingBasis: workOrder.commercialModel,
      authorisedValue: Number(authorisedValue),
      evidenceName: evidenceName.trim(),
      comments: comments.trim(),
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
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#065F46', margin: 0 }}>
                Formal Work Order Authorisation
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                Release Purchase Order (PO) Issuance — {workOrder.id}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Release PO Reference *
              </label>
              <input
                type="text"
                required
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Authorised Value (SAR) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={authorisedValue}
                onChange={(e) => setAuthorisedValue(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Attached Authorisation Evidence / PO Document Name *
            </label>
            <input
              type="text"
              required
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
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
              Governance Notes & Authorisation Details
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
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
              Issue Formal Authorisation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
