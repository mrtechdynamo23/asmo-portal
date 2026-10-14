// ==========================================================================
// ASMO Work Order Control Tower — Enterprise Calendar Module
// Route: /calendar
// ==========================================================================
import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon, Milestone, PackageCheck, Clock,
  AlertTriangle, ShieldCheck, Layers, GitPullRequest
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { KPICard } from '../components/KPICard';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { CalendarFilterBar } from '../components/calendar/CalendarFilterBar';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarAgendaView } from '../components/calendar/CalendarAgendaView';
import { CalendarEventDetailModal } from '../components/calendar/CalendarEventDetailModal';
import {
  normalizeCalendarEvents,
  filterCalendarEvents
} from '../services/calendarEventAdapter';
import { CalendarEvent, CalendarEventType, CalendarViewMode } from '../types/calendar';

export const CalendarPage: React.FC = () => {
  const {
    workOrders, milestones, deliverables, reviewTasks,
    authorisations, changeRequests, users
  } = useStore();

  // Reference date: 14 October 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 14));
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<CalendarEventType[]>([]);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('All');
  const [selectedOwnerId, setSelectedOwnerId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 1. Single Source of Truth aggregation from store
  const allEvents = useMemo(() => {
    return normalizeCalendarEvents(
      workOrders, milestones, deliverables,
      reviewTasks, authorisations, changeRequests, users
    );
  }, [workOrders, milestones, deliverables, reviewTasks, authorisations, changeRequests, users]);

  // 2. Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CalendarEventType, number> = {
      milestone: 0,
      deliverable: 0,
      review: 0,
      authorisation: 0,
      change_request: 0,
      closure: 0,
    };
    allEvents.forEach(e => {
      if (counts[e.type] !== undefined) {
        counts[e.type]++;
      }
    });
    return counts;
  }, [allEvents]);

  // 3. Filtered events
  const filteredEvents = useMemo(() => {
    return filterCalendarEvents(
      allEvents,
      selectedTypes,
      selectedWorkOrderId,
      selectedOwnerId,
      selectedStatus,
      searchQuery
    );
  }, [allEvents, selectedTypes, selectedWorkOrderId, selectedOwnerId, selectedStatus, searchQuery]);

  // 4. Calendar KPI Metrics
  const kpiMetrics = useMemo(() => {
    const overdue = allEvents.filter(e => e.isOverdue).length;
    const activeMs = allEvents.filter(e => e.type === 'milestone' && e.status === 'In Progress').length;
    const deliverablesCount = allEvents.filter(e => e.type === 'deliverable').length;
    const pendingReviews = allEvents.filter(e => e.type === 'review' && e.status === 'Pending').length;

    return {
      total: allEvents.length,
      activeMilestones: activeMs,
      deliverables: deliverablesCount,
      pendingReviews,
      overdue,
    };
  }, [allEvents]);

  // Navigation handlers
  const handleNavigatePrev = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleNavigateNext = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleNavigateToday = useCallback(() => {
    setCurrentDate(new Date(2026, 9, 14));
  }, []);

  const handleSelectMonth = useCallback((year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1));
  }, []);

  const handleToggleType = useCallback((type: CalendarEventType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedWorkOrderId('All');
    setSelectedOwnerId('All');
    setSelectedStatus('All');
    setSearchQuery('');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                  Work Order Portfolio Calendar
                </h1>
                <span className="badge badge-primary">Governance Horizon</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Operational schedule, milestone timelines, review checkpoints, and release gates across all Work Orders.
              </p>
            </div>
          </div>

          {/* KPI Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: '0.625rem',
              marginBottom: '1.5rem',
            }}
          >
            <KPICard
              title="Scheduled Events"
              value={kpiMetrics.total}
              subtitle="All derived governance gates"
              icon={CalendarIcon}
            />
            <KPICard
              title="Active Milestones"
              value={kpiMetrics.activeMilestones}
              subtitle="Under active execution"
              icon={Milestone}
            />
            <KPICard
              title="Deliverable Gates"
              value={kpiMetrics.deliverables}
              subtitle="QA & acceptance checkpoints"
              icon={PackageCheck}
            />
            <KPICard
              title="Pending Reviews"
              value={kpiMetrics.pendingReviews}
              subtitle="Awaiting governance sign-off"
              icon={Clock}
              status={kpiMetrics.pendingReviews > 0 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Overdue Checkpoints"
              value={kpiMetrics.overdue}
              subtitle="Breached relative to 14 Oct 2026"
              icon={AlertTriangle}
              status={kpiMetrics.overdue > 0 ? 'danger' : 'normal'}
            />
          </div>

          {/* Calendar Toolbar */}
          <CalendarToolbar
            currentDate={currentDate}
            viewMode={viewMode}
            searchQuery={searchQuery}
            onNavigatePrev={handleNavigatePrev}
            onNavigateNext={handleNavigateNext}
            onNavigateToday={handleNavigateToday}
            onSelectMonth={handleSelectMonth}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchQuery}
          />

          {/* Calendar Filter Bar */}
          <CalendarFilterBar
            selectedTypes={selectedTypes}
            categoryCounts={categoryCounts}
            selectedWorkOrderId={selectedWorkOrderId}
            selectedOwnerId={selectedOwnerId}
            selectedStatus={selectedStatus}
            workOrders={workOrders}
            users={users}
            onToggleType={handleToggleType}
            onWorkOrderChange={setSelectedWorkOrderId}
            onOwnerChange={setSelectedOwnerId}
            onStatusChange={setSelectedStatus}
            onResetFilters={handleResetFilters}
          />

          {/* Active View */}
          {viewMode === 'month' && (
            <CalendarMonthView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {viewMode === 'week' && (
            <CalendarWeekView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {viewMode === 'agenda' && (
            <CalendarAgendaView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {/* Event Detail Modal */}
          <CalendarEventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
