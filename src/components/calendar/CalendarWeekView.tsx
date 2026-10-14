// ==========================================================================
// ASMO Work Order Control Tower — Calendar Week View
// ==========================================================================
import React from 'react';
import { CalendarEvent } from '../../types/calendar';
import { AlertTriangle, PauseCircle, ChevronRight } from 'lucide-react';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SIMULATION_TODAY = '2026-10-14';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  milestone: { bg: 'rgba(162, 28, 32, 0.1)', text: '#A21C20', border: '#A21C20' },
  deliverable: { bg: 'rgba(8, 145, 178, 0.1)', text: '#0891B2', border: '#0891B2' },
  review: { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706', border: '#D97706' },
  authorisation: { bg: 'rgba(5, 150, 105, 0.1)', text: '#059669', border: '#059669' },
  change_request: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED', border: '#7C3AED' },
  closure: { bg: 'rgba(75, 85, 99, 0.1)', text: '#4B5563', border: '#4B5563' },
};

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  // Find start of current week (Sunday)
  const currentDayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

  const weekDays: {
    name: string;
    dayNum: number;
    dateStr: string;
    isToday: boolean;
    events: CalendarEvent[];
  }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    weekDays.push({
      name: WEEKDAYS[i],
      dayNum: d.getDate(),
      dateStr,
      isToday: dateStr === SIMULATION_TODAY,
      events: events.filter(e => e.date === dateStr),
    });
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '10px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: 'var(--color-border)',
          gap: '1px',
          minWidth: '800px',
        }}
      >
        {weekDays.map(day => (
          <div
            key={day.dateStr}
            style={{
              backgroundColor: 'var(--color-surface)',
              minHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                backgroundColor: day.isToday ? 'rgba(162, 28, 32, 0.08)' : 'var(--color-surface-raised)',
                borderBottom: day.isToday ? '2px solid var(--asmo-primary)' : '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                {day.name.slice(0, 3)}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: day.isToday ? 'var(--asmo-primary)' : 'var(--color-text)',
                  marginTop: '2px',
                }}
              >
                {day.dayNum}
              </div>
              {day.isToday && (
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--asmo-primary)', textTransform: 'uppercase' }}>
                  TODAY
                </span>
              )}
            </div>

            {/* Events for this day */}
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              {day.events.length === 0 ? (
                <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                  No events
                </div>
              ) : (
                day.events.map(ev => {
                  const style = TYPE_COLORS[ev.type] || TYPE_COLORS.milestone;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: style.bg,
                        borderLeft: `3px solid ${ev.isOverdue ? '#DC2626' : style.border}`,
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '3px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: style.text,
                            backgroundColor: 'var(--color-surface)',
                            padding: '1px 4px',
                            borderRadius: '3px',
                          }}
                        >
                          {ev.type}
                        </span>
                        {ev.isOverdue && <AlertTriangle size={12} style={{ color: '#DC2626' }} />}
                        {ev.isOnHold && <PauseCircle size={12} style={{ color: '#D97706' }} />}
                      </div>

                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.25 }}>
                        {ev.title}
                      </div>

                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {ev.workOrderId}
                      </div>

                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {ev.ownerName}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
