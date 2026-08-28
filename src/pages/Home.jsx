import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer, CheckSquare, Plus, MessageSquare, Flame, BookOpen,
  Calendar, TrendingUp, Sparkles, Award, ArrowRight, ShieldCheck,
  Compass, Target, ChevronRight, Zap, CheckCircle2
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
  const [exams, setExams] = useState([]);
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
      const [targets, assigns, ex, anl, goal, quiz, att] = await Promise.all([
        dataService.getTargets(user.userId, { date: today }),
        dataService.getAssignments(user.userId),
        dataService.getExams(user.userId),
        dataService.getAnalytics(user.userId),
        dataService.getCareerGoal(user.userId),
        dataService.getLatestQuizScore(user.userId),
        dataService.getAttendance(user.userId),
      ]);
      setTodayTargets(targets);
      setAssignments(sortByPriority(assigns).slice(0, 3));
      setExams(ex.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2));
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
  const nextExam = exams[0];

  const firstNameDisplay = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student';

  const QUICK_ACTIONS = [
    { icon: <Timer size={20} />, label: 'Study Timer', to: '/timer' },
    { icon: <CheckSquare size={20} />, label: "Daily Targets", to: '/targets' },
    { icon: <Compass size={20} />, label: 'FutureForge', to: '/roadmap' },
    { icon: <Award size={20} />, label: 'Skill Quiz', to: '/skill-quiz' },
    { icon: <Plus size={20} />, label: 'Add Task', to: '/assignments' },
  ];

  return (
    <AppLayout pageTitle="Home">
      {/* Ultra-Premium Hero / Executive Command Header */}
      <div
        style={{
          background: 'var(--gradient-hero)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          marginBottom: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.25)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-2)' }}>
              <Sparkles size={12} /> Career Command Center
            </div>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: '4px 0 6px' }}>
              {greeting}, {firstNameDisplay}!
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: 620, lineHeight: 1.55 }}>
              Your next step toward becoming a <strong>{careerGoal?.jobRole || 'Software Engineer'}</strong> in <strong>{careerGoal?.country || 'Germany'}</strong> begins with today's focused sessions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-primary" onClick={() => navigate('/targets')}>
              <CheckSquare size={15} /> Resume Daily Targets <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Milestone Indicator Strip */}
        {activeStep && (
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-champagne-text)', background: 'rgba(212, 175, 122, 0.15)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                Active Milestone
              </span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>
                {activeStep.title}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 200 }}>
              <div style={{ width: 120 }}>
                <ProgressBar value={activeStep.progress || 0} size="sm" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {activeStep.progress || 0}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats KPI Row */}
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
          label="Focused Study Time"
          value={`${studyHoursToday}h`}
          meta="Logged via Timer"
          icon={<Timer size={18} />}
        />
        <StatCard
          label="Diagnostic Mastery"
          value={latestQuiz ? `${latestQuiz.score}%` : 'Pending'}
          meta={latestQuiz ? latestQuiz.topic : 'Skill Quiz Ready'}
          icon={<Award size={18} />}
        />
      </div>

      {/* Main Command Center Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Quick Action Navigation Strip */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Action Shortcuts
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)' }}>
              {QUICK_ACTIONS.map(act => (
                <button
                  key={act.label}
                  className="quick-action"
                  onClick={() => navigate(act.to)}
                >
                  <div className="quick-action-icon" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                    {act.icon}
                  </div>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Today's Learning Targets */}
          <Card>
            <div className="card-header">
              <h2 className="card-title"><CheckSquare size={18} className="text-primary" /> Today's Practical Targets</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/targets')}>Manage All →</button>
            </div>

            {totalToday > 0 ? (
              <>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    <span>Progress: {completedToday} of {totalToday} completed</span>
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

          {/* FutureForge Journey Overview */}
          <Card>
            <div className="card-header">
              <h2 className="card-title">🗺️ FutureForge Career Journey</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/roadmap')}>Full Pathway →</button>
            </div>
            {roadmap ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Target Track: <strong style={{ color: 'var(--color-primary)' }}>{roadmap.goal}</strong> → <strong>{roadmap.country}</strong>
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
                description="Define your target job role to generate a personalized career roadmap."
                action={{ label: 'Configure Goal', onClick: () => navigate('/goal-career') }}
              />
            )}
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Target Career Goal */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>🎯 Target Career</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/goal-career')}>Edit</button>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                {careerGoal?.jobRole || 'Software Engineer'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                🌍 Destination: <strong>{careerGoal?.country || 'Germany'}</strong>
              </div>
            </div>
          </Card>

          {/* Priority Assignment */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>⚡ Priority Task</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>View All</button>
            </div>
            {urgentAssignment ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 2 }}>{urgentAssignment.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{urgentAssignment.subject}</div>
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

          {/* Upcoming Exam */}
          <Card>
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: 'var(--font-size-xs)' }}>📚 Upcoming Assessment</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/exams')}>Planner</button>
            </div>
            {nextExam ? (
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>{nextExam.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Calendar size={13} style={{ color: 'var(--color-warning)' }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {nextExam.date} · {Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-2) 0' }}>
                No upcoming exams scheduled.
              </div>
            )}
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

