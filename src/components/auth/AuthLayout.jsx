import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, CheckSquare, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  heroBadge = 'Career & Skill Operating System',
}) {
  return (
    <div className="auth-container">
      {/* Background ambient lighting */}
      <div className="auth-ambient-light auth-ambient-teal" />
      <div className="auth-ambient-light auth-ambient-copper" />

      <div className="auth-split-wrapper">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Brand, Visual Career Journey & Intelligence     */}
        {/* ============================================================ */}
        <div className="auth-story-panel">
          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 11, textDecoration: 'none', marginBottom: 32 }}>
            <div className="auth-brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" opacity="0.6" />
                <path d="M2 12l10 5 10-5" opacity="0.8" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.025em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                PathWise AI
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-champagne-text, #c2692a)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Forge Your Future
              </div>
            </div>
          </Link>

          {/* Eyebrow Badge */}
          <div className="auth-eyebrow-badge">
            <Sparkles size={13} /> {heroBadge}
          </div>

          {/* Headline in DM Serif Display */}
          <h1 className="auth-story-headline">
            Forge Your Skills.<br />
            <span style={{ color: 'var(--color-champagne-text, #c2692a)' }}>Build Your Future.</span>
          </h1>

          <p className="auth-story-description">
            Your personal career operating system. Discover high-impact engineering milestones, complete daily structured targets, and master diagnostic quizzes on your path to global tech careers.
          </p>

          {/* Mini Career Pathway Journey Graphic */}
          <div className="auth-journey-stepper">
            <div className="auth-step-item">
              <div className="auth-step-dot done">✓</div>
              <div className="auth-step-content">
                <div className="auth-step-title">01. Define Career Goal</div>
                <div className="auth-step-desc">Target specialized role & global destination</div>
              </div>
            </div>

            <div className="auth-step-item">
              <div className="auth-step-dot active">2</div>
              <div className="auth-step-content">
                <div className="auth-step-title">02. FutureForge Roadmap</div>
                <div className="auth-step-desc">Staged milestone curriculum with practical capstones</div>
              </div>
            </div>

            <div className="auth-step-item">
              <div className="auth-step-dot pending">3</div>
              <div className="auth-step-content">
                <div className="auth-step-title">03. Daily Targets & Diagnostics</div>
                <div className="auth-step-desc">Actionable daily learning with zero hallucination quizzes</div>
              </div>
            </div>
          </div>

          {/* Trust Metrics Footer */}
          <div className="auth-trust-row">
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text-primary)' }}>100% Grounded</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Curriculum-backed quizzes</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text-primary)' }}>Real Velocity</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Computed analytics & streaks</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-text-primary)' }}>BYOK AI Core</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Gemini, OpenAI, Grok</div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Compact Premium Authentication Form Card       */}
        {/* ============================================================ */}
        <div className="auth-form-column">
          <div className="auth-form-card">
            {/* Mobile Header (visible only on small screens) */}
            <div className="auth-mobile-header">
              <div className="auth-brand-mark" style={{ width: 36, height: 36, margin: '0 auto 12px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" opacity="0.6" />
                  <path d="M2 12l10 5 10-5" opacity="0.8" />
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>PathWise AI</div>
              <div style={{ fontSize: 11, color: 'var(--color-champagne-text, #c2692a)', fontWeight: 600 }}>"Forge Your Skills. Build Your Future."</div>
            </div>

            <div className="auth-card-header">
              <h2 className="auth-card-title">{title}</h2>
              {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
            </div>

            {/* Form Content */}
            <div className="auth-card-body">
              {children}
            </div>

            {/* Card Footer Link */}
            {footer && (
              <div className="auth-card-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
