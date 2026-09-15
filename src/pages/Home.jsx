import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer, CheckSquare, Plus, MessageSquare, Flame, BookOpen,
  Calendar, TrendingUp, Sparkles, Award, ArrowRight, ShieldCheck,
  Compass, Target, ChevronRight, Zap, CheckCircle2, AlertTriangle
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, StatCard, ProgressBar, Badge, EmptyState } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { getDailyQuote } from '../services/quoteService.js';
import { sortByPriority } from '../services/priorityEngine.js';

export default function Home() {
  const { user } = useAuth();
  const { profile, roadmap, streak } = useApp();
  const navigate = useNavigate();

  const [todayTargets, setTodayTargets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [latestQuiz, setLatestQuiz] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const quote = getDailyQuote();

  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [targets, assigns, anl, goal, quiz, att] = await Promise.all([
        dataService.getTargets(user.userId, { date: today }),
        dataService.getAssignments(user.userId),
        dataService.getAnalytics(user.userId),
        dataService.getCareerGoal(user.userId),
        dataService.getLatestQuizScore(user.userId),
        dataService.getAttendance(user.userId),
      ]);
      setTodayTargets(targets);
      setAssignments(sortByPriority(assigns).slice(0, 3));
      setAnalytics(anl);
      setCareerGoal(goal);
      setLatestQuiz(quiz);
      setAttendance(att);
      setLoading(false);
    }
    load();
  }, [user, today]);

  const completedToday = todayTargets.filter(t => t.status === 'completed').length;
  const totalToday = todayTargets.length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const studyHoursToday = ((analytics?.studyTime?.today || 0) / 3600).toFixed(1);
  const activeStep = roadmap?.steps?.find(s => s.status === 'active') || roadmap?.steps?.[0];
  const urgentAssignment = assignments[0];

  const firstNameDisplay = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student';

  const QUICK_ACTIONS = [
    { icon: <CheckSquare size={18} />, label: "Today's Targets", to: '/targets' },
    { icon: <Timer size={18} />, label: 'Study Timer', to: '/timer' },
    { icon: <Compass size={18} />, label: 'FutureForge', to: '/roadmap' },
    { icon: <Plus size={18} />, label: 'Add Task', to: '/assignments' },
    { icon: <Award size={18} />, label: 'Skill Quiz', to: '/skill-quiz' },
  ];

  // Attendance health calculation
  const totalAttDays = attendance?.totalWorkingDays || 78;
  const presentAttDays = attendance?.presentDays || 61;
  const attPct = totalAttDays > 0 ? Math.round((presentAttDays / totalAttDays) * 100) : 85;
  const attSafe = attPct >= 75;

  return (
    <AppLayout pageTitle="Command Center">
      {/* ── 1. GREETING & DESTINATION HERO ── */}
      <div className="command-hero">
        <div className="command-hero-glow" aria-hidden="true" />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="command-hero-badge">
            <Sparkles size={12} /> Personal Intelligence Command Center
          </div>

          <h1 className="command-hero-title">
            {greeting}, {firstNameDisplay}!
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            <p className="command-hero-desc" style={{ margin: 0 }}>
              Navigating your pathway toward becoming a <strong>{careerGoal?.jobRole || 'Software Engineer'}</strong> in <strong>{careerGoal?.country || 'Germany'}</strong>.
            </p>
            {profile?.course && (
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255, 255, 255, 0.12)', padding: '3px 10px', borderRadius: 'var(--radius-full)', color: '#ccfbf1', border: '1px solid rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                🎓 {profile.course} • {profile.stream || 'Technology'}
              </span>
            )}
          </div>

          {/* Active Milestone Bar */}
          {activeStep && (
            <div className="command-active-milestone" onClick={() => navigate('/roadmap')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
                <span className="command-milestone-pill">
                  Active Milestone
                </span>
                <span className="command-milestone-title">
                  {activeStep.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                <div style={{ width: 80 }} className="hide-on-mobile-xs">
                  <ProgressBar value={activeStep.progress || 0} size="sm" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {activeStep.progress || 0}%
                </span>
                <ChevronRight size={14} style={{ opacity: 0.6 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. QUICK ACTIONS STRIP ── */}
      <div className="command-quick-actions">
        {QUICK_ACTIONS.map(act => (
          <button
            key={act.label}
            className="command-action-chip"
            onClick={() => navigate(act.to)}
          >
            <div className="command-action-icon">{act.icon}</div>
            <span>{act.label}</span>
          </button>
        ))}
      </div>

      {/* ── 3. HOW AM I DOING? (KEY METRICS ROW) ── */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard
          label="Active Streak"
          value={`${streak?.currentStreak || 0} 🔥`}
          meta={`All-Time Best: ${streak?.longestStreak || 0} days`}
          icon={<Flame size={18} />}
        />
        <StatCard
          label="Today's Targets"
          value={`${completedToday} / ${totalToday}`}
          meta={`${completionPct}% Completed`}
          icon={<CheckSquare size={18} />}
        />
        <StatCard
          label="Focused Study"
          value={`${studyHoursToday}h`}
          meta="Logged today"
          icon={<Timer size={18} />}
        />
        <StatCard
          label="Attendance Health"
          value={`${attPct}%`}
          meta={attSafe ? 'Above 75% threshold' : 'Below 75% threshold'}
          icon={attSafe ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        />
      </div>

      {/* ── 4. WHAT MATTERS TODAY? (RESPONSIVE GRID) ── */}
      <div className="command-main-grid">
        
        {/* Left / Primary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          
          {/* Today's Practical Learning Targets */}
          <Card>
            <div className="card-header">
              <h2 className="card-title">
                <CheckSquare size={18} className="text-primary" /> Today's Practical Targets
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/targets')}>
                Manage Targets →
              </button>
            </div>

            {totalToday > 0 ? (
              <>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    <span>{completedToday} of {totalToday} targets completed</span>
                    <span>{completionPct}%</span>
                  </div>
                  <ProgressBar value={completionPct} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {todayTargets.map(target => (
                    <div
                      key={target.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: target.status === 'completed' ? 'var(--color-success)' : 'transparent',
                          border: `2px solid ${target.status === 'completed' ? 'var(--color-success)' : 'var(--color-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {target.status === 'completed' && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 700,
                            color: target.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                            textDecoration: target.status === 'completed' ? 'line-through' : 'none',
                          }}
                        >
                          {target.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          ⏱ {target.estimatedDuration} min · {target.difficulty}
                        </div>
                      </div>

                      <Badge variant={target.status === 'completed' ? 'success' : target.status === 'in_progress' ? 'primary' : 'muted'}>
                        {target.status === 'completed' ? 'Done' : target.status === 'in_progress' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon="📋"
                title="No targets scheduled for today"
                description="Explore your FutureForge roadmap to activate learning milestones."
                action={{ label: 'View Roadmap', onClick: () => navigate('/roadmap') }}
              />
            )}
          </Card>

          {/* FutureForge Journey Progress */}
          <Card>
            <div className="card-header">
              <h2 className="card-title">
                <Sparkles size={18} className="text-primary" /> FutureForge Career Pathway
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/roadmap')}>
                Full Pathway →
              </button>
            </div>
            {roadmap ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-xs)', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Track: <strong style={{ color: 'var(--color-primary)' }}>{roadmap.goal}</strong> → <strong>{roadmap.country}</strong>
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 800 }}>
                    {roadmap.completedSteps}/{roadmap.totalSteps} Milestones
                  </span>
                </div>
                <ProgressBar
                  value={roadmap.completedSteps}
                  max={roadmap.totalSteps || 6}
                />
              </>
            ) : (
              <EmptyState
                icon="🗺️"
                title="FutureForge pathway pending"
                description="Define your target job role in Settings to generate your personalized career roadmap."
                action={{ label: 'Configure in Settings', onClick: () => navigate('/settings') }}
              />
            )}
          </Card>
        </div>

        {/* Right / Secondary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          
          {/* Target Career Destination (View Only) */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>
                🎯 Target Career Destination
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/goal-career')}>
                Discover →
              </button>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                {careerGoal?.jobRole || 'Software Engineer'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                🌍 Destination: <strong>{careerGoal?.country || 'Germany'}</strong>
              </div>
              {careerGoal?.specialization && (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  ⚡ Track: {careerGoal.specialization}
                </div>
              )}
            </div>
          </Card>

          {/* Priority Assignment Task */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>
                ⚡ Urgent Task
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>
                View All
              </button>
            </div>
            {urgentAssignment ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 2 }}>
                  {urgentAssignment.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                  {urgentAssignment.subject}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant={urgentAssignment.priorityCategory === 'HIGH' ? 'error' : urgentAssignment.priorityCategory === 'MEDIUM' ? 'warning' : 'success'}>
                    {urgentAssignment.priorityCategory} Priority
                  </Badge>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Due: {urgentAssignment.deadline}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-2) 0' }}>
                No urgent tasks pending. ✨
              </div>
            )}
          </Card>

          {/* Attendance Safety Snapshot */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>
                📊 Attendance Status
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/academic')}>
                Calculator
              </button>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: attSafe ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {attPct}% {attSafe ? '✓ Safe' : '⚠️ At Risk'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {presentAttDays} / {totalAttDays} days
                </span>
              </div>
              <ProgressBar value={attPct} variant={attSafe ? 'success' : 'error'} size="sm" />
            </div>
          </Card>

          {/* Daily Mindset & Motivation */}
          <Card style={{ background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.04), rgba(212, 175, 122, 0.04))', border: '1px solid rgba(13, 148, 136, 0.15)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-champagne-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              ✨ Daily Mindset
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 4 }}>
              "{quote.text}"
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 700 }}>— {quote.author}</p>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}
