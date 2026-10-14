import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Bell, ChevronDown, Check, RotateCcw, Search, User as UserIcon,
  Sun, Moon, Menu, X, ArrowRight, ShieldCheck, ChevronRight,
  Command, ExternalLink
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    users,
    setCurrentUser,
    notifications,
    workOrders,
    markNotificationRead,
    markAllNotificationsRead,
    resetToSeedData,
  } = useStore();

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('asmo_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('asmo_theme', theme);
  }, [theme]);

  const personaRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPersonaOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setIsPersonaOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-entity search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return workOrders
      .filter(w =>
        w.id.toLowerCase().includes(q) ||
        w.title.toLowerCase().includes(q) ||
        w.requestingBusinessUnit.toLowerCase().includes(q) ||
        w.lifecycleStatus.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [searchQuery, workOrders]);

  // Dynamic route-driven breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, idx) => {
    let label = part.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    if (part === 'control-tower') label = 'Control Tower';
    if (part.startsWith('WO-ASMO')) label = part;
    return {
      label,
      path: '/' + pathParts.slice(0, idx + 1).join('/'),
      isLast: idx === pathParts.length - 1,
    };
  });

  const handleReset = () => {
    if (window.confirm('Reset all Work Order Control Tower demo state back to baseline seed?')) {
      resetToSeedData();
      alert('Demo data has been reset to seed baseline.');
    }
  };

  return (
    <>
      <header
        style={{
          height: '64px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {/* Left: Brand Plate, Sidebar Toggle & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn btn-secondary btn-sm"
              title="Toggle Sidebar"
              style={{ padding: '6px', border: '1px solid var(--color-border)' }}
            >
              <Menu size={16} />
            </button>
          )}

          <Link to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '0.75rem' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <img src="/brand/asmo-logo.jpg" alt="ASMO Logo" style={{ height: '32px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--asmo-walnut)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                ASMO <span style={{ color: 'var(--asmo-primary)' }}>Control Tower</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Enterprise Work Order Governance
              </div>
            </div>
          </Link>

          {/* Breadcrumbs */}
          {breadcrumbItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '1rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
              <Link to="/home" style={{ fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                Home
              </Link>
              {breadcrumbItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                  {item.isLast ? (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--asmo-primary)' }}>
                      {item.label}
                    </span>
                  ) : (
                    <Link to={item.path} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar (with Ctrl+K) */}
        <div
          onClick={() => setIsSearchOpen(true)}
          style={{
            flex: '1',
            maxWidth: '460px',
            height: '42px',
            margin: '0 1.5rem',
            padding: '0 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            <Search size={16} />
            <span>Search Work Orders, deliverables, RAID...</span>
          </div>
          <kbd
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Ctrl K
          </kbd>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-sm"
            title="Reset demo data to seed state"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px' }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ padding: '6px' }}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Notifications Popover */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="btn btn-secondary btn-sm"
              title="Notifications"
              style={{ position: 'relative', padding: '6px' }}
            >
              <Bell size={16} />
              {unreadNotifs.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: 'var(--asmo-primary)',
                    color: '#FFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 2px var(--color-surface)',
                  }}
                >
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '340px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--color-surface-raised)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>Notifications ({unreadNotifs.length})</div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      style={{ background: 'none', border: 'none', color: 'var(--asmo-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--color-divider)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--asmo-primary-light)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: n.isRead ? 500 : 700 }}>{n.title}</span>
                        {!n.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--asmo-primary)' }} />}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Persona Switcher */}
          <div ref={personaRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '4px 10px 4px 6px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--asmo-primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--asmo-primary)', fontWeight: 600 }}>
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {isPersonaOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '320px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-raised)' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>Switch Role Persona (14 Users)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Current: <strong>{currentUser.role}</strong>
                  </div>
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsPersonaOpen(false);
                        }}
                        style={{
                          padding: '8px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--asmo-primary-light)' : 'transparent',
                          borderBottom: '1px solid var(--color-divider)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'var(--asmo-primary)' : 'var(--color-border)',
                              color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                            }}
                          >
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: 'var(--color-text)' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                              {u.role} • {u.department}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} style={{ color: 'var(--asmo-primary)' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal (Ctrl + K) */}
      {isSearchOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsSearchOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <Search size={18} style={{ color: 'var(--asmo-primary)', marginRight: '10px' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search Work Orders by ID, title, or business unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', color: 'var(--color-text)' }}
              />
              <button onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {searchQuery.length < 2 ? 'Type at least 2 characters to search...' : 'No matching Work Orders found.'}
                </div>
              ) : (
                searchResults.map(wo => (
                  <div
                    key={wo.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/control-tower/${wo.id}`);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    className="table-row-hover"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '11px', color: 'var(--asmo-primary)' }}>
                          {wo.id}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{wo.title}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {wo.requestingBusinessUnit} • {wo.lifecycleStatus}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
