import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Compass, Target, CheckSquare, BookOpen, Award,
  BarChart2, ArrowRight, ShieldCheck, Clock, Layers, Zap,
  Flame, ChevronRight, MessageSquare, Check, Terminal, Globe,
  Activity, Star, FileText, ChevronDown, Moon, Sun, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import Hero3DCanvas from '../components/landing/Hero3DCanvas.jsx';
import FeatureTiltCard from '../components/landing/FeatureTiltCard.jsx';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => navigate(user ? '/' : '/signup');
  const handleLogin = () => navigate(user ? '/' : '/login');
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const PIPELINE_STEPS = [
    {
      step: '01', title: 'Define Career Destination',
      description: 'Choose your target role and country — Software Engineer in Germany, AI Engineer in the US, or any global tech market.',
      icon: <Compass size={20} />, color: '#0d9488',
    },
    {
      step: '02', title: 'Generate FutureForge Pathway',
      description: 'AI constructs a staged, milestone-driven skill roadmap from foundations through applied capstones to industry readiness.',
      icon: <Sparkles size={20} />, color: '#d4af7a',
    },
    {
      step: '03', title: 'Execute Daily Targets',
      description: 'Massive milestones become bite-sized daily execution goals with estimated completion times and streak tracking.',
      icon: <CheckSquare size={20} />, color: '#16a34a',
    },
    {
      step: '04', title: 'Validate via Skill Quizzes',
      description: 'Ground knowledge testing against your roadmap curriculum or uploaded study PDFs in the Study Vault.',
      icon: <Award size={20} />, color: '#c2692a',
    },
    {
      step: '05', title: 'Track Velocity & Launch',
      description: '100% real computed metrics ensure consistent momentum toward graduation and international career readiness.',
      icon: <BarChart2 size={20} />, color: '#d4af7a',
    },
  ];

  /* ── Dynamic Theme Tokens ── */
  const landingBg = 'var(--color-bg)';
  const surfaceBg = 'var(--color-surface)';
  const surfaceAlt = 'var(--color-surface-alt)';
  const borderCol = 'var(--color-border)';
  const textPrimary = 'var(--color-text-primary)';
  const textSecondary = 'var(--color-text-secondary)';
  const textMuted = 'var(--color-text-muted)';
  const teal = '#0d9488';
  const champagne = 'var(--color-champagne-text, #c2692a)';
  const copper = 'var(--color-accent, #c2692a)';

  return (
    <div style={{ minHeight: '100vh', background: landingBg, color: textPrimary, overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center',
        transition: 'all 300ms ease',
        background: navScrolled ? 'rgba(10,10,11,0.88)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(20px)' : 'none',
        borderBottom: navScrolled ? `1px solid ${borderCol}` : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: `linear-gradient(135deg, ${teal} 0%, #0f766e 60%, ${champagne} 130%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: `0 4px 14px rgba(13,148,136,0.35)`,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5" opacity="0.6"/>
                <path d="M2 12l10 5 10-5" opacity="0.8"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.025em', lineHeight: 1.1, color: textPrimary }}>PathWise AI</div>
              <div style={{ fontSize: 9, color: champagne, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>Forge Your Future</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="landing-nav-links">
            {[
              { label: 'How It Works', id: 'how-it-works' },
              { label: 'Career Path', id: 'career-journey' },
              { label: 'Features', id: 'features' },
              { label: 'AI Copilot', id: 'ai-copilot' },
            ].map(item => (
              <button key={item.id} onClick={() => scrollToSection(item.id)}
                style={{ background: 'none', border: 'none', color: textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em', padding: '4px 0', transition: 'color 150ms ease' }}
                onMouseEnter={e => e.currentTarget.style.color = textPrimary}
                onMouseLeave={e => e.currentTarget.style.color = textSecondary}
              >{item.label}</button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={toggleTheme}
              aria-label="Toggle theme" style={{ color: textSecondary }}>
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            {user ? (
              <button className="btn btn-sm" onClick={() => navigate('/')}
                style={{ background: teal, color: 'white', boxShadow: `0 2px 8px rgba(13,148,136,0.3)` }}>
                Open Dashboard <ChevronRight size={13} />
              </button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={handleLogin}
                  style={{ color: textSecondary, fontSize: 13 }}>
                  Sign In
                </button>
                <button className="btn btn-sm" onClick={handleGetStarted} id="landing-get-started-nav"
                  style={{ background: teal, color: 'white', boxShadow: `0 2px 8px rgba(13,148,136,0.3)` }}>
                  Get Started <ArrowRight size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: 130, paddingBottom: 80, overflow: 'hidden' }}>
        {/* Ambient lighting — teal top, copper right */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 500,
          background: `radial-gradient(ellipse, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.03) 40%, transparent 70%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '-5%',
          width: 400, height: 400,
          background: `radial-gradient(ellipse, rgba(194,105,42,0.06) 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center' }}
            className="hero-grid">

            {/* Left — Copy */}
            <div>
              {/* Eyebrow badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '5px 14px', marginBottom: 24,
                background: `rgba(13,148,136,0.1)`,
                border: `1px solid rgba(13,148,136,0.25)`,
                borderRadius: 999,
                color: teal, fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <Sparkles size={12} /> AI Career & Skill Operating System
              </div>

              {/* Headline — DM Serif Display for visual weight */}
              <h1 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                color: textPrimary,
                marginBottom: 20,
              }}>
                Forge Your Skills.<br />
                <span style={{ color: champagne }}>Build Your Future.</span>
              </h1>

              {/* Body */}
              <p style={{
                fontSize: 16, color: textSecondary, lineHeight: 1.65,
                maxWidth: 520, marginBottom: 32,
              }}>
                An intelligent career guidance and skill-development platform for students who are serious about building engineering careers — with clear roadmaps, daily targets, and grounded diagnostics.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <button className="btn btn-lg" onClick={handleGetStarted} id="hero-primary-cta"
                  style={{
                    background: teal, color: 'white',
                    padding: '13px 30px', fontSize: 14,
                    boxShadow: `0 8px 24px rgba(13,148,136,0.35)`,
                  }}>
                  Get Started Free <ArrowRight size={15} />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => scrollToSection('how-it-works')}
                  style={{ color: textSecondary, border: `1px solid ${borderCol}`, padding: '13px 24px', fontSize: 14 }}>
                  Explore System <ChevronDown size={15} />
                </button>
              </div>

              {/* Proof points */}
              <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${borderCol}`, paddingTop: 24, flexWrap: 'wrap' }}>
                {[
                  { stat: '100% Grounded', sub: 'Zero hallucination quizzes' },
                  { stat: 'Real Velocity', sub: 'Computed analytics & streaks' },
                  { stat: 'BYOK AI Core', sub: 'Gemini, OpenAI & Grok' },
                ].map((item, i) => (
                  <div key={i} style={{
                    paddingRight: 24, paddingLeft: i > 0 ? 24 : 0,
                    borderLeft: i > 0 ? `1px solid ${borderCol}` : 'none',
                    marginBottom: 4,
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: textPrimary }}>{item.stat}</div>
                    <div style={{ fontSize: 11, color: textMuted, fontWeight: 500 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 3D Canvas */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: `radial-gradient(circle at center, ${surfaceBg} 0%, ${landingBg} 100%)`,
                border: `1px solid ${borderCol}`,
                borderRadius: 24,
                overflow: 'hidden', position: 'relative',
                boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,122,0.06)`,
              }}>
                <div style={{ position: 'absolute', top: 14, left: 18, zIndex: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', boxShadow: '0 0 6px rgba(22,163,74,0.6)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: textMuted, letterSpacing: '0.06em' }}>
                    Career Forge · Interactive
                  </span>
                </div>

                <Hero3DCanvas style={{ height: 460 }} />

                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 10, color: textMuted, fontWeight: 600, background: 'rgba(10,10,11,0.75)', padding: '3px 10px', borderRadius: 99 }}>
                    Move cursor to explore
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section style={{ padding: '80px 24px', background: surfaceAlt, borderTop: `1px solid ${borderCol}`, borderBottom: `1px solid ${borderCol}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              The Core Problem
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 400, color: textPrimary, letterSpacing: '-0.01em', marginBottom: 12 }}>
              Why Do Capable Students Struggle to Reach High-Tier Tech Careers?
            </h2>
            <p style={{ fontSize: 14, color: textSecondary, maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
              Standard academic programs teach abstract theory without continuous competency validation, personalized progression, or clear global hiring roadmaps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {[
              { icon: <Compass size={20} />, color: '#dc2626', bg: 'rgba(220,38,38,0.1)', title: 'Unclear Direction', desc: 'Thousands of courses online with no personalized milestone path matching your target country or specialized engineering role.' },
              { icon: <Layers size={20} />, color: '#d97706', bg: 'rgba(217,119,6,0.1)', title: 'Tutorial Hell', desc: 'Watching lectures passively without grounded diagnostic quizzes, applied capstone tasks, or verifiable skill retention.' },
              { icon: <Clock size={20} />, color: champagne, bg: `rgba(212,175,122,0.1)`, title: 'Inconsistent Study', desc: 'Lack of structured daily execution targets leading to missed deadlines, lost momentum, and broken streak consistency.' },
              { icon: <BarChart2 size={20} />, color: teal, bg: `rgba(13,148,136,0.1)`, title: 'Unmeasured Progress', desc: 'No quantitative analytics on actual study time, milestone coverage, or true diagnostic readiness for technical interviews.' },
            ].map((item, i) => (
              <div key={i} style={{ background: surfaceBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: textPrimary }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION PIPELINE ── */}
      <section id="how-it-works" style={{ padding: '90px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: champagne, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              The Solution Architecture
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 400, color: textPrimary, letterSpacing: '-0.01em', marginBottom: 12 }}>
              One Path. One System. One Direction.
            </h2>
            <p style={{ fontSize: 14, color: textSecondary, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
              PathWise AI unifies your entire career trajectory into a cohesive, five-stage execution pipeline.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }} className="pipeline-grid">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={step.step} onMouseEnter={() => setActiveStep(idx)}
                style={{
                  background: activeStep === idx ? surfaceAlt : surfaceBg,
                  border: `1px solid ${activeStep === idx ? step.color : borderCol}`,
                  borderRadius: 14, padding: 20, cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: activeStep === idx ? `0 8px 24px ${step.color}20` : 'none',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: step.color, background: `${step.color}18`, padding: '2px 8px', borderRadius: 4 }}>
                    {step.step}
                  </span>
                  <div style={{ color: step.color, opacity: 0.8 }}>{step.icon}</div>
                </div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: textPrimary, marginBottom: 8, lineHeight: 1.3 }}>{step.title}</h3>
                <p style={{ fontSize: 11, color: textSecondary, lineHeight: 1.55 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER JOURNEY SHOWCASE ── */}
      <section id="career-journey" style={{ padding: '80px 24px', background: surfaceAlt, borderTop: `1px solid ${borderCol}` }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Visual Career Pathway
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 400, color: textPrimary, marginBottom: 12 }}>
              FutureForge Milestone Progression
            </h2>
            <p style={{ fontSize: 14, color: textSecondary, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
              Example: <strong style={{ color: champagne }}>Software Engineer in Germany</strong>. Every stage gives concrete capabilities, practice capstones, and diagnostic quizzes.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Completed */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: surfaceBg, border: `1px solid ${borderCol}`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(22,163,74,0.3)' }}>
                <Check size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 7px', borderRadius: 4 }}>Completed</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>Stage 1: Core CS & Algorithmic Thinking</span>
                </div>
                <div style={{ fontSize: 12, color: textMuted }}>Python & Java OOP · Data Structures · Complexity Analysis</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>100% Mastered</span>
            </div>

            {/* Active — Teal illumination */}
            <div style={{
              display: 'flex', gap: 16, alignItems: 'center',
              background: `linear-gradient(135deg, ${surfaceBg}, rgba(13,148,136,0.06))`,
              border: `1px solid rgba(13,148,136,0.35)`,
              borderRadius: 14, padding: '16px 20px',
              boxShadow: `0 4px 20px rgba(13,148,136,0.12)`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: teal, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0, boxShadow: `0 0 14px rgba(13,148,136,0.5)` }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: champagne, background: `rgba(212,175,122,0.12)`, padding: '2px 7px', borderRadius: 4 }}>📍 Active Milestone</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>Stage 2: Applied Full-Stack & System Architecture</span>
                </div>
                <div style={{ fontSize: 12, color: textMuted }}>REST APIs · PostgreSQL Schema Design · React UI Engine</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: teal, flexShrink: 0 }}>65% In Progress</span>
            </div>

            {/* Locked */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: surfaceBg, border: `1px solid ${borderCol}`, borderRadius: 14, padding: '16px 20px', opacity: 0.5 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: surfaceAlt, color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: textMuted, background: surfaceAlt, padding: '2px 7px', borderRadius: 4 }}>Locked</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: textSecondary }}>Stage 3: Cloud DevOps & Container Orchestration</span>
                </div>
                <div style={{ fontSize: 12, color: textMuted }}>Docker · CI/CD Pipelines · AWS Architecture</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: textMuted, flexShrink: 0 }}>Unlocks after Stage 2</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES MATRIX (Tilt Cards) ── */}
      <section id="features" style={{ padding: '90px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: copper, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Feature Ecosystem
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 400, color: textPrimary, marginBottom: 12 }}>
              Engineered for Serious Skill Development
            </h2>
            <p style={{ fontSize: 14, color: textSecondary, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
              Every module is connected to your primary career roadmap to eliminate distractions and accelerate real mastery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="features-grid">
            <FeatureTiltCard icon={<Compass size={22} />} badge="Core Engine" title="FutureForge Roadmaps" subtitle="Personalized Pathway"
              description="Construct customized milestone roadmaps geared towards specific international tech job markets with concrete capstones." accentColor={teal} tag="Roadmap Navigation" onClick={handleGetStarted} />
            <FeatureTiltCard icon={<CheckSquare size={22} />} badge="Daily Execution" title="Targets Engine" subtitle="Daily · Weekly · Monthly"
              description="Break massive career milestones into bite-sized daily execution goals with built-in time estimates and completion validation." accentColor="#16a34a" tag="Target Planning" onClick={handleGetStarted} />
            <FeatureTiltCard icon={<BookOpen size={22} />} badge="Knowledge Engine" title="Study Vault & Intelligence" subtitle="Grounded Document Analysis"
              description="Store syllabus PDFs and course materials. Extract key topics, concepts, and generated practice questions automatically." accentColor={champagne} tag="Knowledge Library" onClick={handleGetStarted} />
            <FeatureTiltCard icon={<Award size={22} />} badge="Verification" title="Dual-Mode Skill Quizzes" subtitle="Curriculum + PDF Testing"
              description="Validate mastery with grounded multi-choice diagnostic quizzes generated from either learned roadmap skills or uploaded documents." accentColor={copper} tag="Diagnostic Testing" onClick={handleGetStarted} />
            <FeatureTiltCard icon={<BarChart2 size={22} />} badge="Analytics" title="100% Real-Data Metrics" subtitle="Zero Mockup Fluff"
              description="Track daily focused study hours, weekly target velocity, streak retention, and quiz diagnostic scores in one central cockpit." accentColor={champagne} tag="Executive Analytics" onClick={handleGetStarted} />
            <FeatureTiltCard icon={<MessageSquare size={22} />} badge="AI Intelligence" title="BYOK AI Copilot" subtitle="Gemini · OpenAI · Grok"
              description="Bring your own API key for maximum privacy. Live chatbot with real-time web search capabilities for tech hiring trends." accentColor={teal} tag="Career Intelligence" onClick={handleGetStarted} />
          </div>
        </div>
      </section>

      {/* ── AI COPILOT PREVIEW ── */}
      <section id="ai-copilot" style={{ padding: '80px 24px', background: surfaceAlt, borderTop: `1px solid ${borderCol}` }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: teal, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              AI Career Companion
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 400, color: textPrimary, marginBottom: 12 }}>
              Your 24/7 Strategic Engineering Mentor
            </h2>
            <p style={{ fontSize: 14, color: textSecondary, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
              Ask questions about course concepts, clarify roadmap tasks, or query live hiring requirements.
            </p>
          </div>

          <div style={{ background: surfaceBg, border: `1px solid ${borderCol}`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 24px 48px rgba(0,0,0,0.4)` }}>
            {/* Topbar */}
            <div style={{ background: 'var(--color-surface-alt)', borderBottom: `1px solid ${borderCol}`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#dc2626' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#d97706' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#16a34a' }} />
                <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: textMuted }}>PathWise AI Copilot — Live Dialogue</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: teal, background: `rgba(13,148,136,0.1)`, padding: '2px 10px', borderRadius: 4, border: `1px solid rgba(13,148,136,0.2)` }}>
                BYOK Connected
              </div>
            </div>

            {/* Chat */}
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Student msg */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{ background: teal, color: 'white', padding: '11px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 13, lineHeight: 1.55 }}>
                  "I want to prepare for a junior software engineer role in Germany next year. What key projects should I prioritize in Stage 2?"
                </div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: surfaceAlt, border: `1px solid ${borderCol}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, color: textSecondary }}>
                  ME
                </div>
              </div>

              {/* AI Response */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: '88%' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${teal}, #0f766e 60%, ${champagne})`,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 12px rgba(13,148,136,0.3)`,
                }}>
                  <Sparkles size={15} />
                </div>
                <div style={{ background: surfaceAlt, border: `1px solid ${borderCol}`, padding: '14px 18px', borderRadius: '4px 16px 16px 16px', fontSize: 13, lineHeight: 1.65, color: textPrimary }}>
                  <div style={{ fontWeight: 700, color: teal, marginBottom: 6, fontSize: 12 }}>PathWise AI Advisor</div>
                  For German junior tech hiring, companies place heavy emphasis on <strong style={{ color: champagne }}>clean code, test coverage, and containerized deployments</strong>. Here is your Stage 2 roadmap plan:
                  <ul style={{ margin: '10px 0 0 18px', padding: 0, color: textSecondary }}>
                    <li style={{ marginBottom: 4 }}><strong style={{ color: textPrimary }}>Project 1:</strong> Full-stack REST API with PostgreSQL & automated unit tests.</li>
                    <li style={{ marginBottom: 4 }}><strong style={{ color: textPrimary }}>Project 2:</strong> Containerized Docker deployment with GitHub Actions CI.</li>
                    <li><strong style={{ color: textPrimary }}>Daily Target:</strong> Complete 45 mins of TypeScript fundamentals via your Targets tab today.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(13,148,136,0.08) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 40% 40% at 80% 30%, rgba(212,175,122,0.05) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', marginBottom: 24,
            background: `rgba(212,175,122,0.1)`, border: `1px solid rgba(212,175,122,0.22)`,
            borderRadius: 99, color: champagne, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <Sparkles size={12} /> Ready to Accelerate Your Career?
          </div>

          <h2 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 400,
            color: textPrimary, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 20,
          }}>
            Start Forging Your Skills Today.
          </h2>

          <p style={{ fontSize: 15, color: textSecondary, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Join ambitious students tracking their roadmaps, mastering diagnostic quizzes, and launching international software careers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-lg" onClick={handleGetStarted} id="landing-bottom-cta"
              style={{ background: teal, color: 'white', padding: '14px 34px', fontSize: 14, boxShadow: `0 8px 32px rgba(13,148,136,0.4)` }}>
              Get Started Now <ArrowRight size={15} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={handleLogin}
              style={{ color: textSecondary, border: `1px solid ${borderCol}`, padding: '14px 28px', fontSize: 14 }}>
              Sign In to Workspace
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${borderCol}`, padding: '36px 24px 28px', background: 'var(--color-surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${teal}, #0f766e 60%, ${champagne})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5" opacity="0.6"/>
                  <path d="M2 12l10 5 10-5" opacity="0.8"/>
                </svg>
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: 13, color: textPrimary }}>PathWise AI</span>
                <span style={{ fontSize: 11, color: textMuted, marginLeft: 10 }}>"Forge Your Skills. Build Your Future."</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 600 }}>
              {[
                { label: 'How It Works', id: 'how-it-works' },
                { label: 'Features', id: 'features' },
                { label: 'Roadmap', id: 'career-journey' },
              ].map(item => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}
                  style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                  {item.label}
                </button>
              ))}
              <Link to="/login" style={{ color: textMuted, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Sign In</Link>
            </div>
          </div>

          {/* Champagne rule */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(212,175,122,0.15), transparent)`, marginBottom: 20 }} />

          <div style={{ textAlign: 'center', fontSize: 11, color: textMuted }}>
            © {new Date().getFullYear()} PathWise AI Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .pipeline-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .pipeline-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
