// ==========================================================================
// ASMO Work Order Control Tower — Central Type Definitions
// ==========================================================================

/** All possible lifecycle statuses for a Work Order */
export type LifecycleStatus =
  | 'Draft'
  | 'Submitted'
  | 'Qualified'
  | 'SoW Issued'
  | 'Proposal Submitted'
  | 'Under Review'
  | 'Revision Required'
  | 'Approved'
  | 'Authorised'
  | 'Discovery'
  | 'Design'
  | 'Build'
  | 'Validate'
  | 'Deploy'
  | 'Stabilise'
  | 'Closed'
  | 'Cancelled'
  | 'Rejected';

/** Delivery phases */
export type DeliveryPhase =
  | 'Pre-Execution'
  | 'Initiation'
  | 'Discovery'
  | 'Design'
  | 'Build'
  | 'Validate'
  | 'Deploy'
  | 'Stabilize & Close'
  | 'N/A';

/** Priority levels */
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

/** Commercial models */
export type CommercialModel = 'Lump Sum' | 'Time & Materials';

/** Risk health indicator */
export type RiskHealth = 'Green' | 'Amber' | 'Red';

/** RAID record types */
export type RAIDType = 'Risk' | 'Assumption' | 'Issue' | 'Dependency';

/** Review types */
export type ReviewType = 'Technical' | 'Commercial' | 'Architecture' | 'Cybersecurity' | 'Data Privacy';

/** Review decisions */
export type ReviewDecision = 'Pending' | 'Approved' | 'Revision Required' | 'Rejected';

/** Approval status */
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Deferred';

/** Change request status */
export type ChangeRequestStatus = 'Raised' | 'Reviewed' | 'Approved' | 'Rejected' | 'Implemented';

/** Deliverable review status */
export type DeliverableStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Under Review' | 'Revision Required' | 'Accepted' | 'Rejected';

/** Defect severity */
export type DefectSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

/** Defect status */
export type DefectStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Deferred';

/** Milestone status */
export type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'At Risk';

/** Notification type */
export type NotificationType = 
  | 'review_assigned'
  | 'revision_requested'
  | 'approval_decision'
  | 'authorisation_complete'
  | 'milestone_approaching'
  | 'milestone_overdue'
  | 'deliverable_submitted'
  | 'acceptance_decision'
  | 'risk_escalation'
  | 'change_request_decision'
  | 'deployment_readiness'
  | 'closure_action'
  | 'status_change'
  | 'general';

/** Audit event types */
export type AuditEventType =
  | 'created'
  | 'status_change'
  | 'hold'
  | 'resume'
  | 'scope_change'
  | 'proposal_submitted'
  | 'proposal_revision'
  | 'review_decision'
  | 'approval'
  | 'authorisation'
  | 'milestone_change'
  | 'milestone_completed'
  | 'deliverable_submitted'
  | 'deliverable_accepted'
  | 'deliverable_rejected'
  | 'commercial_change'
  | 'risk_update'
  | 'deployment'
  | 'closure'
  | 'team_change'
  | 'change_request'
  | 'override'
  | 'comment';

/** User roles */
export type UserRole =
  | 'Admin'
  | 'Work Order Manager'
  | 'Business Owner'
  | 'Commercial Reviewer'
  | 'Technical / Architecture Reviewer'
  | 'Cybersecurity Reviewer'
  | 'SI Partner Delivery Lead'
  | 'Project Manager'
  | 'QA / Acceptance Reviewer'
  | 'Executive Read-only';

// ---------- Entity Interfaces ----------

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  scopeTemplate: string;
  standardDeliverables: string[];
  acceptanceCriteria: string[];
  requiredReviewers: ReviewType[];
  typicalPhases: DeliveryPhase[];
  indicativeDuration: string;
  commercialGuidance: string;
  isActive: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  businessOwnerId: string;
  requestingBusinessUnit: string;
  serviceCategoryId: string;
  businessJustification: string;
  businessOutcome: string;
  priority: Priority;
  lifecycleStatus: LifecycleStatus;
  isOnHold: boolean;
  holdReason?: string;
  holdOwnerId?: string;
  holdExpectedResumeDate?: string;
  previousStatusBeforeHold?: LifecycleStatus;
  deliveryPhase: DeliveryPhase;
  commercialModel: CommercialModel;
  proposedValue: number;
  approvedValue: number | null;
  authorisedValue: number | null;
  forecastFinalValue: number | null;
  siPartnerId: string;
  siPartnerName: string;
  scopeDescription: string;
  inScopeActivities: string[];
  outOfScopeActivities: string[];
  assumptions: string[];
  dependencies: string[];
  expectedDeliverables: string[];
  acceptanceCriteria: string[];
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  deliveryProgress: number;
  riskHealth: RiskHealth;
  deliveryLeadId?: string;
  projectManagerId?: string;
  architectureReviewerId?: string;
  cybersecurityReviewerId?: string;
  commercialReviewerId?: string;
  qaReviewerId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  nextAction?: string;
}

