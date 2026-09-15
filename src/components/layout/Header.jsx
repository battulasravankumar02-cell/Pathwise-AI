import React, { useState } from 'react';
import { Menu, Bell, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import NotificationsPanel from './NotificationsPanel.jsx';

export default function Header({ title, onOpenMenu }) {
  const { toggleTheme, theme, setSidebarOpen, unreadCount, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  function handleMenuClick() {
    if (onOpenMenu) {
      onOpenMenu();
    } else {
      setSidebarOpen(prev => !prev);
    }
  }

  return (
    <header className="header" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          className="mobile-hamburger"
          onClick={handleMenuClick}
          aria-label="Toggle navigation menu"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Theme Toggle */}
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            aria-label={`Notifications (${unreadCount} unread)`}
            id="notifications-btn"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot" aria-hidden="true" />}
          </button>

          {showNotifications && (
            <NotificationsPanel
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
            />
          )}
        </div>

        {/* User Profile Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-1) var(--space-3)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          cursor: 'default',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'PW'}
          </div>
          <span>
            {user?.name?.split(' ')[0] || 'Student'}
          </span>
        </div>
      </div>
    </header>
  );
}
