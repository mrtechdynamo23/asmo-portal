// ==========================================================================
// ASMO Work Order Control Tower — Calendar Toolbar
// ==========================================================================
import React from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  LayoutGrid, CalendarDays, ListFilter, Search
} from 'lucide-react';
import { CalendarViewMode } from '../../types/calendar';

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  searchQuery: string;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onSelectMonth: (year: number, month: number) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onSearchChange: (query: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentDate,
  viewMode,
  searchQuery,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onSelectMonth,
  onViewModeChange,
  onSearchChange,
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  return (
    <div
      className="card"
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Left: Navigation Controls & Month/Year Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onNavigateToday}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 12px',
            border: '1px solid var(--asmo-primary)',
            color: 'var(--asmo-primary)',
          }}
          title="Jump to 14 Oct 2026 simulation date"
        >
          Today
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onNavigatePrev}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 8px' }}
            aria-label="Previous period"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNavigateNext}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 8px' }}
            aria-label="Next period"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Quick Month & Year Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={currentMonthIdx}
            onChange={(e) => onSelectMonth(currentYear, Number(e.target.value))}
            className="select"
            style={{
              height: '36px',
              minHeight: '36px',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => onSelectMonth(Number(e.target.value), currentMonthIdx)}
            className="select"
            style={{
              height: '36px',
              minHeight: '36px',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Middle: Broad Search Bar */}
      <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '460px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search calendar events, Work Orders, owners..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
          style={{
            width: '100%',
            height: '42px',
            minHeight: '42px',
            paddingLeft: '40px',
            fontSize: '13px',
          }}
        />
      </div>

      {/* Right: View Mode Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-alt)',
          padding: '3px',
          borderRadius: '8px',
          gap: '2px',
        }}
      >
        <button
          onClick={() => onViewModeChange('month')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'month' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'month' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
            fontWeight: viewMode === 'month' ? 700 : 500,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: viewMode === 'month' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <LayoutGrid size={14} />
          <span>Month</span>
        </button>

        <button
          onClick={() => onViewModeChange('week')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'week' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'week' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
            fontWeight: viewMode === 'week' ? 700 : 500,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: viewMode === 'week' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <CalendarDays size={14} />
          <span>Week</span>
        </button>

        <button
          onClick={() => onViewModeChange('agenda')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'agenda' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'agenda' ? 'var(--asmo-primary)' : 'var(--color-text-secondary)',
            fontWeight: viewMode === 'agenda' ? 700 : 500,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: viewMode === 'agenda' ? 'var(--shadow-xs)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          <ListFilter size={14} />
          <span>Agenda</span>
        </button>
      </div>
    </div>
  );
};
