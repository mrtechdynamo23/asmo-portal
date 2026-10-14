// ==========================================================================
// ASMO Work Order Control Tower — Central Zustand Store
// ==========================================================================
import { create } from 'zustand';
import {
  User, ServiceDefinition, WorkOrder, ProposalVersion, ReviewTask,
  ApprovalDecision, Authorisation, TeamAssignment, Milestone, Deliverable,
  RAIDRecord, Defect, TestRecord, ChangeRequest, CommercialLine,
  PaymentMilestone, TimesheetEntry, ActionItem, Notification, AuditEvent,
  LifecycleStatus, ReviewDecision, DeliverableStatus, ChangeRequestStatus, DefectStatus,
  RAIDType, Priority
} from '../types';

import { seedUsers } from '../data/users';
import { seedServiceDefinitions } from '../data/services';
import { seedWorkOrders } from '../data/workOrders';
import {
  seedMilestones, seedDeliverables, seedRAIDRecords, seedProposalVersions,
  seedReviewTasks, seedAuthorisations, seedActionItems, seedNotifications,
  seedChangeRequests, seedCommercialLines, seedPaymentMilestones,
  seedTeamAssignments, seedDefects, seedTestRecords, seedTimesheetEntries,
  seedApprovalDecisions, seedAuditEvents
} from '../data/supporting';
import { getNextAction } from '../services/workflow';

interface StoreState {
  users: User[];
  currentUser: User;
  serviceDefinitions: ServiceDefinition[];
  workOrders: WorkOrder[];
  proposalVersions: ProposalVersion[];
  reviewTasks: ReviewTask[];
  approvalDecisions: ApprovalDecision[];
  authorisations: Authorisation[];
  teamAssignments: TeamAssignment[];
  milestones: Milestone[];
  deliverables: Deliverable[];
  raidRecords: RAIDRecord[];
  defects: Defect[];
  testRecords: TestRecord[];
  changeRequests: ChangeRequest[];
  commercialLines: CommercialLine[];
  paymentMilestones: PaymentMilestone[];
  timesheetEntries: TimesheetEntry[];
  actionItems: ActionItem[];
  notifications: Notification[];
  auditEvents: AuditEvent[];

  // Actions
  setCurrentUser: (user: User) => void;
  setCurrentUserById: (userId: string) => void;

  // Work Order actions
  addWorkOrder: (wo: Partial<WorkOrder>) => WorkOrder;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  transitionWorkOrder: (id: string, newStatus: LifecycleStatus, comments?: string) => void;
  setWorkOrderHold: (id: string, reason: string, expectedResumeDate: string) => void;
  resumeWorkOrder: (id: string, resumeNotes?: string) => void;

  // Proposals & Reviews
  submitProposal: (proposal: Omit<ProposalVersion, 'id' | 'submittedAt' | 'versionNumber' | 'status'>) => void;
  recordReviewDecision: (taskId: string, decision: ReviewDecision, comments: string) => void;

  // Approvals & Authorisations
  recordApprovalDecision: (woId: string, decision: 'Approved' | 'Rejected' | 'Deferred', comments: string) => void;
  recordAuthorisation: (auth: Omit<Authorisation, 'id' | 'authorisedAt' | 'authorisedBy'>) => void;

  // Delivery & Milestones
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  addDeliverable: (deliv: Omit<Deliverable, 'id'>) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  reviewDeliverable: (id: string, status: DeliverableStatus, comments: string) => void;