export interface ScopeItem {
  id: string;
  workOrderId: string;
  type: 'in-scope' | 'out-of-scope';
  description: string;
  order: number;
}

export interface ProposalVersion {
  id: string;
  workOrderId: string;
  versionNumber: number;
  submittedBy: string;
  submittedAt: string;
  technicalProposal: string;
  commercialProposal: string;
  keyPersonnel: string[];
  proposedMilestones: string;
  pricingModel: string;
  proposedValue: number;
  changeSummary?: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Revision Required' | 'Superseded';
}

export interface ReviewTask {
  id: string;
  workOrderId: string;
  proposalVersionId?: string;
  reviewType: ReviewType;
  reviewerId: string;
  decision: ReviewDecision;
  comments: string;
  decidedAt?: string;
  createdAt: string;
  dueDate?: string;
}

export interface ApprovalDecision {
  id: string;
  workOrderId: string;
  approverId: string;
  decision: ApprovalStatus;
  comments: string;
  decidedAt: string;
  approvalType: string;
}

export interface Authorisation {
  id: string;
  workOrderId: string;
  authorisedBy: string;
  authorisedAt: string;
  workOrderReference: string;
  releasePOReference: string;
  approvedScope: string;
  approvedDates: string;
  pricingBasis: string;
  authorisedValue: number;
  evidenceName: string;
  comments: string;
}

export interface TeamAssignment {
  id: string;
  workOrderId: string;
  userId: string;
  role: string;
  assignedAt: string;
  removedAt?: string;
  isActive: boolean;
}

export interface Milestone {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  ownerId: string;
  status: MilestoneStatus;
  completionPercentage: number;
  dependencies: string[];
  isOverdue: boolean;
  phase: DeliveryPhase;
}

export interface Deliverable {
  id: string;
  workOrderId: string;
  name: string;
  type: string;
  ownerId: string;
  plannedSubmissionDate: string;
  actualSubmissionDate?: string;
  acceptanceCriteria: string[];
  reviewStatus: DeliverableStatus;
  reviewerId?: string;
  reviewerComments: string;
  revisionHistory: { version: number; submittedAt: string; comments: string }[];
}

export interface RAIDRecord {
  id: string;
  workOrderId: string;
  type: RAIDType;
  description: string;
  ownerId: string;
  priority: Priority;
  probability?: 'High' | 'Medium' | 'Low';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  mitigationPlan: string;
  dueDate?: string;
  status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed' | 'Accepted';
  createdAt: string;
  updatedAt: string;
}

export interface Defect {
  id: string;
  workOrderId: string;
  deliverableId?: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  status: DefectStatus;
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  resolvedAt?: string;
}

export interface TestRecord {
  id: string;
  workOrderId: string;
  deliverableId?: string;
  testName: string;
  testType: 'Unit' | 'SIT' | 'UAT' | 'Regression' | 'Security' | 'Performance';
  status: 'Not Started' | 'In Progress' | 'Passed' | 'Failed' | 'Blocked';
  executedBy?: string;
  executedAt?: string;
  result?: string;
  defectIds: string[];
}

export interface ChangeRequest {
  id: string;
  workOrderId: string;
  requestorId: string;
  changeDescription: string;
  businessJustification: string;
  scopeImpact: string;
  scheduleImpact: string;
  commercialImpact: number;
  riskImpact: string;
  technicalImpact: string;
  status: ChangeRequestStatus;
  reviewDecisions: { reviewerId: string; decision: string; comments: string; decidedAt: string }[];
  implementedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialLine {
  id: string;
  workOrderId: string;
  description: string;
  category: string;
  estimatedValue: number;
  proposedValue: number;
  approvedValue: number | null;
  variationValue: number;
}

export interface PaymentMilestone {
  id: string;
  workOrderId: string;
  milestoneName: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Invoiced' | 'Paid';
  invoiceReference?: string;
  paidDate?: string;
}

export interface TimesheetEntry {
  id: string;
  workOrderId: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
  rate: number;
  approved: boolean;
}

export interface ActionItem {
  id: string;
  workOrderId: string;
  type: string;
  description: string;
  assignedToId: string;
  priority: Priority;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  workOrderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface AuditEvent {
  id: string;
  workOrderId: string;
  eventType: AuditEventType;
  actor: string;
  actorId: string;
  timestamp: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

// ---------- Application State ----------

export interface AppState {
  users: User[];
  currentUser: User | null;
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
}
