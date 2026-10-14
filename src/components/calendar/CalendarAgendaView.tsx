// ==========================================================================
// ASMO Work Order Control Tower — Calendar Agenda View
// ==========================================================================
import React from 'react';
import { CalendarEvent } from '../../types/calendar';
import {
  Calendar as CalendarIcon, User, AlertTriangle, PauseCircle,
  ArrowRight, ShieldAlert, CheckCircle2, Milestone, PackageCheck,
  Clock, ShieldCheck, GitPullRequest
} from 'lucide-react';

interface CalendarAgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const SIMULATION_TODAY = '2026-10-14';

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  milestone: Milestone,
  deliverable: PackageCheck,
  review: Clock,
  authorisation: ShieldCheck,
  change_request: GitPullRequest,
  closure: CheckCircle2,
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  milestone: { bg: 'rgba(162, 28, 32, 0.12)', text: '#A21C20', border: '#A21C20' },
  deliverable: { bg: 'rgba(8, 145, 178, 0.12)', text: '#0891B2', border: '#0891B2' },
  review: { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706', border: '#D97706' },
  authorisation: { bg: 'rgba(5, 150, 105, 0.12)', text: '#059669', border: '#059669' },
  change_request: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', border: '#7C3AED' },
  closure: { bg: 'rgba(75, 85, 99, 0.12)', text: '#4B5563', border: '#4B5563' },
};

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  // Group events by date
  const grouped: Record<string, CalendarEvent[]> = {};
  events.forEach(e => {
    if (!grouped[e.date]) {
      grouped[e.date] = [];
    }
    grouped[e.date].push(e);
  });

  const sortedDates = Object.keys(grouped).sort();

  if (sortedDates.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          borderRadius: '10px',
        }}
      >
        <CalendarIcon size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
          No Events Scheduled
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
          No Work Order milestones, reviews, or deliverables match the currently applied calendar filters.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sortedDates.map(dateKey => {
        const dateEvents = grouped[dateKey];
        const dateObj = new Date(dateKey + 'T00:00:00');
        const isToday = dateKey === SIMULATION_TODAY;
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <div
            key={dateKey}
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: '10px',
              borderLeft: isToday ? '4px solid var(--asmo-primary)' : '1px solid var(--color-border)',
            }}
          >
            {/* Date Group Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isToday ? 'var(--asmo-primary)' : 'var(--color-bg-alt)',
                    color: isToday ? '#FFFFFF' : 'var(--color-text)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{dateObj.getDate()}</span>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                      {formatted}
                    </h3>
                    {isToday && (
                      <span
                        style={{
                          backgroundColor: 'rgba(162, 28, 32, 0.15)',
                          color: 'var(--asmo-primary)',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {weekday} • {dateEvents.length} scheduled item{dateEvents.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* List of events on this date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dateEvents.map(ev => {
                const style = TYPE_COLORS[ev.type] || TYPE_COLORS.milestone;
                const Icon = TYPE_ICONS[ev.type] || Milestone;

                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      borderLeft: `4px solid ${ev.isOverdue ? '#DC2626' : style.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '1rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: style.bg,
                          color: style.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {ev.title}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--asmo-primary)',
                              backgroundColor: 'rgba(162, 28, 32, 0.08)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {ev.workOrderId}
                          </span>
                          {ev.isOverdue && (
                            <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <AlertTriangle size={10} style={{ marginRight: '3px' }} /> Overdue
                            </span>
                          )}
                          {ev.isOnHold && (
                            <span className="badge badge-warning" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <PauseCircle size={10} style={{ marginRight: '3px' }} /> Parent WO On Hold
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                          Owner: <strong>{ev.ownerName}</strong> • WO: {ev.workOrderTitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span className="badge badge-default" style={{ fontSize: '11px' }}>
                        {ev.status}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
