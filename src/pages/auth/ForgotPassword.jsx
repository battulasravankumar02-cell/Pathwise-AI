import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService.js';
import AuthLayout from '../../components/auth/AuthLayout.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    await authService.resetPassword(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your registered email to receive reset instructions"
      heroBadge="Account Recovery"
      footer={
        <Link
          to="/login"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      }
    >
      {sent ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Check your inbox
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
            If a PathWise AI account exists for <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>, a secure password reset link has been sent.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }}>
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              role="alert"
              style={{
                background: 'var(--color-error-light)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-error)',
                marginBottom: 'var(--space-4)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
            <label htmlFor="reset-email" className="form-label">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              className="form-input"
              placeholder="student@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', height: 46 }}
            disabled={loading}
          >
            {loading ? 'Sending Instructions...' : <>Send Reset Instructions <ArrowRight size={15} /></>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
