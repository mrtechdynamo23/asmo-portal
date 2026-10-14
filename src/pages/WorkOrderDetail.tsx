import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Layers, ArrowLeft, Calendar, DollarSign, Users, AlertTriangle,
  PlayCircle, PauseCircle, CheckCircle2, ShieldCheck, Clock,
  FileText, Check, Plus, Edit3, Trash2, ArrowRight, GitPullRequest,
  ShieldAlert, Sparkles, Send, FileCheck, ExternalLink, HelpCircle,
  AlertOctagon, CheckSquare, Milestone, PackageCheck, Shield,
  FileSpreadsheet, Lock, UserCheck, AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { RiskBadge } from '../components/RiskBadge';
import { OnHoldModal } from '../components/OnHoldModal';
import { ResumeModal } from '../components/ResumeModal';
import { ReviewModal } from '../components/ReviewModal';
import { AuthorisationModal } from '../components/AuthorisationModal';
import { ProposalModal } from '../components/ProposalModal';
import { ChangeRequestModal } from '../components/ChangeRequestModal';
import {
  canUserPerformTransition, canPutOnHold, canResumeFromHold,
  canReviewProposal, canAuthoriseWorkOrder, canAcceptDeliverables,
  canManageChangeRequests, getNextAction
} from '../services/workflow';
import {
  getWorkOrderMilestones, getWorkOrderDeliverables, getWorkOrderProposals,
  getWorkOrderReviewTasks, getWorkOrderRAID, getWorkOrderPaymentMilestones,
  getWorkOrderAuthorisation, getWorkOrderDefects, getWorkOrderAuditEvents
} from '../services/workOrderDetailsProvider';
import { LifecycleStatus, ReviewTask, DeliverableStatus } from '../types';

