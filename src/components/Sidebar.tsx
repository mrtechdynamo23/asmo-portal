import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, PlusCircle, BookOpen, BarChart3,
  SlidersHorizontal, Home, Shield, Sparkles, CheckSquare,
  Milestone, PackageCheck, AlertOctagon, GitPullRequest,
  Settings, ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const { currentUser, workOrders, reviewTasks } = useStore();

  const activeWorkOrdersCount = workOrders.filter(
    w => !['Closed', 'Cancelled'].includes(w.lifecycleStatus)
  ).length;

  const onHoldCount = workOrders.filter(w => w.isOnHold).length;
  const pendingActionsCount = reviewTasks.filter(t => t.decision === 'Pending').length;

  const isItemActive = (path: string) => {
    if (path === '/control-tower/dashboard') {
      return location.pathname === '/control-tower/dashboard';
    }
    if (path === '/control-tower') {
      return (
        location.pathname === '/control-tower' ||
        (location.pathname.startsWith('/control-tower/') && location.pathname !== '/control-tower/dashboard')
      );
    }
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/home', label: 'Application Home', icon: Home },
    { path: '/control-tower/dashboard', label: 'Overview & Dashboard', icon: LayoutDashboard },
    { path: '/control-tower', label: 'Work Orders', icon: Layers, badge: activeWorkOrdersCount },
    { path: '/action-centre', label: 'Action Centre', icon: CheckSquare, badge: pendingActionsCount, badgeColor: '#A66A13' },
    { path: '/services', label: 'Service Catalogue', icon: BookOpen },
    { path: '/milestones', label: 'Milestones', icon: Milestone },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/deliverables', label: 'Deliverables', icon: PackageCheck },
    { path: '/raid', label: 'RAID Register', icon: AlertOctagon },
    { path: '/change-requests', label: 'Change Requests', icon: GitPullRequest },
    { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { path: '/admin', label: 'Administration', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '68px' : '260px',
        backgroundColor: 'var(--asmo-walnut-dark)',
        color: '#E7E2DE',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        overflowY: 'auto',
        transition: 'width var(--transition-base)',
        zIndex: 30,
      }}
    >
      {/* Top Section */}
      <div
        style={{
          padding: collapsed ? '1rem 0' : '1.25rem 1.25rem 0.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#A89E96',
              fontWeight: 700,
            }}
          >
            Work Order Modules
          </div>
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: '#A89E96',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '0.5rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: collapsed ? '10px 0' : '8px 12px',
                borderRadius: '6px',
                color: isActive ? '#FFFFFF' : '#C7BFB8',
                backgroundColor: isActive ? 'rgba(162, 28, 32, 0.28)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--asmo-primary)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} style={{ color: item.badgeColor || 'var(--asmo-primary)', flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: item.badgeColor ? `${item.badgeColor}33` : 'rgba(255,255,255,0.12)',
                    color: item.badgeColor || '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '8px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />

        {/* Back to landing */}
        <Link
          to="/"
          title={collapsed ? 'Landing Page' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: collapsed ? '10px 0' : '8px 12px',
            borderRadius: '6px',
            color: location.pathname === '/' ? '#FFFFFF' : '#A89E96',
            backgroundColor: location.pathname === '/' ? 'rgba(162, 28, 32, 0.28)' : 'transparent',
            borderLeft: location.pathname === '/' ? '3px solid var(--asmo-primary)' : '3px solid transparent',
            textDecoration: 'none',
            fontSize: '11px',
            transition: 'all 0.15s',
          }}
        >
          <Sparkles size={15} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Landing & Slideshow</span>}
        </Link>
      </nav>

      {/* On-Hold Alert Indicator */}
      {!collapsed && onHoldCount > 0 && (
        <div
          style={{
            margin: '0.625rem',
            padding: '0.625rem 0.75rem',
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.35)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>⚠️ {onHoldCount} Orders On Hold</span>
          </div>
          <div style={{ fontSize: '10px', color: '#D6CFC9', marginTop: '2px' }}>
            Underlying states preserved
          </div>
        </div>
      )}

      {/* User Card */}
      <div
        style={{
          padding: collapsed ? '0.75rem 0' : '0.875rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--asmo-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--asmo-primary)', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
