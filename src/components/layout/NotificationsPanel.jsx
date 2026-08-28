import React, { useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';

const TYPE_ICONS = {
  exam: '📅',
  assignment: '📝',
  target: '✅',
  streak: '🔥',
  achievement: '🏆',
  reminder: '⏰',
};

export default function NotificationsPanel({ notifications, onClose, onMarkRead }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const unread = notifications.filter(n => !n.read);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 340,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 500,
        overflow: 'hidden',
        animation: 'slideUp 200ms ease',
      }}
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          <Bell size={16} />
          Notifications
          {unread.length > 0 && (
            <span style={{
              background: 'var(--color-error)',
              color: 'white',
              borderRadius: '999px',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
            }}>{unread.length}</span>
          )}
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close notifications">
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">🔔</div>
            <p className="empty-state-title" style={{ fontSize: 'var(--font-size-sm)' }}>No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-5)',
                borderBottom: '1px solid var(--color-border-light)',
                background: n.read ? 'transparent' : 'rgba(79,110,247,0.04)',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onClick={() => onMarkRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onMarkRead(n.id)}
              aria-label={`Notification: ${n.title}`}
            >
              <span style={{ fontSize: 18, marginTop: 2 }}>{TYPE_ICONS[n.type] || '📌'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 2,
                }}>{n.title}</div>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.4,
                }}>{n.message}</div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--color-text-muted)',
                  marginTop: 4,
                }}>{n.time}</div>
              </div>
              {!n.read && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  marginTop: 6,
                  flexShrink: 0,
                }} aria-hidden="true" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
