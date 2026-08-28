import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from '../../components/auth/AuthLayout.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const result = await signup(email, password, name);
    setLoading(false);
    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.error || 'Unable to create account. Please try again.');
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'var(--color-error)', 'var(--color-warning)', 'var(--color-success)'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join ambitious students forging international engineering careers"
      heroBadge="Start Your Career Journey"
      footer={
        <span>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Sign in here
          </Link>
        </span>
      }
    >
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
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="signup-name" className="form-label">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            className="form-input"
            placeholder="e.g. Alex Rivera"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="signup-email" className="form-label">
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            className="form-input"
            placeholder="student@university.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="signup-password" className="form-label">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="signup-password"
              type={showPw ? 'text' : 'password'}
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3.5,
                      borderRadius: 2,
                      background: i <= strength ? strengthColors[strength] : 'var(--color-border)',
                      transition: 'background 200ms ease',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 10, color: strengthColors[strength], marginTop: 3, fontWeight: 700 }}>
                {strengthLabels[strength]}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center', height: 46, marginTop: 'var(--space-2)' }}
          disabled={loading}
          id="signup-submit-btn"
        >
          {loading ? 'Creating Account...' : <>Create Free Account <ArrowRight size={15} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
