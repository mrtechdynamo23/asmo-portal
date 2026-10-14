// ==========================================================================
// ASMO Work Order Control Tower — Calendar Module Types
// ==========================================================================

export type CalendarEventType =
  | 'milestone'
  | 'deliverable'
  | 'review'
  | 'authorisation'
  | 'change_request'
  | 'closure';

export type CalendarViewMode = 'month' | 'week' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string;         // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD for multi-day spans
  time?: string;        // Optional time if available, otherwise date-only
  workOrderId: string;
  workOrderTitle: string;
  ownerId?: string;
  ownerName: string;
  status: string;
  phase?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  description?: string;
  isOverdue?: boolean;
  isOnHold?: boolean;
  sourceEntityId: string;
}

export interface CalendarFilterState {
  searchQuery: string;
  selectedTypes: CalendarEventType[];
  selectedWorkOrderId: string;
  selectedOwnerId: string;
  selectedStatus: string;
}