export const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    workOrders, currentUser, users, serviceDefinitions,
    milestones, deliverables, raidRecords, proposalVersions,
    reviewTasks, approvalDecisions, authorisations, changeRequests,
    commercialLines, paymentMilestones, defects, testRecords,
    auditEvents, transitionWorkOrder, reviewDeliverable,
    updateMilestone, reviewChangeRequest, updateDefect
  } = useStore();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // Modals state
  const [isOnHoldOpen, setIsOnHoldOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isAuthorisationOpen, setIsAuthorisationOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [selectedReviewTask, setSelectedReviewTask] = useState<ReviewTask | null>(null);

  // Deliverable review inline state
  const [reviewingDelivId, setReviewingDelivId] = useState<string | null>(null);
  const [delivComments, setDelivComments] = useState('');

  // Find target Work Order
  const wo = workOrders.find(w => w.id === id);

  if (!wo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '3rem', textAlign: 'center' }}>
            <h2>Work Order Not Found</h2>
            <p>The requested Work Order ID "{id}" could not be located in the current database.</p>
            <Link to="/control-tower" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Return to Register
            </Link>
          </main>
        </div>
      </div>
    );
  }

  // Related Entities (with Universal Provider ensuring every Work Order has populated tabs)
  const service = serviceDefinitions.find(s => s.id === wo.serviceCategoryId);
  const businessOwner = users.find(u => u.id === wo.businessOwnerId);
  const projectManager = users.find(u => u.id === wo.projectManagerId);
  const woMilestones = getWorkOrderMilestones(wo, milestones);
  const woDeliverables = getWorkOrderDeliverables(wo, deliverables);
  const woRaid = getWorkOrderRAID(wo, raidRecords);
  const woProposals = getWorkOrderProposals(wo, proposalVersions);
  const woReviewTasks = getWorkOrderReviewTasks(wo, reviewTasks);
  const woAuthorisation = getWorkOrderAuthorisation(wo, authorisations);
  const woChangeRequests = changeRequests.filter(c => c.workOrderId === wo.id);
  const woCommercials = commercialLines.filter(c => c.workOrderId === wo.id);
  const woPaymentMilestones = getWorkOrderPaymentMilestones(wo, paymentMilestones);
  const woDefects = getWorkOrderDefects(wo, defects);
  const woTests = testRecords.filter(t => t.workOrderId === wo.id);
  const woAuditEvents = getWorkOrderAuditEvents(wo, auditEvents);

  // Role permissions
  const role = currentUser.role;
  const userCanHold = canPutOnHold(role) && !wo.isOnHold && !['Closed', 'Cancelled', 'Rejected'].includes(wo.lifecycleStatus);
  const userCanResume = canResumeFromHold(role) && wo.isOnHold;
  const userCanAuthorise = canAuthoriseWorkOrder(role) && wo.lifecycleStatus === 'Approved';

  // Lifecycle Quick Advance Handlers
  const handleTransition = (next: LifecycleStatus, notes?: string) => {
    transitionWorkOrder(wo.id, next, notes);
  };

  const handleDeliverableReview = (delivId: string, status: DeliverableStatus) => {
    reviewDeliverable(delivId, status, delivComments.trim() || `Deliverable marked as ${status}`);
    setReviewingDelivId(null);
    setDelivComments('');
  };

  // Section 13: Exact 10 Tabs Definition
  const tabsList = [
    { id: 'overview', label: '1. Overview' },
    { id: 'scope-proposal', label: `2. Scope & Proposal (${woProposals.length})` },
    { id: 'approvals-authorisation', label: woAuthorisation ? '3. Approvals & Authorisation (PO Issued)' : `3. Approvals & Authorisation (${woReviewTasks.length})` },
    { id: 'team-raci', label: '4. Team & RACI' },
    { id: 'plan-milestones', label: `5. Plan & Milestones (${woMilestones.length})` },
    { id: 'commercials', label: '6. Commercials' },
    { id: 'raid', label: `7. RAID (${woRaid.length})` },
    { id: 'deliverables-testing', label: `8. Deliverables / Testing / Acceptance (${woDeliverables.length})` },
    { id: 'deployment-closure', label: wo.lifecycleStatus === 'Closed' ? '9. Deployment / Closure (Verified)' : '9. Deployment / Closure' },
    { id: 'activity-audit', label: `10. Activity / Audit (${woAuditEvents.length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.75rem 2.25rem', overflowY: 'auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
            <Link to="/control-tower" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Back to Register
            </Link>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{wo.id}</span>
          </div>

          {/* Sticky Detail Header Card */}
          <div className="card" style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: wo.isOnHold ? '2px solid #F59E0B' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {wo.id}
                  </span>
                  <StatusBadge status={wo.lifecycleStatus} />
                  {wo.isOnHold && (
                    <span className="badge badge-warning" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <PauseCircle size={12} /> ON HOLD ({wo.holdReason})
                    </span>
                  )}
                  <PriorityBadge priority={wo.priority} />
                  <RiskBadge risk={wo.riskHealth} />
                </div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-brand-dark)', margin: 0, lineHeight: 1.3 }}>
                  {wo.title}
                </h1>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.375rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <span>Service: <strong>{service?.name || wo.serviceCategoryId}</strong></span>
                  <span>Business Unit: <strong>{wo.requestingBusinessUnit}</strong></span>
                  <span>Owner: <strong>{businessOwner?.name || wo.businessOwnerId}</strong></span>
                  <span>Target Date: <strong>{wo.plannedEndDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {userCanHold && (
                  <button
                    onClick={() => setIsOnHoldOpen(true)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <PauseCircle size={15} />
                    <span>Put On Hold</span>
                  </button>
                )}

                {userCanResume && (
                  <button
                    onClick={() => setIsResumeOpen(true)}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#D97706', borderColor: '#B45309', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <PlayCircle size={15} />
                    <span>Resume Work Order</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Draft' && canUserPerformTransition(role, 'Draft', 'Submitted') && (
                  <button
                    onClick={() => handleTransition('Submitted', 'Submitted by Business Owner for Demand Qualification')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <Send size={15} />
                    <span>Submit Demand</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Submitted' && canUserPerformTransition(role, 'Submitted', 'Qualified') && (
                  <button
                    onClick={() => handleTransition('Qualified', 'Demand reviewed and qualified by WO Manager')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Qualify Demand</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Qualified' && canUserPerformTransition(role, 'Qualified', 'SoW Issued') && (
                  <button
                    onClick={() => handleTransition('SoW Issued', 'Formal Scope of Work issued to SI Partner')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <FileText size={15} />
                    <span>Issue SoW</span>
                  </button>
                )}

                {(wo.lifecycleStatus === 'SoW Issued' || wo.lifecycleStatus === 'Revision Required') && (
                  <button
                    onClick={() => setIsProposalOpen(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <Send size={15} />
                    <span>Submit SI Proposal</span>
                  </button>
                )}

                {userCanAuthorise && (
                  <button
                    onClick={() => setIsAuthorisationOpen(true)}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#059669', borderColor: '#047857', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <ShieldCheck size={16} />
                    <span>Authorise Release PO</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Authorised' && canUserPerformTransition(role, 'Authorised', 'Discovery') && (
                  <button
                    onClick={() => handleTransition('Discovery', 'Initiation complete. Discovery kickoff meeting convened.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Kickoff Discovery</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Discovery' && canUserPerformTransition(role, 'Discovery', 'Design') && (
                  <button
                    onClick={() => handleTransition('Design', 'Discovery requirements frozen. Design phase initiated.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Advance to Design</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Design' && canUserPerformTransition(role, 'Design', 'Build') && (
                  <button
                    onClick={() => handleTransition('Build', 'Architecture and HLD signed off. Sprint build commencing.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Advance to Build</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Build' && canUserPerformTransition(role, 'Build', 'Validate') && (
                  <button
                    onClick={() => handleTransition('Validate', 'Development complete. Entering SIT and UAT testing pass.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Advance to Validate</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Validate' && canUserPerformTransition(role, 'Validate', 'Deploy') && (
                  <button
                    onClick={() => handleTransition('Deploy', 'UAT acceptance sign-off granted. Ready for production release.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Advance to Deploy</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Deploy' && canUserPerformTransition(role, 'Deploy', 'Stabilise') && (
                  <button
                    onClick={() => handleTransition('Stabilise', 'Production deployment complete. Commencing 30-day hypercare warranty.')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <span>Advance to Hypercare</span>
                  </button>
                )}

                {wo.lifecycleStatus === 'Stabilise' && canUserPerformTransition(role, 'Stabilise', 'Closed') && (
                  <button
                    onClick={() => handleTransition('Closed', 'Hypercare concluded. Final commercial settlement and closure.')}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#4B5563', borderColor: '#374151', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Formal Closure</span>
                  </button>
                )}

                {/* Change Request Button */}
                {canManageChangeRequests(role) && !['Closed', 'Cancelled'].includes(wo.lifecycleStatus) && (
                  <button
                    onClick={() => setIsChangeRequestOpen(true)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                  >
                    <GitPullRequest size={15} />
                    <span>Raise CR</span>
                  </button>
                )}
              </div>
            </div>

            {/* Next Action & On Hold Warning Banner */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              backgroundColor: wo.isOnHold ? '#FFFBEB' : 'var(--color-primary-bg)',
              border: wo.isOnHold ? '1px solid #FDE68A' : '1px solid var(--color-border)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                {wo.isOnHold ? (
                  <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                ) : (
                  <Clock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                )}
                <div style={{ fontSize: '0.8125rem', color: wo.isOnHold ? '#92400E' : 'var(--color-brand-dark)', fontWeight: 600 }}>
                  <strong>Next Operational Step:</strong> {getNextAction(wo)}
                </div>
              </div>

              {wo.isOnHold && wo.holdExpectedResumeDate && (
                <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Expected Resume: {wo.holdExpectedResumeDate}
                </div>
              )}
            </div>
          </div>

          {/* EXACT 10 DETAILED TABS NAVIGATION (Section 13) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            backgroundColor: 'var(--color-surface)',
            padding: '0 0.5rem',
            borderRadius: '10px 10px 0 0',
          }}>
            {tabsList.map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'none',
                    borderBottom: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Executive Summary Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                    Executive Justification & Outcome
                  </h3>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Business Justification
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', marginTop: '0.375rem', lineHeight: 1.5 }}>
                      {wo.businessJustification}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      Target Business Outcome
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', marginTop: '0.375rem', lineHeight: 1.5 }}>
                      {wo.businessOutcome}
                    </p>
                  </div>
                </div>

                {/* Scope Preview */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                    Scope Statement
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {wo.scopeDescription}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
                        In-Scope Highlights
                      </div>
                      <ul style={{ fontSize: '0.75rem', color: '#166534', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                        {wo.inScopeActivities.slice(0, 4).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.5rem' }}>
                        Out-of-Scope Exclusions
                      </div>
                      <ul style={{ fontSize: '0.75rem', color: '#991B1B', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.5 }}>
                        {wo.outOfScopeActivities.slice(0, 4).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Key Metrics & Stakeholders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Financial Summary Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                    Commercial Overview
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Proposed Value:</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        SAR {wo.proposedValue.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Approved Value:</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: wo.approvedValue ? 'var(--color-success)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {wo.approvedValue ? `SAR ${wo.approvedValue.toLocaleString()}` : 'Pending Approval'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Authorised Value:</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: wo.authorisedValue ? '#059669' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {wo.authorisedValue ? `SAR ${wo.authorisedValue.toLocaleString()}` : 'Pending Release PO'}
                      </span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--color-divider)', margin: '0.25rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Pricing Model:</span>
                      <span className="badge badge-default">{wo.commercialModel}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Progress Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                    Delivery Phase & Progress
                  </h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                      <span>Current Phase: {wo.deliveryPhase}</span>
                      <span>{wo.deliveryProgress}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${wo.deliveryProgress}%`,
                          height: '100%',
                          backgroundColor: wo.deliveryProgress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div>Planned Start: <strong>{wo.plannedStartDate}</strong></div>
                    <div>Planned Completion: <strong>{wo.plannedEndDate}</strong></div>
                    {wo.actualStartDate && <div>Actual Start: <strong>{wo.actualStartDate}</strong></div>}
                  </div>
                </div>

                {/* Key Stakeholders Card */}
                <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                    Key Stakeholders
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Business Owner</div>
                      <div style={{ fontWeight: 600 }}>{businessOwner?.name || wo.businessOwnerId}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{businessOwner?.department}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Project Manager</div>
                      <div style={{ fontWeight: 600 }}>{projectManager?.name || 'Assigned PM'}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>PMO Delivery</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>SI Delivery Lead</div>
                      <div style={{ fontWeight: 600 }}>Priya Nair</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Nexus Consulting</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCOPE & PROPOSAL */}
          {activeTab === 'scope-proposal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Scope Breakdown */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Work Order Scope & Boundary Definition
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {wo.scopeDescription}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ padding: '1.25rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <CheckCircle2 size={16} /> In-Scope Deliverables & Activities
                    </div>
                    <ul style={{ fontSize: '0.8125rem', color: '#166534', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                      {wo.inScopeActivities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ padding: '1.25rem', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <AlertOctagon size={16} /> Out-of-Scope Exclusions & Constraints
                    </div>
                    <ul style={{ fontSize: '0.8125rem', color: '#991B1B', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                      {wo.outOfScopeActivities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Proposals Version History */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-brand-dark)' }}>
                      SI Partner Proposal Versions History
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Tracked technical solutions, revisions, and submitted pricing
                    </div>
                  </div>
                  {(wo.lifecycleStatus === 'SoW Issued' || wo.lifecycleStatus === 'Revision Required') && (
                    <button
                      onClick={() => setIsProposalOpen(true)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Plus size={14} /> Submit New Proposal Version
                    </button>
                  )}
                </div>

                {woProposals.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                    No proposal submitted by SI Partner yet. Status must be <strong>SoW Issued</strong> for proposal submission.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {woProposals.map(p => (
                      <div
                        key={p.id}
                        style={{
                          padding: '1.25rem',
                          backgroundColor: p.status === 'Approved' ? '#F0FDF4' : 'var(--color-bg)',
                          borderRadius: '8px',
                          border: p.status === 'Approved' ? '1px solid #BBF7D0' : '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                              Version {p.versionNumber}
                            </span>
                            <span className={`badge ${p.status === 'Approved' ? 'badge-success' : p.status === 'Revision Required' ? 'badge-warning' : 'badge-info'}`}>
                              {p.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                            SAR {p.proposedValue.toLocaleString()}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                          <strong>Technical Summary:</strong> {p.technicalProposal}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          <span>Submitted by: <strong>{p.submittedBy}</strong> on {p.submittedAt.split('T')[0]}</span>
                          <span>Pricing Basis: <strong>{p.pricingModel}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPROVALS & AUTHORISATION */}
          {activeTab === 'approvals-authorisation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Governance Gate Rule Notice */}
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Shield size={20} style={{ flexShrink: 0, color: '#2563EB' }} />
                <div>
                  <strong>Governance Separation Gate (Rule 15.1 & 15.2):</strong> Approval of a proposal is not the same as formal Work Order authorisation. The Work Order cannot enter execution phases (Discovery, Design, Build) until a formal Release Purchase Order has been authorised and issued.
                </div>
              </div>

              {/* Multi-Disciplinary Governance Review Scorecard */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Multi-Disciplinary Governance Review Scorecard
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Review Discipline</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Assigned Reviewer</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Decision</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Evaluation Feedback</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Decided At</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woReviewTasks.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Review tasks will be assigned automatically upon SI proposal submission.
                          </td>
                        </tr>
                      ) : (
                        woReviewTasks.map(t => {
                          const reviewer = users.find(u => u.id === t.reviewerId);
                          const isCurrentUserAssigned = currentUser.id === t.reviewerId || role === 'Admin';
                          return (
                            <tr key={t.id}>
                              <td style={{ padding: '0.625rem 0.75rem', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                                {t.reviewType} Review
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem' }}>
                                <div style={{ fontWeight: 600 }}>{reviewer?.name || t.reviewerId}</div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{reviewer?.department}</div>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem' }}>
                                <span className={`badge ${t.decision === 'Approved' ? 'badge-success' : t.decision === 'Revision Required' ? 'badge-warning' : t.decision === 'Rejected' ? 'badge-danger' : 'badge-default'}`}>
                                  {t.decision}
                                </span>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '320px' }}>
                                {t.comments || 'Pending evaluation.'}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}>
                                {t.decidedAt ? t.decidedAt.split('T')[0] : '—'}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                                {isCurrentUserAssigned && (
                                  <button
                                    onClick={() => setSelectedReviewTask(t)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
                                  >
                                    Record Decision
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formal Release Purchase Order Section */}
              {woAuthorisation ? (
                <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid var(--color-success)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={26} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', margin: 0 }}>
                        Formal Release Purchase Order Authorized
                      </h2>
                      <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
                        Release PO Reference: <strong style={{ fontFamily: 'var(--font-mono)' }}>{woAuthorisation.releasePOReference}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Authorised Value</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        SAR {woAuthorisation.authorisedValue.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Authorised Date</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
                        {woAuthorisation.authorisedAt.split('T')[0]}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Attached Evidence</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
                        {woAuthorisation.evidenceName}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Governance Comments</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text)', marginTop: '0.25rem' }}>
                      {woAuthorisation.comments}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--color-border)' }}>
                  <ShieldAlert size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-dark)', margin: '0 0 0.5rem 0' }}>
                    Formal Authorisation Pending
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                    Before execution kicks off, governance approval must be granted and a formal Release Purchase Order (PO) issued. Current status: <strong>{wo.lifecycleStatus}</strong>.
                  </p>
                  {userCanAuthorise ? (
                    <button
                      onClick={() => setIsAuthorisationOpen(true)}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <ShieldCheck size={16} />
                      <span>Issue Release PO Now</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Authorisation requires <strong>Approved</strong> lifecycle status and WO Manager / Admin role.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEAM & RACI */}
          {activeTab === 'team-raci' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Assigned Team Cards */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-brand-dark)' }}>
                  Work Order Core Project Team & Governance Leads
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Business Owner (Client)
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      {businessOwner?.name || wo.businessOwnerId}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      {businessOwner?.role || 'Business Stakeholder'} • {businessOwner?.department}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {businessOwner?.email || 'owner@asmo.com'}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Project Manager (ASMO PMO)
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      {projectManager?.name || 'Tariq Mansoor'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Senior Project Manager • PMO Delivery
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      tariq.pm@asmo.com
                    </div>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      SI Delivery Lead (Partner)
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      Priya Nair
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Engagement Director • Nexus Consulting
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      p.nair@nexus.partner.com
                    </div>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Enterprise Architecture Lead
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      Dr. Faisal Al-Harbi
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Lead Architect • Technology Governance
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      faisal.arch@asmo.com
                    </div>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      Cybersecurity Officer
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      Reem Al-Otaibi
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Cybersecurity Assessor • InfoSec Board
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      reem.cyber@asmo.com
                    </div>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      QA & Acceptance Lead
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '4px' }}>
                      Nasser Al-Ghamdi
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Quality Assurance Manager • IT Operations
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      nasser.qa@asmo.com
                    </div>
                  </div>
                </div>
              </div>

              {/* RACI Matrix Table */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-brand-dark)' }}>
                  Work Order Governance RACI Matrix
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                  <strong>R</strong> = Responsible, <strong>A</strong> = Accountable, <strong>C</strong> = Consulted, <strong>I</strong> = Informed
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Lifecycle Activity / Phase</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Business Owner</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>WO Manager</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Project Manager</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>SI Partner</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Arch / Cyber</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>QA Lead</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { activity: 'Demand Initiation & Business Case', bo: 'A / R', wom: 'C', pm: 'C', si: 'I', ac: 'I', qa: 'I' },
                        { activity: 'Demand Qualification & SoW Issuance', bo: 'C', wom: 'A / R', pm: 'C', si: 'I', ac: 'C', qa: 'I' },
                        { activity: 'Proposal Submission & Pricing', bo: 'I', wom: 'C', pm: 'C', si: 'A / R', ac: 'C', qa: 'I' },
                        { activity: 'Multi-Disciplinary Technical Review', bo: 'I', wom: 'A', pm: 'C', si: 'C', ac: 'R', qa: 'C' },
                        { activity: 'Commercial Authorisation & Release PO', bo: 'C', wom: 'A / R', pm: 'I', si: 'I', ac: 'I', qa: 'I' },
                        { activity: 'Sprint Build & Code Execution', bo: 'I', wom: 'I', pm: 'A', si: 'R', ac: 'C', qa: 'C' },
                        { activity: 'Deliverables & UAT Acceptance', bo: 'A', wom: 'C', pm: 'C', si: 'C', ac: 'I', qa: 'R' },
                        { activity: 'Production Deployment & Cutover', bo: 'I', wom: 'A', pm: 'R', si: 'R', ac: 'C', qa: 'C' },
                        { activity: 'Handover, Warranty & Closure', bo: 'A', wom: 'A / R', pm: 'R', si: 'C', ac: 'I', qa: 'C' },
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{row.activity}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.bo.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.bo}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.wom.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.wom}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.pm.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.pm}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.si.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.si}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.ac.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.ac}</td>
                          <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontWeight: 700, color: row.qa.includes('A') ? 'var(--color-primary)' : 'inherit' }}>{row.qa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLAN & MILESTONES */}
          {activeTab === 'plan-milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-brand-dark)' }}>
                    Delivery Milestones Schedule & Phase Execution
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Reference Date: <strong>14 October 2026</strong>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Milestone ID & Name</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Phase</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Planned Dates</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem', minWidth: '150px' }}>Progress</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woMilestones.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No milestones defined for this Work Order.
                          </td>
                        </tr>
                      ) : (
                        woMilestones.map(m => {
                          const isOverdue = m.status === 'Overdue';
                          return (
                            <tr key={m.id} style={{ backgroundColor: isOverdue ? '#FFF5F5' : 'transparent' }}>
                              <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>{m.id}</span>
                                  <span>{m.name}</span>
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{m.description}</div>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem' }}>{m.phase}</td>
                              <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}>
                                {m.plannedStartDate} → {m.plannedEndDate}
                                {isOverdue && (
                                  <div style={{ color: '#B42318', fontWeight: 700, fontSize: '0.6875rem', marginTop: '2px' }}>
                                    6 Days Overdue (Due 08 Oct 2026)
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem' }}>
                                <span className={`badge ${m.status === 'Completed' ? 'badge-success' : m.status === 'Overdue' ? 'badge-danger' : m.status === 'In Progress' ? 'badge-info' : 'badge-default'}`}>
                                  {m.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${m.completionPercentage}%`, height: '100%', backgroundColor: m.completionPercentage === 100 ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                                  </div>
                                  <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{m.completionPercentage}%</span>
                                </div>
                              </td>
                              <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                                {m.status !== 'Completed' && (
                                  <button
                                    onClick={() => updateMilestone(m.id, { completionPercentage: 100, status: 'Completed', actualEndDate: '2026-10-14' })}
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                                  >
                                    Complete
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMMERCIALS */}
          {activeTab === 'commercials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Commercial Breakdown & Payment Milestones
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Commercial Model</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, marginTop: '2px', color: 'var(--color-brand-dark)' }}>{wo.commercialModel}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Estimated Initial Value</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>SAR {wo.proposedValue.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Approved PO Value</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>
                      {wo.approvedValue ? `SAR ${wo.approvedValue.toLocaleString()}` : 'Pending Authorisation'}
                    </div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Variance to Date</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-muted)', marginTop: '2px' }}>SAR 0.00</div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Payment Milestone</th>
                        <th style={{ textAlign: 'right', padding: '0.625rem 0.75rem' }}>Amount (SAR)</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Due Date</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Invoice Reference</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Invoice Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woPaymentMilestones.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Payment milestones scheduled according to delivery gates.
                          </td>
                        </tr>
                      ) : (
                        woPaymentMilestones.map(p => (
                          <tr key={p.id}>
                            <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{p.milestoneName}</td>
                            <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {p.amount.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>{p.dueDate}</td>
                            <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{p.invoiceReference || '—'}</td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${p.status === 'Paid' ? 'badge-success' : p.status === 'Invoiced' ? 'badge-info' : 'badge-default'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: RAID */}
          {activeTab === 'raid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  RAID Register (Risks, Assumptions, Issues, Dependencies)
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Type</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Severity</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Impact</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Mitigation Plan</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woRaid.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No RAID records logged for this Work Order.
                          </td>
                        </tr>
                      ) : (
                        woRaid.map(r => (
                          <tr key={r.id}>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${r.type === 'Risk' ? 'badge-danger' : r.type === 'Issue' ? 'badge-warning' : 'badge-info'}`}>
                                {r.type}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{r.description}</td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>{r.severity}</td>
                            <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{r.impact}</td>
                            <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '280px' }}>{r.mitigationPlan}</td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className="badge badge-default">{r.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DELIVERABLES / TESTING / ACCEPTANCE */}
          {activeTab === 'deliverables-testing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Deliverables Register */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Deliverables Register & Formal Acceptance
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Deliverable Name</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Planned Submission</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Actual Submission</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Review Status</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Review Comments</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woDeliverables.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No deliverables formally registered yet. Deliverables will be seeded when proposal is submitted.
                          </td>
                        </tr>
                      ) : (
                        woDeliverables.map(d => (
                          <tr key={d.id}>
                            <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>
                              {d.name}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>{d.plannedSubmissionDate}</td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>{d.actualSubmissionDate || '—'}</td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${d.reviewStatus === 'Accepted' ? 'badge-success' : d.reviewStatus === 'Revision Required' ? 'badge-warning' : d.reviewStatus === 'Submitted' ? 'badge-info' : 'badge-default'}`}>
                                {d.reviewStatus}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '280px' }}>
                              {d.reviewerComments || 'No reviewer comments logged.'}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                              {canAcceptDeliverables(role) && (
                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleDeliverableReview(d.id, 'Accepted')}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0', padding: '2px 6px', fontSize: '0.6875rem' }}
                                    title="Accept Deliverable"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleDeliverableReview(d.id, 'Revision Required')}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#FDE68A', padding: '2px 6px', fontSize: '0.6875rem' }}
                                    title="Request Revision"
                                  >
                                    Revise
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Defect Tracking Log */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Defect Tracking Log & Quality Gates
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>ID & Title</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Severity</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woDefects.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            Zero open defects recorded. Quality criteria healthy.
                          </td>
                        </tr>
                      ) : (
                        woDefects.map(def => (
                          <tr key={def.id}>
                            <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)' }}>{def.id}</div>
                              <div>{def.title}</div>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${def.severity === 'Critical' ? 'badge-danger' : def.severity === 'High' ? 'badge-warning' : 'badge-default'}`}>
                                {def.severity}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${def.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                                {def.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {def.description}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                              {def.status !== 'Resolved' && (
                                <button
                                  onClick={() => updateDefect(def.id, { status: 'Resolved', resolvedAt: '2026-10-14' })}
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: DEPLOYMENT / CLOSURE */}
          {activeTab === 'deployment-closure' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Golden Record C & General Closure Evidence Workspace */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--color-brand-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--color-success)' }} />
                    Production Deployment Readiness & Formal Closure Evidence
                  </h3>
                  <span className={`badge ${wo.lifecycleStatus === 'Closed' ? 'badge-success' : 'badge-default'}`}>
                    {wo.lifecycleStatus === 'Closed' ? 'Closure Completed' : `Lifecycle: ${wo.lifecycleStatus}`}
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Section 15.5 Mandate: Closure requires formal acceptance, handover, operational documentation, and access-revocation evidence. A Work Order cannot be closed merely by pressing a button without full audit verification.
                </p>

                {/* 4 Pillars of Closure Evidence */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {/* Pillar 1: Acceptance Evidence */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: wo.lifecycleStatus === 'Closed' ? '#F0FDF4' : 'var(--color-bg)',
                    borderRadius: '8px',
                    border: wo.lifecycleStatus === 'Closed' ? '1px solid #BBF7D0' : '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={18} style={{ color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-text-muted)' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-brand-dark)' }}>
                        1. Business UAT Acceptance
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {wo.lifecycleStatus === 'Closed'
                        ? 'Formally accepted and signed off by Mona Al-Ghamdi (Business Owner) with zero Severity 1 or 2 defects open.'
                        : 'Requires 100% accepted deliverables and UAT sign-off prior to closure authorization.'}
                    </div>
                    {wo.lifecycleStatus === 'Closed' && (
                      <div style={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        EVIDENCE REF: UAT-CERT-2026-00119-FINAL.pdf
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: Operational Handover */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: wo.lifecycleStatus === 'Closed' ? '#F0FDF4' : 'var(--color-bg)',
                    borderRadius: '8px',
                    border: wo.lifecycleStatus === 'Closed' ? '1px solid #BBF7D0' : '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileCheck size={18} style={{ color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-text-muted)' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-brand-dark)' }}>
                        2. Operational Handover & Runbook
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {wo.lifecycleStatus === 'Closed'
                        ? 'Handover session completed with ASMO IT Operations. Standard Operating Procedures (SOP) and incident playbooks verified.'
                        : 'Operations and support runbooks must be accepted by IT Operations before hypercare ends.'}
                    </div>
                    {wo.lifecycleStatus === 'Closed' && (
                      <div style={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        EVIDENCE REF: ASMO-RUNBOOK-FIN-AUTO-v2.1.docx
                      </div>
                    )}
                  </div>

                  {/* Pillar 3: Access Revocation */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: wo.lifecycleStatus === 'Closed' ? '#F0FDF4' : 'var(--color-bg)',
                    borderRadius: '8px',
                    border: wo.lifecycleStatus === 'Closed' ? '1px solid #BBF7D0' : '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Lock size={18} style={{ color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-text-muted)' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-brand-dark)' }}>
                        3. SI Access & Credential Revocation
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {wo.lifecycleStatus === 'Closed'
                        ? 'Temporary elevated build/deploy credentials and SI partner VPN accounts successfully decommissioned and audited.'
                        : 'All external vendor access tokens and test environments must be securely dismantled upon completion.'}
                    </div>
                    {wo.lifecycleStatus === 'Closed' && (
                      <div style={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        AUDIT CERT: CYBER-ACCESS-REVOKE-2026-10-02.log
                      </div>
                    )}
                  </div>

                  {/* Pillar 4: Commercial Settlement */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: wo.lifecycleStatus === 'Closed' ? '#F0FDF4' : 'var(--color-bg)',
                    borderRadius: '8px',
                    border: wo.lifecycleStatus === 'Closed' ? '1px solid #BBF7D0' : '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <DollarSign size={18} style={{ color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-text-muted)' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: wo.lifecycleStatus === 'Closed' ? '#166534' : 'var(--color-brand-dark)' }}>
                        4. Final Commercial Settlement & PO Close
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {wo.lifecycleStatus === 'Closed'
                        ? '100% payment milestones verified. Retainage released and Purchase Order formally closed in ERP financial register.'
                        : 'All milestone invoices must be reconciled before final commercial sign-off.'}
                    </div>
                    {wo.lifecycleStatus === 'Closed' && (
                      <div style={{ fontSize: '0.6875rem', color: '#166534', fontWeight: 700, marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        ERP PO CLOSE REF: SAP-PO-8849102-SETTLED
                      </div>
                    )}
                  </div>
                </div>

                {/* Closure Summary Box */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-dark)', marginBottom: '0.375rem' }}>
                    Governance Closure Summary & Archive Reference
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Work Order ID: <strong>{wo.id}</strong> • Business Owner: <strong>{businessOwner?.name || wo.businessOwnerId}</strong> • Service Category: <strong>{service?.name || wo.serviceCategoryId}</strong>
                    <br />
                    All contractual deliverables received, verified against criteria, and committed to the corporate knowledge repository.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ACTIVITY / AUDIT */}
          {activeTab === 'activity-audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Associated Change Requests */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-brand-dark)' }}>
                    Work Order Change Requests ({woChangeRequests.length})
                  </h3>
                  {canManageChangeRequests(role) && !['Closed', 'Cancelled'].includes(wo.lifecycleStatus) && (
                    <button
                      onClick={() => setIsChangeRequestOpen(true)}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Plus size={14} /> Raise Change Request
                    </button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>CR ID</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Schedule Impact</th>
                        <th style={{ textAlign: 'right', padding: '0.625rem 0.75rem' }}>Cost Impact (SAR)</th>
                        <th style={{ textAlign: 'left', padding: '0.625rem 0.75rem' }}>Status</th>
                        <th style={{ textAlign: 'center', padding: '0.625rem 0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {woChangeRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No change requests raised for this Work Order.
                          </td>
                        </tr>
                      ) : (
                        woChangeRequests.map(cr => (
                          <tr key={cr.id}>
                            <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                              {cr.id}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>{cr.changeDescription}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{cr.businessJustification}</div>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.75rem' }}>{cr.scheduleImpact}</td>
                            <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                              {cr.commercialImpact.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span className={`badge ${cr.status === 'Approved' ? 'badge-success' : cr.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                {cr.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center' }}>
                              {cr.status === 'Raised' && (
                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => reviewChangeRequest(cr.id, 'Approved', 'Approved by governance board')}
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: '0.6875rem', padding: '2px 6px', color: '#059669' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => reviewChangeRequest(cr.id, 'Rejected', 'Rejected due to budget constraints')}
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: '0.6875rem', padding: '2px 6px', color: '#B42318' }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chronological Audit Trail */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-brand-dark)' }}>
                  Chronological Governance Audit Trail
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {woAuditEvents.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No audit events logged yet.
                    </div>
                  ) : (
                    woAuditEvents.map((evt, idx) => (
                      <div
                        key={evt.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '0.875rem',
                          backgroundColor: 'var(--color-bg)',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-bg)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-dark)' }}>
                              {evt.action}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                              {evt.timestamp}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                            {evt.details}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-dark)', marginTop: '0.25rem' }}>
                            Actor: <strong>{evt.actor}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modals Mounted */}
          <OnHoldModal
            workOrder={wo}
            isOpen={isOnHoldOpen}
            onClose={() => setIsOnHoldOpen(false)}
          />

          <ResumeModal
            workOrder={wo}
            isOpen={isResumeOpen}
            onClose={() => setIsResumeOpen(false)}
          />

          <AuthorisationModal
            workOrder={wo}
            isOpen={isAuthorisationOpen}
            onClose={() => setIsAuthorisationOpen(false)}
          />

          <ProposalModal
            workOrder={wo}
            isOpen={isProposalOpen}
            onClose={() => setIsProposalOpen(false)}
          />

          <ChangeRequestModal
            workOrder={wo}
            isOpen={isChangeRequestOpen}
            onClose={() => setIsChangeRequestOpen(false)}
          />

          {selectedReviewTask && (
            <ReviewModal
              task={selectedReviewTask}
              workOrder={wo}
              isOpen={Boolean(selectedReviewTask)}
              onClose={() => setSelectedReviewTask(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkOrderDetail;
