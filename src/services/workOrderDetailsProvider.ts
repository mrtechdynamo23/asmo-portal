// ==========================================================================
// ASMO Work Order Control Tower — Universal Details Provider
// Ensures every Work Order has rich, realistic enterprise data across all 10 tabs
// ==========================================================================
import {
  WorkOrder, Milestone, Deliverable, RAIDRecord, ProposalVersion,
  ReviewTask, Authorisation, PaymentMilestone, Defect, AuditEvent,
  Priority, CommercialModel
} from '../types';

export function getWorkOrderMilestones(
  wo: WorkOrder,
  existingMilestones: Milestone[]
): Milestone[] {
  const custom = existingMilestones.filter(m => m.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  // Generate realistic milestones based on dates and phase
  const isPostBuild = ['Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);
  const isExecution = ['Build', 'Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);
  const owner = wo.deliveryLeadId || wo.businessOwnerId || 'USR-007';

  return [
    {
      id: `MS-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      name: 'Demand Initiation & Discovery Complete',
      description: 'Requirements validation, baseline architecture, and stakeholder kickoff.',
      phase: 'Discovery',
      plannedStartDate: wo.plannedStartDate,
      plannedEndDate: '2026-11-20',
      ownerId: owner,
      status: 'Completed',
      completionPercentage: 100,
      actualEndDate: '2026-11-18',
      dependencies: [],
      isOverdue: false,
    },
    {
      id: `MS-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      name: 'Architecture & High-Level Design (HLD)',
      description: 'Multi-disciplinary architecture and security review gate sign-off.',
      phase: 'Design',
      plannedStartDate: '2026-11-21',
      plannedEndDate: '2026-12-20',
      ownerId: owner,
      status: isExecution ? 'Completed' : 'In Progress',
      completionPercentage: isExecution ? 100 : 75,
      actualEndDate: isExecution ? '2026-12-19' : undefined,
      dependencies: [`MS-${wo.id.slice(-3)}-01`],
      isOverdue: false,
    },
    {
      id: `MS-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      name: 'Core Application & Module Implementation',
      description: 'Feature development, unit testing, and ASMO internal gateway integration.',
      phase: 'Build',
      plannedStartDate: '2026-12-21',
      plannedEndDate: '2027-02-28',
      ownerId: owner,
      status: isPostBuild ? 'Completed' : isExecution ? 'In Progress' : 'Not Started',
      completionPercentage: isPostBuild ? 100 : isExecution ? (wo.deliveryProgress || 60) : 0,
      dependencies: [`MS-${wo.id.slice(-3)}-02`],
      isOverdue: false,
    },
    {
      id: `MS-${wo.id.slice(-3)}-04`,
      workOrderId: wo.id,
      name: 'System Integration Testing (SIT) & UAT Validation',
      description: 'User acceptance testing, regression sweeps, and business sign-off.',
      phase: 'Validate',
      plannedStartDate: '2027-03-01',
      plannedEndDate: '2027-04-10',
      ownerId: owner,
      status: wo.lifecycleStatus === 'Closed' ? 'Completed' : wo.lifecycleStatus === 'Validate' ? 'In Progress' : 'Not Started',
      completionPercentage: wo.lifecycleStatus === 'Closed' ? 100 : wo.lifecycleStatus === 'Validate' ? 50 : 0,
      dependencies: [`MS-${wo.id.slice(-3)}-03`],
      isOverdue: false,
    },
    {
      id: `MS-${wo.id.slice(-3)}-05`,
      workOrderId: wo.id,
      name: 'Production Deployment & Operational Handover',
      description: 'Cutover execution, runbook sign-off, access revocation, and warranty.',
      phase: 'Stabilize & Close',
      plannedStartDate: '2027-04-11',
      plannedEndDate: wo.plannedEndDate,
      ownerId: owner,
      status: wo.lifecycleStatus === 'Closed' ? 'Completed' : 'Not Started',
      completionPercentage: wo.lifecycleStatus === 'Closed' ? 100 : 0,
      dependencies: [`MS-${wo.id.slice(-3)}-04`],
      isOverdue: false,
    },
  ];
}

export function getWorkOrderDeliverables(
  wo: WorkOrder,
  existingDeliverables: Deliverable[]
): Deliverable[] {
  const custom = existingDeliverables.filter(d => d.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  const isClosed = wo.lifecycleStatus === 'Closed';
  const isPostBuild = ['Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);
  const owner = wo.deliveryLeadId || 'USR-007';

  return [
    {
      id: `DEL-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      name: 'Solution Architecture & Technical Design Document',
      type: 'Architecture Blueprint',
      ownerId: owner,
      plannedSubmissionDate: '2026-11-20',
      actualSubmissionDate: '2026-11-18',
      reviewStatus: 'Accepted',
      reviewerComments: 'Architectural specifications and security schemas fully approved.',
      acceptanceCriteria: ['Adherence to ASMO standards', 'Data protection compliance'],
      revisionHistory: [],
    },
    {
      id: `DEL-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      name: 'Core Application Build & API Gateway Integration',
      type: 'Code Release',
      ownerId: owner,
      plannedSubmissionDate: '2027-02-28',
      actualSubmissionDate: isPostBuild ? '2027-02-25' : undefined,
      reviewStatus: isPostBuild ? 'Accepted' : 'In Progress',
      reviewerComments: isPostBuild ? 'Sprint deliverables verified against functional acceptance criteria.' : 'Under active engineering.',
      acceptanceCriteria: ['Unit test coverage >= 80%', 'Zero critical defects'],
      revisionHistory: [],
    },
    {
      id: `DEL-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      name: 'User Acceptance Testing (UAT) Sign-Off Certificate',
      type: 'Quality Assurance Sign-Off',
      ownerId: owner,
      plannedSubmissionDate: '2027-04-10',
      actualSubmissionDate: isClosed ? '2027-04-08' : undefined,
      reviewStatus: isClosed ? 'Accepted' : 'Under Review',
      reviewerComments: isClosed ? 'Business Owner sign-off completed with zero Severity 1 defects.' : 'UAT test cycles in progress.',
      acceptanceCriteria: ['Business sponsor sign-off', 'Test report attached'],
      revisionHistory: [],
    },
    {
      id: `DEL-${wo.id.slice(-3)}-04`,
      workOrderId: wo.id,
      name: 'Standard Operating Procedures (SOP) & IT Runbook',
      type: 'Operational Documentation',
      ownerId: owner,
      plannedSubmissionDate: wo.plannedEndDate,
      actualSubmissionDate: isClosed ? '2027-04-20' : undefined,
      reviewStatus: isClosed ? 'Accepted' : 'Submitted',
      reviewerComments: isClosed ? 'Operational runbook validated by IT Operations team.' : 'Awaiting final documentation review.',
      acceptanceCriteria: ['Incident response guide', 'Monitoring thresholds defined'],
      revisionHistory: [],
    },
  ];
}

export function getWorkOrderProposals(
  wo: WorkOrder,
  existingProposals: ProposalVersion[]
): ProposalVersion[] {
  const custom = existingProposals.filter(p => p.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  const isApproved = !['Draft', 'Submitted', 'Qualified', 'SoW Issued', 'Proposal Submitted'].includes(wo.lifecycleStatus);

  const proposals: ProposalVersion[] = [
    {
      id: `PV-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      versionNumber: 1,
      submittedBy: 'Priya Nair (Nexus Consulting)',
      submittedAt: '2026-10-01T09:00:00Z',
      technicalProposal: `Comprehensive technical delivery plan for ${wo.title}. Includes microservice architecture, API integration, and enterprise SLA management.`,
      commercialProposal: `${wo.commercialModel} pricing basis at SAR ${(wo.proposedValue || 450000).toLocaleString()}. Milestone-based payment schedules.`,
      keyPersonnel: ['Priya Nair (Engagement Lead)', 'Tariq Al-Mansoor (Solution Architect)', 'Lina Chen (Lead QA)'],
      proposedMilestones: 'Discovery, Architecture Sign-Off, Core Build, UAT Gate, Operational Cutover',
      pricingModel: wo.commercialModel,
      proposedValue: wo.proposedValue || 450000,
      status: isApproved ? 'Approved' : 'Under Review',
    }
  ];

  if (wo.lifecycleStatus === 'Revision Required') {
    proposals[0].status = 'Revision Required';
  }

  return proposals;
}

export function getWorkOrderReviewTasks(
  wo: WorkOrder,
  existingTasks: ReviewTask[]
): ReviewTask[] {
  const custom = existingTasks.filter(t => t.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  const isApproved = ['Approved', 'Authorised', 'Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);
  const isUnderReview = wo.lifecycleStatus === 'Under Review';

  return [
    {
      id: `REV-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      reviewType: 'Technical',
      reviewerId: 'USR-005',
      decision: isApproved ? 'Approved' : isUnderReview ? 'Approved' : 'Pending',
      comments: isApproved ? 'Technical architecture and integration specifications adhere to ASMO engineering guidelines.' : 'Evaluating technical proposal against enterprise target state.',
      createdAt: '2026-10-01T08:00:00Z',
      decidedAt: isApproved ? '2026-10-04T14:00:00Z' : undefined,
    },
    {
      id: `REV-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      reviewType: 'Commercial',
      reviewerId: 'USR-004',
      decision: isApproved ? 'Approved' : 'Pending',
      comments: isApproved ? 'Lump sum and rate card structures are benchmarked and approved within procurement limits.' : 'Commercial evaluation in progress with vendor management.',
      createdAt: '2026-10-01T08:30:00Z',
      decidedAt: isApproved ? '2026-10-05T10:00:00Z' : undefined,
    },
    {
      id: `REV-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      reviewType: 'Architecture',
      reviewerId: 'USR-005',
      decision: isApproved ? 'Approved' : isUnderReview ? 'Approved' : 'Pending',
      comments: isApproved ? 'High-Level Design (HLD) patterns verified with zero architectural exceptions.' : 'Reviewing data flow diagrams and API gateway endpoints.',
      createdAt: '2026-10-01T09:00:00Z',
      decidedAt: isApproved ? '2026-10-06T11:00:00Z' : undefined,
    },
    {
      id: `REV-${wo.id.slice(-3)}-04`,
      workOrderId: wo.id,
      reviewType: 'Cybersecurity',
      reviewerId: 'USR-006',
      decision: isApproved ? 'Approved' : isUnderReview ? (wo.id === 'WO-ASMO-2026-00131' ? 'Revision Required' : 'Approved') : 'Pending',
      comments: isApproved ? 'Threat modeling and encryption standards compliant with InfoSec baseline.' : 'Assessing RBAC security controls and data classification.',
      createdAt: '2026-10-01T09:30:00Z',
      decidedAt: isApproved ? '2026-10-07T16:00:00Z' : undefined,
    },
  ];
}

export function getWorkOrderRAID(
  wo: WorkOrder,
  existingRAID: RAIDRecord[]
): RAIDRecord[] {
  const custom = existingRAID.filter(r => r.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  const owner = wo.businessOwnerId || 'USR-003';

  return [
    {
      id: `RAID-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      type: 'Risk',
      description: 'Legacy backend API latency may exceed SLA during high-concurrency peak shifts.',
      ownerId: owner,
      priority: 'High',
      severity: 'High',
      impact: 'End-user transactions could experience latency delays.',
      mitigationPlan: 'Deploy Redis caching layer and asynchronous messaging queues.',
      status: 'Open',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    },
    {
      id: `RAID-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      type: 'Assumption',
      description: 'Customer data dictionary and source schemas are frozen prior to Sprint 1.',
      ownerId: owner,
      priority: 'Medium',
      severity: 'Medium',
      impact: 'Unplanned schema alterations would require sprint scope adjustment.',
      mitigationPlan: 'Formal schema freeze sign-off required at Discovery conclusion.',
      status: 'Open',
      createdAt: '2026-10-02T09:00:00Z',
      updatedAt: '2026-10-05T14:00:00Z',
    },
    {
      id: `RAID-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      type: 'Dependency',
      description: 'InfoSec firewall port opening and VPN certificate issuance for SI Partner team.',
      ownerId: owner,
      priority: 'Medium',
      severity: 'Medium',
      impact: 'Development team integration testing in staging could be delayed.',
      mitigationPlan: 'Expedited firewall change ticket logged with IT Infrastructure Ops.',
      status: 'In Progress',
      createdAt: '2026-10-04T10:00:00Z',
      updatedAt: '2026-10-11T16:00:00Z',
    },
  ];
}

export function getWorkOrderPaymentMilestones(
  wo: WorkOrder,
  existingPaymentMilestones: PaymentMilestone[]
): PaymentMilestone[] {
  const custom = existingPaymentMilestones.filter(p => p.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  const total = wo.proposedValue || 500000;
  const isClosed = wo.lifecycleStatus === 'Closed';
  const isPostBuild = ['Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);

  return [
    {
      id: `PM-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      milestoneName: 'Contract Signing & Initiation Advance (20%)',
      amount: Math.round(total * 0.2),
      dueDate: '2026-11-15',
      invoiceReference: `INV-ASMO-${wo.id.slice(-3)}-01`,
      status: 'Paid',
    },
    {
      id: `PM-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      milestoneName: 'Architecture Design & HLD Approval Gate (30%)',
      amount: Math.round(total * 0.3),
      dueDate: '2026-12-25',
      invoiceReference: `INV-ASMO-${wo.id.slice(-3)}-02`,
      status: isPostBuild ? 'Paid' : 'Invoiced',
    },
    {
      id: `PM-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      milestoneName: 'UAT Acceptance & User Sign-Off Gate (30%)',
      amount: Math.round(total * 0.3),
      dueDate: '2027-03-30',
      invoiceReference: isClosed ? `INV-ASMO-${wo.id.slice(-3)}-03` : undefined,
      status: isClosed ? 'Paid' : 'Pending',
    },
    {
      id: `PM-${wo.id.slice(-3)}-04`,
      workOrderId: wo.id,
      milestoneName: 'Final Operational Handover & Closure (20%)',
      amount: Math.round(total * 0.2),
      dueDate: wo.plannedEndDate,
      invoiceReference: isClosed ? `INV-ASMO-${wo.id.slice(-3)}-04` : undefined,
      status: isClosed ? 'Paid' : 'Pending',
    },
  ];
}

export function getWorkOrderAuthorisation(
  wo: WorkOrder,
  existingAuthorisations: Authorisation[]
): Authorisation | undefined {
  const found = existingAuthorisations.find(a => a.workOrderId === wo.id);
  if (found) return found;

  const isAuthorised = ['Authorised', 'Discovery', 'Design', 'Build', 'Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus);
  if (!isAuthorised) return undefined;

  return {
    id: `AUTH-${wo.id.slice(-3)}`,
    workOrderId: wo.id,
    workOrderReference: wo.id,
    releasePOReference: `PO-REL-2026-${wo.id.slice(-5)}`,
    approvedScope: 'Full technical scope including API integration, microservice deployments, and operational handover runbooks.',
    approvedDates: `${wo.plannedStartDate} to ${wo.plannedEndDate}`,
    pricingBasis: wo.commercialModel,
    authorisedValue: wo.authorisedValue || wo.proposedValue || 450000,
    authorisedAt: '2026-10-08T15:30:00Z',
    authorisedBy: 'Noura Al-Subaie',
    evidenceName: `ASMO-PO-AUTH-${wo.id.slice(-5)}-SIGNED.pdf`,
    comments: 'Formal Release Purchase Order approved and committed in financial ERP. Execution gates cleared.',
  };
}

export function getWorkOrderDefects(
  wo: WorkOrder,
  existingDefects: Defect[]
): Defect[] {
  const custom = existingDefects.filter(d => d.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  if (['Build', 'Validate', 'Deploy', 'Stabilise', 'Closed'].includes(wo.lifecycleStatus)) {
    return [
      {
        id: `DEF-${wo.id.slice(-3)}-01`,
        workOrderId: wo.id,
        title: 'Edge-case currency conversion rounding disparity',
        severity: 'Medium',
        status: 'Resolved',
        description: 'Discrepancy of 0.01 SAR observed on multi-item invoice summation.',
        reportedBy: 'Nasser Al-Ghamdi',
        reportedAt: '2026-10-02T11:00:00Z',
        resolvedAt: '2026-10-04T16:00:00Z',
      }
    ];
  }
  return [];
}

export function getWorkOrderAuditEvents(
  wo: WorkOrder,
  existingAudit: AuditEvent[]
): AuditEvent[] {
  const custom = existingAudit.filter(a => a.workOrderId === wo.id);
  if (custom.length > 0) return custom;

  return [
    {
      id: `EVT-${wo.id.slice(-3)}-01`,
      workOrderId: wo.id,
      eventType: 'created',
      actor: 'Mona Al-Ghamdi',
      actorId: 'USR-002',
      timestamp: '2026-09-15 09:30',
      action: 'Work Order Demand Initiated',
      details: `Work Order created and classified under ${wo.serviceCategoryId}.`,
    },
    {
      id: `EVT-${wo.id.slice(-3)}-02`,
      workOrderId: wo.id,
      eventType: 'status_change',
      actor: 'Noura Al-Subaie',
      actorId: 'USR-001',
      timestamp: '2026-09-18 14:15',
      action: 'Demand Qualified & Scope of Work Issued',
      details: 'Demand qualified by Work Order Manager. Formal Scope of Work issued to SI Partner.',
    },
    {
      id: `EVT-${wo.id.slice(-3)}-03`,
      workOrderId: wo.id,
      eventType: 'review_decision',
      actor: 'Dr. Faisal Al-Harbi',
      actorId: 'USR-005',
      timestamp: '2026-10-04 11:20',
      action: 'Architecture Review Approved',
      details: 'High-Level Design and security pattern evaluated and signed off.',
    },
    {
      id: `EVT-${wo.id.slice(-3)}-04`,
      workOrderId: wo.id,
      eventType: 'status_change',
      actor: 'System Workflow',
      actorId: 'USR-001',
      timestamp: '2026-10-08 16:00',
      action: `Current Lifecycle Status: ${wo.lifecycleStatus}`,
      details: `Work Order active in phase: ${wo.deliveryPhase || 'Execution'}.`,
    },
  ];
}
