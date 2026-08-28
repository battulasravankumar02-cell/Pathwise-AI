import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} color="var(--color-success)" />,
  error: <AlertCircle size={18} color="var(--color-error)" />,
  warning: <AlertTriangle size={18} color="var(--color-warning)" />,
  info: <Info size={18} color="var(--color-primary)" />,
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          {ICONS[toast.type]}
          <span className="toast-message">{toast.message}</span>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            style={{ flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
