// ==========================================================================
// ASMO Work Order Control Tower — Calendar Event Adapter
// Derives normalized, deduplicated Calendar Events from Central Store
// ==========================================================================
import { WorkOrder, Milestone, Deliverable, ReviewTask, Authorisation, ChangeRequest, User } from '../types';
import { CalendarEvent, CalendarEventType } from '../types/calendar';
import {
  getWorkOrderMilestones, getWorkOrderDeliverables,
  getWorkOrderReviewTasks, getWorkOrderAuthorisation
} from './workOrderDetailsProvider';

const REFERENCE_DATE = '2026-10-14';

export function normalizeCalendarEvents(
  workOrders: WorkOrder[],
  allMilestones: Milestone[],
  allDeliverables: Deliverable[],
  allReviewTasks: ReviewTask[],
  allAuthorisations: Authorisation[],
  allChangeRequests: ChangeRequest[],
  users: User[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const userMap = new Map<string, string>();
  users.forEach(u => userMap.set(u.id, u.name));

  const woMap = new Map<string, WorkOrder>();
  workOrders.forEach(w => woMap.set(w.id, w));

  // 1. Milestones
  workOrders.forEach(wo => {
    const woMilestones = getWorkOrderMilestones(wo, allMilestones);
    woMilestones.forEach(m => {
      const targetDate = m.plannedEndDate || m.plannedStartDate;
      if (!targetDate) return;
      const cleanDate = targetDate.slice(0, 10);
      const isPast = cleanDate < REFERENCE_DATE && m.status !== 'Completed';

      events.push({
        id: `cal-ms-${m.id}`,
        title: `${m.name}`,
        type: 'milestone',
        date: cleanDate,
        endDate: m.plannedEndDate ? m.plannedEndDate.slice(0, 10) : undefined,
        workOrderId: wo.id,
        workOrderTitle: wo.title,
        ownerId: m.ownerId,
        ownerName: userMap.get(m.ownerId) || 'Delivery Team',
        status: isPast ? 'Overdue' : m.status,
        phase: m.phase,
        priority: wo.priority,
        description: m.description,
        isOverdue: isPast,
        isOnHold: wo.isOnHold,
        sourceEntityId: m.id,
      });
    });
  });

  // 2. Deliverables
  workOrders.forEach(wo => {
    const woDeliverables = getWorkOrderDeliverables(wo, allDeliverables);
    woDeliverables.forEach(d => {
      const targetDate = d.actualSubmissionDate || d.plannedSubmissionDate;
      if (!targetDate) return;
      const cleanDate = targetDate.slice(0, 10);
      const isPast = cleanDate < REFERENCE_DATE && !['Accepted', 'Submitted'].includes(d.reviewStatus);

      events.push({
        id: `cal-del-${d.id}`,
        title: `Deliverable: ${d.name}`,
        type: 'deliverable',
        date: cleanDate,
        workOrderId: wo.id,
        workOrderTitle: wo.title,
        ownerId: d.ownerId,
        ownerName: userMap.get(d.ownerId) || 'QA Team',
        status: isPast ? 'Overdue' : d.reviewStatus,
        priority: wo.priority,
        description: d.reviewerComments || 'Deliverable submission & QA sign-off gate.',
        isOverdue: isPast,
        isOnHold: wo.isOnHold,
        sourceEntityId: d.id,
      });
    });
  });

  // 3. Review Tasks
  workOrders.forEach(wo => {
    const woReviews = getWorkOrderReviewTasks(wo, allReviewTasks);
    woReviews.forEach(r => {
      const dateStr = r.decidedAt || r.dueDate || r.createdAt;
      if (!dateStr) return;
      const cleanDate = dateStr.slice(0, 10);
      const isPending = r.decision === 'Pending';
      const isPast = cleanDate < REFERENCE_DATE && isPending;

      events.push({
        id: `cal-rev-${r.id}`,
        title: `${r.reviewType} Governance Review Gate`,
        type: 'review',
        date: cleanDate,
        workOrderId: wo.id,
        workOrderTitle: wo.title,
        ownerId: r.reviewerId,
        ownerName: userMap.get(r.reviewerId) || `${r.reviewType} Reviewer`,
        status: isPast ? 'Overdue' : r.decision,
        priority: wo.priority,
        description: r.comments || `Mandatory ${r.reviewType} review checkpoint.`,
        isOverdue: isPast,
        isOnHold: wo.isOnHold,
        sourceEntityId: r.id,
      });
    });
  });

  // 4. Authorisations
  workOrders.forEach(wo => {
    const auth = getWorkOrderAuthorisation(wo, allAuthorisations);
    if (auth && auth.authorisedAt) {
      events.push({
        id: `cal-auth-${auth.id}`,
        title: `Release PO Authorised (${auth.releasePOReference})`,
        type: 'authorisation',
        date: auth.authorisedAt.slice(0, 10),
        workOrderId: wo.id,
        workOrderTitle: wo.title,
        ownerId: auth.authorisedBy,
        ownerName: auth.authorisedBy,
        status: 'Authorised',
        priority: wo.priority,
        description: `Financial Release PO commitment: SAR ${auth.authorisedValue.toLocaleString()}`,
        isOverdue: false,
        isOnHold: wo.isOnHold,
        sourceEntityId: auth.id,
      });
    }
  });

  // 5. Change Requests
  allChangeRequests.forEach(cr => {
    const wo = woMap.get(cr.workOrderId);
    const dateStr = cr.implementedAt || cr.createdAt;
    if (!dateStr) return;
    events.push({
      id: `cal-cr-${cr.id}`,
      title: `Change Request Review: ${cr.id}`,
      type: 'change_request',
      date: dateStr.slice(0, 10),
      workOrderId: cr.workOrderId,
      workOrderTitle: wo?.title || cr.workOrderId,
      ownerId: cr.requestorId,
      ownerName: userMap.get(cr.requestorId) || 'Requestor',
      status: cr.status,
      priority: wo?.priority || 'Medium',
      description: cr.changeDescription,
      isOverdue: false,
      isOnHold: wo?.isOnHold || false,
      sourceEntityId: cr.id,
    });
  });

  // 6. Closures
  workOrders.filter(w => w.lifecycleStatus === 'Closed').forEach(wo => {
    const targetDate = wo.actualEndDate || wo.plannedEndDate;
    if (!targetDate) return;
    events.push({
      id: `cal-cls-${wo.id}`,
      title: `Formal Operational Closure Handover`,
      type: 'closure',
      date: targetDate.slice(0, 10),
      workOrderId: wo.id,
      workOrderTitle: wo.title,
      ownerId: wo.businessOwnerId,
      ownerName: userMap.get(wo.businessOwnerId) || 'Business Owner',
      status: 'Closed',
      priority: wo.priority,
      description: 'Warranty conclusion, final settlement, and formal governance sign-off.',
      isOverdue: false,
      isOnHold: false,
      sourceEntityId: wo.id,
    });
  });

  // Sort by date ascending
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function filterCalendarEvents(
  events: CalendarEvent[],
  selectedTypes: CalendarEventType[],
  workOrderId: string,
  ownerId: string,
  status: string,
  searchQuery: string
): CalendarEvent[] {
  const q = searchQuery.trim().toLowerCase();

  return events.filter(e => {
    if (selectedTypes.length > 0 && !selectedTypes.includes(e.type)) {
      return false;
    }
    if (workOrderId !== 'All' && e.workOrderId !== workOrderId) {
      return false;
    }
    if (ownerId !== 'All' && e.ownerId !== ownerId) {
      return false;
    }
    if (status !== 'All') {
      if (status === 'Overdue' && !e.isOverdue) return false;
      if (status === 'On Hold' && !e.isOnHold) return false;
      if (status !== 'Overdue' && status !== 'On Hold' && e.status !== status) return false;
    }
    if (q) {
      const match =
        e.title.toLowerCase().includes(q) ||
        e.workOrderId.toLowerCase().includes(q) ||
        e.workOrderTitle.toLowerCase().includes(q) ||
        e.ownerName.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}
