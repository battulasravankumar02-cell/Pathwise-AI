/**
 * Shared UI Components
 * Card, Badge, ProgressBar, Modal, Tabs, StatCard, EmptyState, LoadingState
 */
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// ============================================================
// CARD
// ============================================================
export function Card({ children, className = '', hover = false, style = {}, onClick }) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

// ============================================================
// BADGE
// ============================================================
const BADGE_VARIANTS = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  accent: 'badge-accent',
  muted: 'badge-muted',
  info: 'badge-info',
};

export function Badge({ children, variant = 'primary', icon }) {
  return (
    <span className={`badge ${BADGE_VARIANTS[variant] || 'badge-muted'}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================
export function ProgressBar({ value, max = 100, variant = 'primary', size = 'base', showLabel = false, label }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`progress-bar-${size}`}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          <span>{label || ''}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar-container" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={label || `${Math.round(percentage)}% complete`}>
        <div
          className={`progress-bar-fill ${variant !== 'primary' ? variant : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================
export function Modal({ isOpen, onClose, title, children, size = '', footer }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`modal ${size ? `modal-${size}` : ''}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================
// TABS
// ============================================================
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="Page tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={active === tab.id}
          id={`tab-${tab.id}`}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon} </span>}
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: 4,
              background: active === tab.id ? 'var(--color-primary)' : 'var(--color-surface-alt)',
              color: active === tab.id ? 'white' : 'var(--color-text-muted)',
              borderRadius: '999px',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
            }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
export function StatCard({ label, value, meta, icon, iconBg = 'var(--color-primary-light)', iconColor = 'var(--color-primary)', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && (
          <div className="stat-card-icon" style={{ background: iconBg }}>
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {meta && <div className="stat-card-meta">{meta}</div>}
      {trend && (
        <div style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          color: trend.direction === 'up' ? 'var(--color-success)' : 'var(--color-error)',
        }}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-text">{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================================
// LOADING STATE
// ============================================================
export function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" role="status" aria-label={text} />
      <p className="loading-state-text">{text}</p>
    </div>
  );
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{message}</p>
    </Modal>
  );
}

// ============================================================
// PRIORITY INDICATOR
// ============================================================
export function PriorityIndicator({ category }) {
  const config = {
    HIGH: { color: 'var(--color-high)', label: '🔴 HIGH', badge: 'error' },
    MEDIUM: { color: 'var(--color-medium)', label: '🟡 MEDIUM', badge: 'warning' },
    LOW: { color: 'var(--color-low)', label: '🟢 LOW', badge: 'success' },
  }[category] || { color: 'var(--color-text-muted)', label: category, badge: 'muted' };

  return (
    <div className="priority-indicator">
      <div className={`priority-dot ${category?.toLowerCase()}`} style={{ background: config.color }} aria-hidden="true" />
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: config.color }}>{config.label}</span>
    </div>
  );
}

// ============================================================
// DIFFICULTY BADGE
// ============================================================
export function DifficultyBadge({ category }) {
  const config = {
    'Difficult': 'error',
    'Moderate': 'warning',
    'Easy': 'success',
  }[category] || 'muted';

  return <Badge variant={config}>{category}</Badge>;
}

// ============================================================
// SECTION HEADER
// ============================================================
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="page-top">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ============================================================
// DEMO BANNER (REMOVED FOR PRODUCTION REAL-USER SYSTEM)
// ============================================================
export function DemoBanner() {
  return null;
}

// ============================================================
// INLINE ALERT
// ============================================================
export function Alert({ type = 'info', children }) {
  const config = {
    info: { bg: 'var(--color-info-light)', color: 'var(--color-info)', icon: 'ℹ️' },
    success: { bg: 'var(--color-success-light)', color: 'var(--color-success)', icon: '✅' },
    warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)', icon: '⚠️' },
    error: { bg: 'var(--color-error-light)', color: 'var(--color-error)', icon: '🚨' },
  }[type];

  return (
    <div role="alert" style={{
      background: config.bg,
      border: `1px solid ${config.color}30`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-4)',
      display: 'flex',
      gap: 'var(--space-3)',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-text-primary)',
    }}>
      <span>{config.icon}</span>
      <span>{children}</span>
    </div>
  );
}
