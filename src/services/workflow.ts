// ==========================================================================
// ASMO Work Order Control Tower — Workflow Engine & Permission Matrix
// ==========================================================================
import { LifecycleStatus, UserRole, User, WorkOrder } from '../types';

/**
 * Sequential phases and lifecycle progression
 */
export const LIFECYCLE_ORDER: LifecycleStatus[] = [
  'Draft',
  'Submitted',
  'Qualified',
  'SoW Issued',
  'Proposal Submitted',
  'Under Review',
  'Revision Required',
  'Approved',
  'Authorised',
  'Discovery',
  'Design',
  'Build',
  'Validate',
  'Deploy',
  'Stabilise',
  'Closed',
];

/**
 * Valid transitions map
 */
export const ALLOWED_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  'Draft': ['Submitted', 'Cancelled'],
  'Submitted': ['Qualified', 'Revision Required', 'Rejected', 'Cancelled'],
  'Qualified': ['SoW Issued', 'Draft', 'Cancelled'],
  'SoW Issued': ['Proposal Submitted', 'Cancelled'],
  'Proposal Submitted': ['Under Review', 'Revision Required', 'Cancelled'],
  'Under Review': ['Approved', 'Revision Required', 'Rejected'],
  'Revision Required': ['Proposal Submitted', 'Submitted', 'Cancelled'],
  'Approved': ['Authorised', 'Cancelled'],
  'Authorised': ['Discovery', 'Build', 'Cancelled'],
  'Discovery': ['Design', 'Build', 'Cancelled'],
  'Design': ['Build', 'Cancelled'],
  'Build': ['Validate', 'Cancelled'],
  'Validate': ['Deploy', 'Build', 'Cancelled'],
  'Deploy': ['Stabilise', 'Closed', 'Cancelled'],
  'Stabilise': ['Closed', 'Cancelled'],
  'Closed': [],
  'Cancelled': [],
  'Rejected': ['Draft'],
};

/**
 * Roles allowed to initiate specific transitions
 */
export const TRANSITION_PERMISSIONS: Record<string, UserRole[]> = {
  'Draft->Submitted': ['Admin', 'Work Order Manager', 'Business Owner'],
  'Submitted->Qualified': ['Admin', 'Work Order Manager'],
  'Qualified->SoW Issued': ['Admin', 'Work Order Manager'],
  'SoW Issued->Proposal Submitted': ['Admin', 'SI Partner Delivery Lead'],
  'Proposal Submitted->Under Review': ['Admin', 'Work Order Manager', 'Commercial Reviewer', 'Technical / Architecture Reviewer', 'Cybersecurity Reviewer'],
  'Under Review->Approved': ['Admin', 'Work Order Manager'],
  'Under Review->Revision Required': ['Admin', 'Work Order Manager', 'Commercial Reviewer', 'Technical / Architecture Reviewer', 'Cybersecurity Reviewer'],
  'Under Review->Rejected': ['Admin', 'Work Order Manager'],
  'Revision Required->Proposal Submitted': ['Admin', 'SI Partner Delivery Lead'],
  'Approved->Authorised': ['Admin', 'Work Order Manager'],
  'Authorised->Discovery': ['Admin', 'Work Order Manager', 'Project Manager', 'SI Partner Delivery Lead'],
  'Discovery->Design': ['Admin', 'Project Manager', 'SI Partner Delivery Lead'],
  'Design->Build': ['Admin', 'Project Manager', 'SI Partner Delivery Lead'],
  'Build->Validate': ['Admin', 'Project Manager', 'SI Partner Delivery Lead'],
  'Validate->Deploy': ['Admin', 'Project Manager', 'QA / Acceptance Reviewer', 'Work Order Manager'],
  'Deploy->Stabilise': ['Admin', 'Project Manager', 'Work Order Manager'],
  'Stabilise->Closed': ['Admin', 'Work Order Manager', 'Business Owner'],
  'any->Cancelled': ['Admin', 'Work Order Manager', 'Business Owner'],
};

