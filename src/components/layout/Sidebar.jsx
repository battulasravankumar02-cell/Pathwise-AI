import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Target, Compass, CheckSquare, Timer,
  Activity, Calendar, ClipboardList, FileText, BarChart2,
  MessageSquare, FolderOpen, Settings, LogOut, X, Award,
  Sparkles, ShieldCheck, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

const NAV_ITEMS = [
  { section: 'OVERVIEW', items: [
    { to: '/', icon: Home, label: 'Home Dashboard' },
  ]},
  { section: 'CAREER & SKILLS', items: [
    { to: '/roadmap', icon: Sparkles, label: 'FutureForge', badge: 'Core' },
    { to: '/goal-career', icon: Compass, label: 'Goal & Career' },
    { to: '/skill-quiz', icon: Award, label: 'Skill Quiz' },
  ]},
  { section: 'LEARNING & PRODUCTIVITY', items: [
    { to: '/targets', icon: CheckSquare, label: 'Targets Engine' },
    { to: '/timer', icon: Timer, label: 'Study Timer' },
    { to: '/habits', icon: Activity, label: 'Habits & Streaks', streakBadge: true },
    { to: '/study-vault', icon: FolderOpen, label: 'Study Vault' },
  ]},
  { section: 'PLANNING & ACADEMICS', items: [
    { to: '/calendar', icon: Calendar, label: 'Unified Calendar' },
    { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/exams', icon: FileText, label: 'Exam Planner' },
    { to: '/academic', icon: BookOpen, label: 'Academic & Attendance' },
  ]},
  { section: 'INTELLIGENCE', items: [
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/ai-assistant', icon: MessageSquare, label: 'AI Assistant' },
  ]},
  { section: 'ACCOUNT', items: [
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, streak } = useApp();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PW';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* ── BRAND MARK ── */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" aria-hidden="true">
            {/* Forge icon — teal core, champagne accent */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5" opacity="0.6"/>
              <path d="M2 12l10 5 10-5" opacity="0.8"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">PathWise AI</span>
            <span className="sidebar-logo-sub">Forge Your Future</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-ghost btn-icon btn-sm"
            style={{ color: 'rgba(255,255,255,0.4)', display: 'none', flexShrink: 0 }}
            id="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── NAVIGATION ── */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-label={item.label}
                >
                  <item.icon size={15} className="sidebar-item-icon" aria-hidden="true" />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {/* Streak badge */}
                  {item.streakBadge && streak?.currentStreak > 0 && (
                    <span style={{
                      background: 'rgba(194, 105, 42, 0.15)',
                      color: '#d4af7a',
                      borderRadius: '999px',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      flexShrink: 0,
                    }}>
                      {streak.currentStreak}
                      <Flame size={9} />
                    </span>
                  )}

                  {/* Core badge for FutureForge */}
                  {item.badge && (
                    <span style={{
                      background: 'rgba(13, 148, 136, 0.12)',
                      color: 'var(--color-sidebar-active)',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* ── USER / LOGOUT ── */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={handleLogout}
            title="Click to sign out"
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleLogout()}
          >
            <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'PathWise Student'}</div>
              <div className="sidebar-user-role" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <ShieldCheck size={10} color="var(--color-success)" />
                <span>Authenticated</span>
              </div>
            </div>
            <LogOut size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} aria-hidden="true" />
          </div>
        </div>

      </aside>
    </>
  );
}
