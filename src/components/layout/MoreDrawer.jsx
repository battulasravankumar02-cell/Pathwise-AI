import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X, BarChart2, Flame, Award, BookOpen, Clock, Calendar,
  MessageSquare, User, Settings, LogOut, CheckSquare, FolderOpen,
  ChevronRight, Moon, Sun, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function MoreDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, streak, profile } = useApp();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  async function handleLogout() {
    onClose();
    await logout();
    navigate('/login');
  }

  const initials = (profile?.name || user?.name || 'PathWise Student')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PW';

  const MORE_ITEMS = [
    {
      section: 'ACADEMIC & INTELLIGENCE',
      items: [
        { to: '/academic', icon: BookOpen, label: 'Attendance & Syllabus', desc: 'Calculator & syllabus difficulty' },
        { to: '/analytics', icon: BarChart2, label: 'Performance & Analytics', desc: 'Holistic diagnostic score' },
        { to: '/ai-assistant', icon: MessageSquare, label: 'AI Mentor Copilot', desc: 'Personalized career advisor' },
        { to: '/skill-quiz', icon: Award, label: 'Skill Diagnostic Quiz', desc: 'Benchmark technical gaps' },
      ],
    },
    {
      section: 'STUDY & CONSISTENCY',
      items: [
        { to: '/habits', icon: Flame, label: 'Habit Streak', desc: `${streak?.currentStreak || 0} day active streak` },
        { to: '/timer', icon: Clock, label: 'Study Velocity Timer', desc: 'Track focused study sessions' },
        { to: '/targets', icon: CheckSquare, label: 'Learning Targets', desc: 'Daily, weekly & monthly milestones' },
        { to: '/calendar', icon: Calendar, label: 'Unified Calendar', desc: 'Deadlines & schedule view' },
        { to: '/study-vault', icon: FolderOpen, label: 'Study Vault', desc: 'Saved notes & resources' },
      ],
    },
    {
      section: 'ACCOUNT & SYSTEM',
      items: [
        { to: '/settings', icon: Settings, label: 'Settings & Career Goal', desc: 'Edit goals, profile & BYOK AI' },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="more-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Application Menu">
      <div className="more-drawer-container" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Pull Handle */}
        <div className="more-drawer-handle" aria-hidden="true" />

        {/* Drawer Header */}
        <div className="more-drawer-header">
          <div className="more-drawer-user-pill">
            <div className="more-drawer-avatar">{initials}</div>
            <div className="more-drawer-user-details">
              <div className="more-drawer-user-name">
                {profile?.name || user?.name || 'PathWise Student'}
              </div>
              <div className="more-drawer-user-sub">
                <ShieldCheck size={11} color="var(--color-success)" />
                <span>{user?.email || 'Authenticated Student'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Quick theme toggle */}
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Close button */}
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="more-drawer-content">
          {MORE_ITEMS.map(section => (
            <div key={section.section} className="more-drawer-section">
              <div className="more-drawer-section-title">{section.section}</div>
              <div className="more-drawer-grid">
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `more-drawer-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="more-drawer-icon-box">
                      <item.icon size={18} />
                    </div>
                    <div className="more-drawer-item-text">
                      <div className="more-drawer-item-label">{item.label}</div>
                      <div className="more-drawer-item-desc">{item.desc}</div>
                    </div>
                    <ChevronRight size={14} className="more-drawer-chevron" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer Actions */}
        <div className="more-drawer-footer">
          <button
            className="more-drawer-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <div className="more-drawer-version">
            PathWise AI · Personal Intelligence
          </div>
        </div>

      </div>
    </div>
  );
}
