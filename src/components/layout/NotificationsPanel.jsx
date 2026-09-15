import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, ArrowRight } from 'lucide-react';

const TYPE_ICONS = {
  study_topic: '📖',
  target: '🎯',
  assignment_due: '⏰',
  assignment_overdue: '⚠️',
  deadline: '📅',
  exam: '📅',
  assignment: '📝',
  streak: '🔥',
  achievement: '🏆',
  reminder: '⏰',
};

export default function NotificationsPanel({ notifications = [], onClose, onMarkRead, onMarkAllRead }) {
  const panelRef = useRef(null);
  const navigate = useNavigate();

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

  function handleItemClick(n) {
    if (onMarkRead) {
      onMarkRead(n.id);
    }
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 'min(360px, calc(100vw - 20px))',
        maxWidth: 'calc(100vw - 20px)',
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
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          <Bell size={16} className="text-primary" />
          <span>Notifications</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {unread.length > 0 && onMarkAllRead && (
            <button
              className="btn btn-ghost btn-xs"
              onClick={onMarkAllRead}
              title="Mark all as read"
              style={{ fontSize: 11, padding: '2px 6px', gap: 4, display: 'flex', alignItems: 'center' }}
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close notifications">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 380, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon">🔔</div>
            <p className="empty-state-title" style={{ fontSize: 'var(--font-size-sm)' }}>All caught up!</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              No pending reminders for today's topics or assignments.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border-light)',
                background: n.read ? 'transparent' : 'rgba(79, 110, 247, 0.05)',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onClick={() => handleItemClick(n)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleItemClick(n)}
              aria-label={`Notification: ${n.title}`}
            >
              <span style={{ fontSize: 20, marginTop: 1, flexShrink: 0 }}>
                {TYPE_ICONS[n.type] || '📌'}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {n.title}
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: n.urgency === 'urgent' ? 'var(--color-error)' : 'var(--color-text-muted)',
                    fontWeight: n.urgency === 'urgent' ? 700 : 500,
                    flexShrink: 0,
                  }}>
                    {n.time}
                  </span>
                </div>

                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.45,
                  whiteSpace: 'pre-line',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}>
                  {n.message}
                </div>

                {n.actionLabel && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    marginTop: 6,
                  }}>
                    <span>{n.actionLabel}</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>

              {!n.read && (
                <div style={{
                  width: 7,
                  height: 7,
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
