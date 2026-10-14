// ==========================================================================
// ASMO Work Order Control Tower — Calendar Month View
// ==========================================================================
import React, { useState } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { PauseCircle, AlertTriangle, X } from 'lucide-react';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SIMULATION_TODAY = '2026-10-14';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  milestone: { bg: 'rgba(162, 28, 32, 0.12)', text: '#A21C20', border: 'rgba(162, 28, 32, 0.35)' },
  deliverable: { bg: 'rgba(8, 145, 178, 0.12)', text: '#0891B2', border: 'rgba(8, 145, 178, 0.35)' },
  review: { bg: 'rgba(217, 119, 6, 0.12)', text: '#D97706', border: 'rgba(217, 119, 6, 0.35)' },
  authorisation: { bg: 'rgba(5, 150, 105, 0.12)', text: '#059669', border: 'rgba(5, 150, 105, 0.35)' },
  change_request: { bg: 'rgba(124, 58, 237, 0.12)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.35)' },
  closure: { bg: 'rgba(75, 85, 99, 0.12)', text: '#4B5563', border: 'rgba(75, 85, 99, 0.35)' },
};

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
  }[] = [];

  // Trailing previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDayNum = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`;
    cells.push({
      dayNumber: prevDayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === SIMULATION_TODAY,
      events: events.filter(e => e.date === dateStr),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === SIMULATION_TODAY,
      events: events.filter(e => e.date === dateStr),
    });
  }

  // Leading next month days
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === SIMULATION_TODAY,
      events: events.filter(e => e.date === dateStr),
    });
  }

  const modalEvents = dayModalDate ? events.filter(e => e.date === dayModalDate) : [];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '10px' }}>
      {/* Weekday Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: 'var(--color-surface-raised)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            style={{
              padding: '10px 8px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: idx === 0 || idx === 6 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: 'var(--color-border)',
          gap: '1px',
        }}
      >
        {cells.map((cell) => {
          const maxVisible = 3;
          const visibleEvents = cell.events.slice(0, maxVisible);
          const overflowCount = cell.events.length - maxVisible;

          return (
            <div
              key={cell.dateStr}
              style={{
                backgroundColor: cell.isCurrentMonth ? 'var(--color-surface)' : 'var(--color-surface-raised)',
                minHeight: '110px',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                opacity: cell.isCurrentMonth ? 1 : 0.65,
                position: 'relative',
              }}
            >
              {/* Day Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: cell.isToday ? 800 : cell.isCurrentMonth ? 600 : 400,
                    width: cell.isToday ? '24px' : 'auto',
                    height: cell.isToday ? '24px' : 'auto',
                    borderRadius: cell.isToday ? '50%' : 'none',
                    backgroundColor: cell.isToday ? 'var(--asmo-primary)' : 'transparent',
                    color: cell.isToday ? '#FFFFFF' : 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cell.dayNumber}
                </span>

                {cell.isToday && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: 'var(--asmo-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Today
                  </span>
                )}
              </div>

              {/* Event Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                {visibleEvents.map((ev) => {
                  const style = TYPE_COLORS[ev.type] || TYPE_COLORS.milestone;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      style={{
                        padding: '2px 5px',
                        borderRadius: '4px',
                        backgroundColor: style.bg,
                        borderLeft: `3px solid ${ev.isOverdue ? '#DC2626' : style.text}`,
                        color: style.text,
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'transform 0.1s',
                      }}
                      title={`${ev.title} (${ev.workOrderId})`}
                    >
                      {ev.isOverdue && <AlertTriangle size={10} style={{ color: '#DC2626', flexShrink: 0 }} />}
                      {ev.isOnHold && <PauseCircle size={10} style={{ color: '#D97706', flexShrink: 0 }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>
                    </div>
                  );
                })}

                {overflowCount > 0 && (
                  <button
                    onClick={() => setDayModalDate(cell.dateStr)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--asmo-primary)',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '1px 2px',
                    }}
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Day Modal */}
      {dayModalDate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1150,
          }}
          onClick={() => setDayModalDate(null)}
        >
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Events for {dayModalDate}
              </h3>
              <button onClick={() => setDayModalDate(null)} className="modal-close-btn" aria-label="Close modal">
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {modalEvents.map((ev) => {
                const style = TYPE_COLORS[ev.type] || TYPE_COLORS.milestone;
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setDayModalDate(null);
                      onSelectEvent(ev);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: style.bg,
                      borderLeft: `3px solid ${ev.isOverdue ? '#DC2626' : style.text}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: style.text }}>{ev.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {ev.workOrderId} • {ev.ownerName} • {ev.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