  // RAID, Defects & Changes
  addRAIDRecord: (record: Omit<RAIDRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRAIDRecord: (id: string, updates: Partial<RAIDRecord>) => void;
  addDefect: (defect: Omit<Defect, 'id' | 'reportedAt'>) => void;
  updateDefect: (id: string, updates: Partial<Defect>) => void;
  addChangeRequest: (cr: Omit<ChangeRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reviewDecisions'>) => void;
  reviewChangeRequest: (id: string, decision: 'Approved' | 'Rejected', comments: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Audit
  logAuditEvent: (woId: string, eventType: AuditEvent['eventType'], action: string, details: string, prev?: string, next?: string) => void;

  // Global reset
  resetToSeedData: () => void;
}

const STORAGE_KEY = 'asmo_control_tower_state_v1';

// Initial default state
const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that parsed contains workOrders
      if (parsed.workOrders && parsed.workOrders.length > 0) {
        return {
          users: parsed.users || seedUsers,
          currentUser: parsed.currentUser || seedUsers[1], // Noura Al-Subaie
          serviceDefinitions: parsed.serviceDefinitions || seedServiceDefinitions,
          workOrders: parsed.workOrders || seedWorkOrders,
          proposalVersions: parsed.proposalVersions || seedProposalVersions,
          reviewTasks: parsed.reviewTasks || seedReviewTasks,
          approvalDecisions: parsed.approvalDecisions || seedApprovalDecisions,
          authorisations: parsed.authorisations || seedAuthorisations,
          teamAssignments: parsed.teamAssignments || seedTeamAssignments,
          milestones: parsed.milestones || seedMilestones,
          deliverables: parsed.deliverables || seedDeliverables,
          raidRecords: parsed.raidRecords || seedRAIDRecords,
          defects: parsed.defects || seedDefects,
          testRecords: parsed.testRecords || seedTestRecords,
          changeRequests: parsed.changeRequests || seedChangeRequests,
          commercialLines: parsed.commercialLines || seedCommercialLines,
          paymentMilestones: parsed.paymentMilestones || seedPaymentMilestones,
          timesheetEntries: parsed.timesheetEntries || seedTimesheetEntries,
          actionItems: parsed.actionItems || seedActionItems,
          notifications: parsed.notifications || seedNotifications,
          auditEvents: parsed.auditEvents || seedAuditEvents,
        };
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage, using seed data', e);
  }

  return {
    users: seedUsers,
    currentUser: seedUsers[1], // Noura Al-Subaie (Work Order Manager)
    serviceDefinitions: seedServiceDefinitions,
    workOrders: seedWorkOrders,
    proposalVersions: seedProposalVersions,
    reviewTasks: seedReviewTasks,
    approvalDecisions: seedApprovalDecisions,
    authorisations: seedAuthorisations,
    teamAssignments: seedTeamAssignments,
    milestones: seedMilestones,
    deliverables: seedDeliverables,
    raidRecords: seedRAIDRecords,
    defects: seedDefects,
    testRecords: seedTestRecords,
    changeRequests: seedChangeRequests,
    commercialLines: seedCommercialLines,
    paymentMilestones: seedPaymentMilestones,
    timesheetEntries: seedTimesheetEntries,
    actionItems: seedActionItems,
    notifications: seedNotifications,
    auditEvents: seedAuditEvents,
  };
};

export const useStore = create<StoreState>((set, get) => {
  const initialState = getInitialState();

  const persist = (nextState: Partial<StoreState>) => {
    try {
      const full = { ...get(), ...nextState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  return {
    ...initialState,

    setCurrentUser: (user: User) => {
      set({ currentUser: user });
      persist({ currentUser: user });
    },

    setCurrentUserById: (userId: string) => {
      const found = get().users.find(u => u.id === userId);
      if (found) {
        set({ currentUser: found });
        persist({ currentUser: found });
      }
    },

    addWorkOrder: (woData: Partial<WorkOrder>) => {
      const state = get();
      const count = state.workOrders.length + 141;
      const nextId = `WO-ASMO-2026-00${count}`;
      const now = '2026-10-14T10:00:00Z';

      const newWO: WorkOrder = {
        id: nextId,
        title: woData.title || 'Untitled Work Order',
        businessOwnerId: woData.businessOwnerId || state.currentUser.id,
        requestingBusinessUnit: woData.requestingBusinessUnit || 'Operations',
        serviceCategoryId: woData.serviceCategoryId || 'SVC-001',
        businessJustification: woData.businessJustification || '',
        businessOutcome: woData.businessOutcome || '',
        priority: woData.priority || 'Medium',
        lifecycleStatus: woData.lifecycleStatus || 'Draft',
        isOnHold: false,
        deliveryPhase: woData.deliveryPhase || 'Pre-Execution',
        commercialModel: woData.commercialModel || 'Lump Sum',
        proposedValue: woData.proposedValue || 0,
        approvedValue: null,
        authorisedValue: null,
        forecastFinalValue: woData.proposedValue || 0,
        siPartnerId: 'PARTNER-001',
        siPartnerName: 'Nexus Consulting',
        scopeDescription: woData.scopeDescription || '',
        inScopeActivities: woData.inScopeActivities || [],
        outOfScopeActivities: woData.outOfScopeActivities || [],
        assumptions: woData.assumptions || [],
        dependencies: woData.dependencies || [],
        expectedDeliverables: woData.expectedDeliverables || [],
        acceptanceCriteria: woData.acceptanceCriteria || [],
        plannedStartDate: woData.plannedStartDate || '2026-11-01',
        plannedEndDate: woData.plannedEndDate || '2027-04-30',
        deliveryProgress: 0,
        riskHealth: 'Green',
        createdBy: state.currentUser.id,
        createdAt: now,
        updatedAt: now,
        nextAction: 'Complete draft or submit demand for qualification',
      };

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: newWO.id,
        eventType: 'created',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: 'Work Order Created',
        details: `Created Work Order "${newWO.title}" in status ${newWO.lifecycleStatus}.`,
        newValue: newWO.lifecycleStatus,
      };

      const leadOwner = newWO.deliveryLeadId || newWO.businessOwnerId || 'USR-007';

      const initialMs: Milestone[] = [
        {
          id: `MS-${newWO.id.slice(-3)}-01`,
          workOrderId: newWO.id,
          name: 'Demand Initiation & Discovery Complete',
          description: 'Requirements validation and baseline architecture',
          phase: 'Discovery',
          plannedStartDate: newWO.plannedStartDate,
          plannedEndDate: '2026-11-20',
          ownerId: leadOwner,
          status: newWO.lifecycleStatus === 'Draft' ? 'Not Started' : 'In Progress',
          completionPercentage: newWO.lifecycleStatus === 'Draft' ? 0 : 25,
          dependencies: [],
          isOverdue: false,
        },
        {
          id: `MS-${newWO.id.slice(-3)}-02`,
          workOrderId: newWO.id,
          name: 'Solution Architecture & Design Sign-off',
          description: 'HLD and security schema sign-off',
          phase: 'Design',
          plannedStartDate: '2026-11-21',
          plannedEndDate: '2026-12-20',
          ownerId: leadOwner,
          status: 'Not Started',
          completionPercentage: 0,
          dependencies: [`MS-${newWO.id.slice(-3)}-01`],
          isOverdue: false,
        },
        {
          id: `MS-${newWO.id.slice(-3)}-03`,
          workOrderId: newWO.id,
          name: 'Core Application & Module Implementation',
          description: 'Core logic implementation & unit tests',
          phase: 'Build',
          plannedStartDate: '2026-12-21',
          plannedEndDate: '2027-02-28',
          ownerId: leadOwner,
          status: 'Not Started',
          completionPercentage: 0,
          dependencies: [`MS-${newWO.id.slice(-3)}-02`],
          isOverdue: false,
        },
      ];

      const initialDelivs: Deliverable[] = (newWO.expectedDeliverables && newWO.expectedDeliverables.length > 0
        ? newWO.expectedDeliverables
        : ['Solution Architecture & Technical Design Document', 'Core Application Codebase', 'User Acceptance Testing (UAT) Sign-Off Certificate']
      ).map((name, idx) => ({
        id: `DEL-${newWO.id.slice(-3)}-0${idx + 1}`,
        workOrderId: newWO.id,
        name,
        type: idx === 0 ? 'Architecture Blueprint' : idx === 1 ? 'Code Release' : 'Sign-Off Certificate',
        ownerId: leadOwner,
        plannedSubmissionDate: idx === 0 ? '2026-11-20' : newWO.plannedEndDate,
        reviewStatus: 'Not Started',
        reviewerComments: 'Pending deliverable submission and review',
        acceptanceCriteria: ['Adherence to specification', 'Security compliance'],
        revisionHistory: [],
      }));

      const initialRaids: RAIDRecord[] = (newWO.dependencies && newWO.dependencies.length > 0
        ? newWO.dependencies
        : ['Staging environment access provisioning lead time', 'Client API specifications availability']
      ).map((desc, idx) => ({
        id: `RAID-${newWO.id.slice(-3)}-0${idx + 1}`,
        workOrderId: newWO.id,
        type: (idx % 2 === 0 ? 'Risk' : 'Dependency') as RAIDType,
        description: desc,
        ownerId: newWO.businessOwnerId || 'USR-003',
        priority: 'Medium' as Priority,
        severity: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
        impact: 'May impact delivery milestones if unmitigated',
        mitigationPlan: 'Active tracking and technical governance escalation',
        status: 'Open',
        createdAt: now,
        updatedAt: now,
      }));

      const updatedWOs = [newWO, ...state.workOrders];
      const updatedAudits = [audit, ...state.auditEvents];
      const updatedMilestones = [...state.milestones, ...initialMs];
      const updatedDeliverables = [...state.deliverables, ...initialDelivs];
      const updatedRAID = [...state.raidRecords, ...initialRaids];

      set({
        workOrders: updatedWOs,
        auditEvents: updatedAudits,
        milestones: updatedMilestones,
        deliverables: updatedDeliverables,
        raidRecords: updatedRAID,
      });

      persist({
        workOrders: updatedWOs,
        auditEvents: updatedAudits,
        milestones: updatedMilestones,
        deliverables: updatedDeliverables,
        raidRecords: updatedRAID,
      });

      return newWO;
    },

    updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => {
      const state = get();
      const updatedWOs = state.workOrders.map(wo => {
        if (wo.id === id) {
          const updated = { ...wo, ...updates, updatedAt: '2026-10-14T12:00:00Z' };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return wo;
      });
      set({ workOrders: updatedWOs });
      persist({ workOrders: updatedWOs });
    },

    transitionWorkOrder: (id: string, newStatus: LifecycleStatus, comments?: string) => {
      const state = get();
      const wo = state.workOrders.find(w => w.id === id);
      if (!wo) return;

      const prevStatus = wo.lifecycleStatus;
      const now = '2026-10-14T14:30:00Z';

      let newPhase = wo.deliveryPhase;
      if (['Discovery', 'Design', 'Build', 'Validate', 'Deploy'].includes(newStatus)) {
        newPhase = newStatus as any;
      } else if (newStatus === 'Stabilise') {
        newPhase = 'Stabilize & Close';
      } else if (newStatus === 'Closed') {
        newPhase = 'Stabilize & Close';
      }

      const updatedWOs = state.workOrders.map(w => {
        if (w.id === id) {
          const updated = {
            ...w,
            lifecycleStatus: newStatus,
            deliveryPhase: newPhase,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: id,
        eventType: 'status_change',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `Status Transition: ${prevStatus} → ${newStatus}`,
        details: comments || `Work order status advanced from ${prevStatus} to ${newStatus}.`,
        previousValue: prevStatus,
        newValue: newStatus,
      };

      const updatedAudits = [audit, ...state.auditEvents];

      set({ workOrders: updatedWOs, auditEvents: updatedAudits });
      persist({ workOrders: updatedWOs, auditEvents: updatedAudits });
    },

    setWorkOrderHold: (id: string, reason: string, expectedResumeDate: string) => {
      const state = get();
      const wo = state.workOrders.find(w => w.id === id);
      if (!wo) return;

      const now = '2026-10-14T15:00:00Z';
      const updatedWOs = state.workOrders.map(w => {
        if (w.id === id) {
          return {
            ...w,
            isOnHold: true,
            holdReason: reason,
            holdOwnerId: state.currentUser.id,
            holdExpectedResumeDate: expectedResumeDate,
            previousStatusBeforeHold: w.lifecycleStatus,
            updatedAt: now,
            nextAction: `ON HOLD: ${reason}`,
          };
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: id,
        eventType: 'hold',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: 'Work Order Placed On Hold',
        details: `Reason: ${reason}. Expected resume: ${expectedResumeDate}`,
        previousValue: wo.lifecycleStatus,
        newValue: 'On Hold',
      };

      const updatedAudits = [audit, ...state.auditEvents];
      set({ workOrders: updatedWOs, auditEvents: updatedAudits });
      persist({ workOrders: updatedWOs, auditEvents: updatedAudits });
    },

    resumeWorkOrder: (id: string, resumeNotes?: string) => {
      const state = get();
      const wo = state.workOrders.find(w => w.id === id);
      if (!wo || !wo.isOnHold) return;

      const now = '2026-10-14T16:00:00Z';
      const originalStatus = wo.previousStatusBeforeHold || wo.lifecycleStatus;

      const updatedWOs = state.workOrders.map(w => {
        if (w.id === id) {
          const updated = {
            ...w,
            isOnHold: false,
            holdReason: undefined,
            holdOwnerId: undefined,
            holdExpectedResumeDate: undefined,
            previousStatusBeforeHold: undefined,
            lifecycleStatus: originalStatus,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: id,
        eventType: 'resume',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: 'Work Order Resumed',
        details: resumeNotes || `Resumed from On Hold back to active status: ${originalStatus}.`,
        previousValue: 'On Hold',
        newValue: originalStatus,
      };

      const updatedAudits = [audit, ...state.auditEvents];
      set({ workOrders: updatedWOs, auditEvents: updatedAudits });
      persist({ workOrders: updatedWOs, auditEvents: updatedAudits });
    },

    submitProposal: (proposalData) => {
      const state = get();
      const now = '2026-10-14T11:00:00Z';
      const existing = state.proposalVersions.filter(p => p.workOrderId === proposalData.workOrderId);
      const versionNumber = existing.length + 1;

      const newProposal: ProposalVersion = {
        ...proposalData,
        id: `PROP-${Date.now()}`,
        versionNumber,
        submittedAt: now,
        status: 'Submitted',
      };

      // Mark older versions as Superseded
      const updatedProposals = state.proposalVersions.map(p =>
        p.workOrderId === proposalData.workOrderId ? { ...p, status: 'Superseded' as const } : p
      );
      updatedProposals.push(newProposal);

      // Create new review tasks
      const reviewTypes: ('Technical' | 'Commercial' | 'Architecture' | 'Cybersecurity')[] = [
        'Technical', 'Commercial', 'Architecture', 'Cybersecurity'
      ];
      const reviewerMap: Record<string, string> = {
        'Technical': 'USR-005',
        'Architecture': 'USR-005',
        'Cybersecurity': 'USR-006',
        'Commercial': 'USR-004',
      };

      const newTasks: ReviewTask[] = reviewTypes.map((rt, idx) => ({
        id: `REV-${Date.now()}-${idx}`,
        workOrderId: proposalData.workOrderId,
        proposalVersionId: newProposal.id,
        reviewType: rt,
        reviewerId: reviewerMap[rt] || 'USR-002',
        decision: 'Pending',
        comments: '',
        createdAt: now,
        dueDate: '2026-10-21',
      }));

      // Update work order status to Proposal Submitted or Under Review
      const updatedWOs = state.workOrders.map(w => {
        if (w.id === proposalData.workOrderId) {
          const updated = {
            ...w,
            lifecycleStatus: 'Proposal Submitted' as LifecycleStatus,
            proposedValue: proposalData.proposedValue,
            forecastFinalValue: proposalData.proposedValue,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: proposalData.workOrderId,
        eventType: 'proposal_submitted',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `Proposal Submitted (v${versionNumber})`,
        details: `Proposal v${versionNumber} submitted by ${proposalData.submittedBy}. Value: SAR ${proposalData.proposedValue.toLocaleString()}`,
        newValue: `v${versionNumber}`,
      };

      set({
        proposalVersions: updatedProposals,
        reviewTasks: [...state.reviewTasks, ...newTasks],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
      persist({
        proposalVersions: updatedProposals,
        reviewTasks: [...state.reviewTasks, ...newTasks],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
    },

    recordReviewDecision: (taskId: string, decision: ReviewDecision, comments: string) => {
      const state = get();
      const now = '2026-10-14T14:00:00Z';
      const task = state.reviewTasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTasks = state.reviewTasks.map(t =>
        t.id === taskId ? { ...t, decision, comments, decidedAt: now } : t
      );

      // Check if all reviews for this work order are completed
      const woTasks = updatedTasks.filter(t => t.workOrderId === task.workOrderId);
      const allApproved = woTasks.every(t => t.decision === 'Approved');
      const anyRevision = woTasks.some(t => t.decision === 'Revision Required');
      const anyRejected = woTasks.some(t => t.decision === 'Rejected');

      let targetStatus: LifecycleStatus | null = null;
      if (anyRejected) {
        targetStatus = 'Rejected';
      } else if (anyRevision) {
        targetStatus = 'Revision Required';
      } else if (allApproved && woTasks.length >= 3) {
        targetStatus = 'Approved';
      } else {
        targetStatus = 'Under Review';
      }

      const updatedWOs = state.workOrders.map(w => {
        if (w.id === task.workOrderId) {
          const status = targetStatus || w.lifecycleStatus;
          const updated = {
            ...w,
            lifecycleStatus: status,
            approvedValue: status === 'Approved' ? w.proposedValue : w.approvedValue,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: task.workOrderId,
        eventType: 'review_decision',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `${task.reviewType} Review: ${decision}`,
        details: comments || `Review decided as ${decision}.`,
        newValue: decision,
      };

      set({
        reviewTasks: updatedTasks,
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
      persist({
        reviewTasks: updatedTasks,
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
    },

    recordApprovalDecision: (woId: string, decision: 'Approved' | 'Rejected' | 'Deferred', comments: string) => {
      const state = get();
      const now = '2026-10-14T15:30:00Z';

      const approval: ApprovalDecision = {
        id: `APP-${Date.now()}`,
        workOrderId: woId,
        approverId: state.currentUser.id,
        decision,
        comments,
        decidedAt: now,
        approvalType: 'Governance Board Approval',
      };

      const targetStatus: LifecycleStatus = decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : 'Under Review';

      const updatedWOs = state.workOrders.map(w => {
        if (w.id === woId) {
          const updated = {
            ...w,
            lifecycleStatus: targetStatus,
            approvedValue: targetStatus === 'Approved' ? w.proposedValue : w.approvedValue,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: woId,
        eventType: 'approval',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `Governance Approval: ${decision}`,
        details: comments,
        newValue: decision,
      };

      set({
        approvalDecisions: [approval, ...state.approvalDecisions],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
      persist({
        approvalDecisions: [approval, ...state.approvalDecisions],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
    },

    recordAuthorisation: (authData) => {
      const state = get();
      const now = '2026-10-14T16:00:00Z';

      const auth: Authorisation = {
        ...authData,
        id: `AUTH-${Date.now()}`,
        authorisedBy: state.currentUser.id,
        authorisedAt: now,
      };

      const updatedWOs = state.workOrders.map(w => {
        if (w.id === authData.workOrderId) {
          const updated = {
            ...w,
            lifecycleStatus: 'Authorised' as LifecycleStatus,
            authorisedValue: authData.authorisedValue,
            approvedValue: authData.authorisedValue,
            updatedAt: now,
          };
          updated.nextAction = getNextAction(updated);
          return updated;
        }
        return w;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: authData.workOrderId,
        eventType: 'authorisation',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `Work Order Formally Authorised (PO: ${authData.releasePOReference})`,
        details: `Authorised value: SAR ${authData.authorisedValue.toLocaleString()}. Evidence: ${authData.evidenceName}`,
        newValue: 'Authorised',
      };

      set({
        authorisations: [auth, ...state.authorisations],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
      persist({
        authorisations: [auth, ...state.authorisations],
        workOrders: updatedWOs,
        auditEvents: [audit, ...state.auditEvents],
      });
    },

    addMilestone: (m) => {
      const state = get();
      const newM: Milestone = {
        ...m,
        id: `MS-${Date.now()}`,
      };
      const updated = [...state.milestones, newM];
      set({ milestones: updated });
      persist({ milestones: updated });
    },

    updateMilestone: (id: string, updates: Partial<Milestone>) => {
      const state = get();
      const updated = state.milestones.map(m => (m.id === id ? { ...m, ...updates } : m));
      set({ milestones: updated });
      persist({ milestones: updated });
    },

    addDeliverable: (d) => {
      const state = get();
      const newD: Deliverable = {
        ...d,
        id: `DEL-${Date.now()}`,
      };
      const updated = [...state.deliverables, newD];
      set({ deliverables: updated });
      persist({ deliverables: updated });
    },

    updateDeliverable: (id: string, updates: Partial<Deliverable>) => {
      const state = get();
      const updated = state.deliverables.map(d => (d.id === id ? { ...d, ...updates } : d));
      set({ deliverables: updated });
      persist({ deliverables: updated });
    },

    reviewDeliverable: (id: string, status: DeliverableStatus, comments: string) => {
      const state = get();
      const target = state.deliverables.find(d => d.id === id);
      if (!target) return;

      const now = '2026-10-14T16:30:00Z';
      const updated = state.deliverables.map(d => {
        if (d.id === id) {
          const revs = d.revisionHistory || [];
          return {
            ...d,
            reviewStatus: status,
            reviewerId: state.currentUser.id,
            reviewerComments: comments,
            revisionHistory: [...revs, { version: revs.length + 1, submittedAt: now, comments }],
          };
        }
        return d;
      });

      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: target.workOrderId,
        eventType: status === 'Accepted' ? 'deliverable_accepted' : 'deliverable_rejected',
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: now,
        action: `Deliverable Review: ${target.name} → ${status}`,
        details: comments,
        newValue: status,
      };

      set({ deliverables: updated, auditEvents: [audit, ...state.auditEvents] });
      persist({ deliverables: updated, auditEvents: [audit, ...state.auditEvents] });
    },

    addRAIDRecord: (record) => {
      const state = get();
      const now = '2026-10-14T10:00:00Z';
      const newRecord: RAIDRecord = {
        ...record,
        id: `RAID-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newRecord, ...state.raidRecords];
      set({ raidRecords: updated });
      persist({ raidRecords: updated });
    },

    updateRAIDRecord: (id: string, updates: Partial<RAIDRecord>) => {
      const state = get();
      const updated = state.raidRecords.map(r =>
        r.id === id ? { ...r, ...updates, updatedAt: '2026-10-14T16:00:00Z' } : r
      );
      set({ raidRecords: updated });
      persist({ raidRecords: updated });
    },

    addDefect: (defect) => {
      const state = get();
      const newD: Defect = {
        ...defect,
        id: `DEF-${Date.now()}`,
        reportedAt: '2026-10-14T11:00:00Z',
      };
      const updated = [newD, ...state.defects];
      set({ defects: updated });
      persist({ defects: updated });
    },

    updateDefect: (id: string, updates: Partial<Defect>) => {
      const state = get();
      const updated = state.defects.map(d => (d.id === id ? { ...d, ...updates } : d));
      set({ defects: updated });
      persist({ defects: updated });
    },

    addChangeRequest: (cr) => {
      const state = get();
      const now = '2026-10-14T14:00:00Z';
      const newCR: ChangeRequest = {
        ...cr,
        id: `CR-${Date.now()}`,
        status: 'Raised',
        reviewDecisions: [],
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newCR, ...state.changeRequests];
      set({ changeRequests: updated });
      persist({ changeRequests: updated });
    },

    reviewChangeRequest: (id: string, decision: 'Approved' | 'Rejected', comments: string) => {
      const state = get();
      const now = '2026-10-14T15:00:00Z';
      const updated = state.changeRequests.map(cr => {
        if (cr.id === id) {
          return {
            ...cr,
            status: (decision === 'Approved' ? 'Approved' : 'Rejected') as ChangeRequestStatus,
            reviewDecisions: [
              ...cr.reviewDecisions,
              {
                reviewerId: state.currentUser.id,
                decision,
                comments,
                decidedAt: now,
              },
            ],
            updatedAt: now,
          };
        }
        return cr;
      });
      set({ changeRequests: updated });
      persist({ changeRequests: updated });
    },

    markNotificationRead: (id: string) => {
      const state = get();
      const updated = state.notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
      set({ notifications: updated });
      persist({ notifications: updated });
    },

    markAllNotificationsRead: () => {
      const state = get();
      const updated = state.notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated });
      persist({ notifications: updated });
    },

    logAuditEvent: (woId, eventType, action, details, prev, next) => {
      const state = get();
      const audit: AuditEvent = {
        id: `EVT-${Date.now()}`,
        workOrderId: woId,
        eventType,
        actor: state.currentUser.name,
        actorId: state.currentUser.id,
        timestamp: '2026-10-14T16:00:00Z',
        action,
        details,
        previousValue: prev,
        newValue: next,
      };
      const updated = [audit, ...state.auditEvents];
      set({ auditEvents: updated });
      persist({ auditEvents: updated });
    },

    resetToSeedData: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Error clearing localStorage', e);
      }
      set({
        users: seedUsers,
        currentUser: seedUsers[1], // Noura Al-Subaie
        serviceDefinitions: seedServiceDefinitions,
        workOrders: seedWorkOrders,
        proposalVersions: seedProposalVersions,
        reviewTasks: seedReviewTasks,
        approvalDecisions: seedApprovalDecisions,
        authorisations: seedAuthorisations,
        teamAssignments: seedTeamAssignments,
        milestones: seedMilestones,
        deliverables: seedDeliverables,
        raidRecords: seedRAIDRecords,
        defects: seedDefects,
        testRecords: seedTestRecords,
        changeRequests: seedChangeRequests,
        commercialLines: seedCommercialLines,
        paymentMilestones: seedPaymentMilestones,
        timesheetEntries: seedTimesheetEntries,
        actionItems: seedActionItems,
        notifications: seedNotifications,
        auditEvents: seedAuditEvents,
      });
    },
  };
});