/**
 * Checks if a transition from current to target status is valid
 */
export function canTransition(from: LifecycleStatus, to: LifecycleStatus): boolean {
  if (from === to) return false;
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Checks if a user role can perform a specific transition
 */
export function canUserPerformTransition(
  userRole: UserRole,
  from: LifecycleStatus,
  to: LifecycleStatus
): boolean {
  if (userRole === 'Admin') return true;
  if (!canTransition(from, to)) return false;

  const key = `${from}->${to}`;
  const roles = TRANSITION_PERMISSIONS[key] || TRANSITION_PERMISSIONS['any->Cancelled'];
  return roles ? roles.includes(userRole) : false;
}

/**
 * Checks if a user has permission to put a work order On Hold
 */
export function canPutOnHold(userRole: UserRole): boolean {
  return ['Admin', 'Work Order Manager', 'Business Owner', 'Project Manager'].includes(userRole);
}

/**
 * Checks if a user has permission to resume a work order from On Hold
 */
export function canResumeFromHold(userRole: UserRole): boolean {
  return ['Admin', 'Work Order Manager', 'Business Owner'].includes(userRole);
}

/**
 * Checks if a user can review proposals
 */
export function canReviewProposal(userRole: UserRole): boolean {
  return [
    'Admin',
    'Work Order Manager',
    'Commercial Reviewer',
    'Technical / Architecture Reviewer',
    'Cybersecurity Reviewer',
  ].includes(userRole);
}

/**
 * Checks if a user can formally authorise a Work Order (Release PO)
 */
export function canAuthoriseWorkOrder(userRole: UserRole): boolean {
  return ['Admin', 'Work Order Manager'].includes(userRole);
}

/**
 * Checks if a user can accept deliverables
 */
export function canAcceptDeliverables(userRole: UserRole): boolean {
  return ['Admin', 'Work Order Manager', 'Business Owner', 'QA / Acceptance Reviewer'].includes(userRole);
}

/**
 * Checks if a user can raise or approve Change Requests
 */
export function canManageChangeRequests(userRole: UserRole): boolean {
  return ['Admin', 'Work Order Manager', 'Project Manager', 'SI Partner Delivery Lead', 'Business Owner'].includes(userRole);
}

/**
 * Computes next recommended action label for a Work Order
 */
export function getNextAction(wo: WorkOrder): string {
  if (wo.isOnHold) {
    return 'Work Order On Hold — Resume when blockers resolved';
  }

  switch (wo.lifecycleStatus) {
    case 'Draft':
      return 'Complete details and submit demand';
    case 'Submitted':
      return 'WO Manager qualification & triage';
    case 'Qualified':
      return 'Issue Scope of Work (SoW) to SI Partner';
    case 'SoW Issued':
      return 'SI Partner to submit technical/commercial proposal';
    case 'Proposal Submitted':
      return 'Multi-disciplinary governance review';
    case 'Under Review':
      return 'Consolidate review decisions & approve';
    case 'Revision Required':
      return 'SI Partner to submit revised proposal (v2+)';
    case 'Approved':
      return 'Generate & issue formal Release Purchase Order (PO)';
    case 'Authorised':
      return 'Initiate Discovery kickoff meeting';
    case 'Discovery':
      return 'Complete architecture & requirements validation';
    case 'Design':
      return 'Finalise HLD/LLD designs & sign off';
    case 'Build':
      return 'Complete code development & unit testing';
    case 'Validate':
      return 'Execute SIT & UAT testing passes';
    case 'Deploy':
      return 'Production release & operational handover';
    case 'Stabilise':
      return 'Hypercare warranty monitoring & final acceptance';
    case 'Closed':
      return 'Work Order closed. Final settlement archived.';
    case 'Cancelled':
      return 'Work Order cancelled.';
    case 'Rejected':
      return 'Proposal rejected. Revise scope or re-tender.';
    default:
      return 'Monitor progress';
  }
}
