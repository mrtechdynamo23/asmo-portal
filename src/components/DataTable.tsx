import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronDown, ChevronUp, ChevronsUpDown, Download, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  defaultSortField?: string;
  defaultSortDir?: 'asc' | 'desc';
  pageSize?: number;
  exportFilename?: string;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  onRowClick,
  defaultSortField,
  defaultSortDir = 'asc',
  pageSize: initialPageSize = 10,
  exportFilename = 'ASMO-Export.csv',
  emptyMessage = 'No records found matching criteria',
  actions,
}: DataTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(defaultSortField || (columns[0] ? columns[0].key : ''));
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const scrollToTop = () => {
    // 1. Scroll main container to top
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 2. Scroll table into view
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // 3. Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToTop();
  };

  // Search filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(item => {
      return columns.some(col => {
        const val = item[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map(c => c.label);
    const rows = sortedData.map(item =>
      columns.map(c => {
        const val = item[c.key];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="data-table-container" ref={tableContainerRef}>
      {/* Table Header / Action Strip */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div>
          {title && <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                height: '40px',
                padding: '8px 14px 8px 38px',
                fontSize: '13px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            />
          </div>

          {actions}

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            title="Export CSV"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {columns.map(col => {
                const isSorted = sortField === col.key;
                return (
                  <th
                    key={col.key}
                    style={{
                      textAlign: col.align || 'left',
                      width: col.width,
                      minWidth: col.width,
                      whiteSpace: 'nowrap',
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                      }}
                    >
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span>
                          {isSorted ? (
                            sortDir === 'asc' ? <ChevronUp size={13} style={{ color: 'var(--asmo-primary)' }} /> : <ChevronDown size={13} style={{ color: 'var(--asmo-primary)' }} />
                          ) : (
                            <ChevronsUpDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className={onRowClick ? 'table-row-hover' : ''}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align || 'left',
                        width: col.width,
                        minWidth: col.width,
                      }}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Strip */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-raised)',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div>
          Showing <strong>{sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{' '}
          <strong>{Math.min(page * pageSize, sortedData.length)}</strong> of <strong>{sortedData.length}</strong> records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              handlePageChange(1);
            }}
            style={{
              padding: '3px 6px',
              fontSize: '11px',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <button
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
            style={{ opacity: page === 1 ? 0.4 : 1, padding: '4px 6px' }}
          >
            <ChevronLeft size={14} />
          </button>

          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages}
            className="btn btn-secondary btn-sm"
            style={{ opacity: page >= totalPages ? 0.4 : 1, padding: '4px 6px' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
