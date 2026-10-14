import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertTriangle, ShieldCheck, FileCheck,
  ArrowRight, Filter, ChevronRight, Layers, Bell, CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PriorityBadge } from '../components/PriorityBadge';
import { ReviewModal } from '../components/ReviewModal';
import { ReviewTask } from '../types';

export const ActionCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    reviewTasks, workOrders, milestones, deliverables,
    changeRequests, currentUser, reviewDeliverable, reviewChangeRequest
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reviews' | 'milestones' | 'deliverables' | 'changes'>('all');
  const [selectedReviewTask, setSelectedReviewTask] = useState<ReviewTask | null>(null);

  // Pending Review Tasks
  const pendingReviews = reviewTasks.filter(t => t.decision === 'Pending');

  // Overdue Milestones (relative to 14 Oct 2026)
  const overdueMilestones = milestones.filter(m => m.status === 'Overdue');

  // Deliverables Awaiting Acceptance
  const pendingDeliverables = deliverables.filter(d => ['Submitted', 'Under Review'].includes(d.reviewStatus));

  // Change Requests Pending Decision
  const pendingChangeRequests = changeRequests.filter(c => c.status === 'Raised');

  // Work Orders Pending Release PO Authorisation
  const pendingAuthorisations = workOrders.filter(w => w.lifecycleStatus === 'Approved' && !w.authorisedValue);

  const totalPendingActions =
    pendingReviews.length +
    overdueMilestones.length +
    pendingDeliverables.length +
    pendingChangeRequests.length +
    pendingAuthorisations.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.75rem 2.25rem', overflowY: 'auto' }}>
          {/* Header Title Area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Operational Governance
                </span>
              </div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0 }}>
                Action Centre & Approvals Inbox
              </h1>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                Centralized triage for pending governance reviews, authorisation gates, overdue milestones, and deliverable sign-offs.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                {totalPendingActions} Actions Requiring Attention
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              onClick={() => setActiveFilter('reviews')}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'reviews' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Technical Reviews
                </span>
                <Clock size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-dark)', marginTop: '0.25rem' }}>
                {pendingReviews.length}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Architecture, Cyber, Commercial
              </div>
            </div>

            <div
              onClick={() => setActiveFilter('milestones')}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'milestones' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Overdue Milestones
                </span>
                <AlertTriangle size={16} style={{ color: '#B42318' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B42318', marginTop: '0.25rem' }}>
                {overdueMilestones.length}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                SLA deadline breached
              </div>
            </div>

            <div
              onClick={() => setActiveFilter('deliverables')}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'deliverables' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Pending Deliverables
                </span>
                <FileCheck size={16} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
                {pendingDeliverables.length}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Submitted awaiting acceptance
              </div>
            </div>

            <div
              onClick={() => setActiveFilter('changes')}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                cursor: 'pointer',
                border: activeFilter === 'changes' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Change Requests
                </span>
                <ShieldCheck size={16} style={{ color: '#D97706' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>
                {pendingChangeRequests.length}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Awaiting board review
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              { id: 'all', label: `All Action Items (${totalPendingActions})` },
              { id: 'reviews', label: `Multi-Disciplinary Reviews (${pendingReviews.length})` },
              { id: 'milestones', label: `Overdue Delivery Milestones (${overdueMilestones.length})` },
              { id: 'deliverables', label: `Deliverable Sign-Offs (${pendingDeliverables.length})` },
              { id: 'changes', label: `Change Requests (${pendingChangeRequests.length})` },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id as any)}
                className={`btn btn-sm ${activeFilter === pill.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Action Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1. Multi-Disciplinary Reviews */}
            {(activeFilter === 'all' || activeFilter === 'reviews') && pendingReviews.map(task => {
              const targetWo = workOrders.find(w => w.id === task.workOrderId);
              return (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                        {task.reviewType} Review Required
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {task.workOrderId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                      {targetWo?.title || 'Work Order Governance Review'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Assigned Discipline: <strong>{task.reviewType}</strong> • Status: <span style={{ color: '#D97706', fontWeight: 600 }}>{task.decision}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => setSelectedReviewTask(task)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Record Review Decision
                    </button>
                    <Link
                      to={`/control-tower/${task.workOrderId}?tab=approvals-authorisation`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <span>Open Work Order</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* 2. Overdue Milestones */}
            {(activeFilter === 'all' || activeFilter === 'milestones') && overdueMilestones.map(ms => {
              const targetWo = workOrders.find(w => w.id === ms.workOrderId);
              return (
                <div
                  key={ms.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFF5F5',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className="badge badge-danger" style={{ fontSize: '0.6875rem' }}>
                        Milestone Overdue
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {ms.workOrderId} • {ms.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991B1B' }}>
                      {ms.name} — {targetWo?.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B42318', marginTop: '0.25rem' }}>
                      Due Date: <strong>{ms.plannedEndDate}</strong> (Overdue by 6 days relative to 14 Oct 2026) • Current Progress: {ms.completionPercentage}%
                    </div>
                  </div>

                  <Link
                    to={`/control-tower/${ms.workOrderId}?tab=plan-milestones`}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: '#B42318', borderColor: '#991B1B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>Triage Milestone</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })}

            {/* 3. Pending Deliverables */}
            {(activeFilter === 'all' || activeFilter === 'deliverables') && pendingDeliverables.map(deliv => {
              const targetWo = workOrders.find(w => w.id === deliv.workOrderId);
              return (
                <div
                  key={deliv.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                        Deliverable Submitted
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {deliv.workOrderId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                      {deliv.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Work Order: <strong>{targetWo?.title}</strong> • Actual Submission: {deliv.actualSubmissionDate || deliv.plannedSubmissionDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => reviewDeliverable(deliv.id, 'Accepted', 'Deliverable verified and formally accepted in Action Centre')}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0', fontSize: '0.75rem' }}
                    >
                      Accept
                    </button>
                    <Link
                      to={`/control-tower/${deliv.workOrderId}?tab=deliverables-testing`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <span>Review Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* 4. Pending Change Requests */}
            {(activeFilter === 'all' || activeFilter === 'changes') && pendingChangeRequests.map(cr => {
              const targetWo = workOrders.find(w => w.id === cr.workOrderId);
              return (
                <div
                  key={cr.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                        Change Request Awaiting Board
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {cr.id} • {cr.workOrderId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                      {cr.changeDescription}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Target Work Order: <strong>{targetWo?.title}</strong> • Schedule Impact: {cr.scheduleImpact} • Commercial: SAR {cr.commercialImpact.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => reviewChangeRequest(cr.id, 'Approved', 'Approved in Action Centre')}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', backgroundColor: '#059669', borderColor: '#047857' }}
                    >
                      Approve CR
                    </button>
                    <Link
                      to={`/control-tower/${cr.workOrderId}?tab=activity-audit`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <span>Examine</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Mount */}
          {selectedReviewTask && workOrders.find(w => w.id === selectedReviewTask.workOrderId) && (
            <ReviewModal
              task={selectedReviewTask}
              workOrder={workOrders.find(w => w.id === selectedReviewTask.workOrderId)!}
              isOpen={Boolean(selectedReviewTask)}
              onClose={() => setSelectedReviewTask(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ActionCentrePage;
