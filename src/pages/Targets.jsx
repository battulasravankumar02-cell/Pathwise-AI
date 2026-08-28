import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, SkipForward, BookOpen, Award, Target,
  Calendar, Check, Layers, Sparkles
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, Tabs, EmptyState, LoadingState, SectionHeader, Alert } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';

export default function Targets() {
  const { user } = useAuth();
  const { showToast, refreshStreak, refreshRoadmap } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('daily');
  const [dailyTargets, setDailyTargets] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    if (!user) return;
    const [targets, rmap] = await Promise.all([
      dataService.getTargets(user.userId),
      dataService.getRoadmap(user.userId),
    ]);
    setDailyTargets(targets);
    setRoadmap(rmap);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCompleteDaily(targetId) {
    if (!user) return;
    setCompletingId(targetId);
    const res = await dataService.completeTarget(user.userId, targetId);
    if (res.success) {
      await loadData();
      await refreshStreak();
      await refreshRoadmap();
      showToast('🎉 Daily Target Completed! Streak & Roadmap updated.', 'success');
    }
    setCompletingId(null);
  }

  async function handleSkipDaily(targetId) {
    if (!user) return;
    await dataService.updateTargetStatus(user.userId, targetId, 'skipped');
    await loadData();
    showToast('Target marked as skipped.', 'info');
  }

  const TABS = [
    { id: 'daily', label: '📅 DAILY TARGETS', count: dailyTargets.filter(t => t.status !== 'completed').length },
    { id: 'weekly', label: '📆 WEEKLY TARGETS', count: roadmap?.weeklyTargets?.length || 0 },
    { id: 'monthly', label: '🗓️ MONTHLY TARGETS', count: roadmap?.monthlyTargets?.length || 0 },
    { id: 'yearly', label: '🎯 YEARLY TARGETS', count: roadmap?.yearlyTargets?.length || 0 },
  ];

  const completedDailyCount = dailyTargets.filter(t => t.status === 'completed').length;
  const totalDailyCount = dailyTargets.length || 1;
  const dailyProgressPct = Math.round((completedDailyCount / totalDailyCount) * 100);

  return (
    <AppLayout pageTitle="Learning Targets">
      <SectionHeader
        title="Learning Targets Engine 🎯"
        subtitle="Step-by-step practical targets mapped to your FutureForge roadmap milestones"
        action={
          <button className="btn btn-secondary" onClick={() => navigate('/skill-quiz')}>
            <Award size={16} /> Take Skill Quiz
          </button>
        }
      />

      {/* Tabs Switcher */}
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div style={{ marginTop: 'var(--space-6)' }}>
        {loading ? (
          <LoadingState text="Loading your targets..." />
        ) : (
          <>
            {/* ============================================================ */}
            {/* 1. DAILY TARGETS SUB-TAB */}
            {/* ============================================================ */}
            {activeTab === 'daily' && (
              <div>
                {/* Daily Progress summary */}
                <Card style={{ marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, var(--color-surface), rgba(13, 148, 136, 0.05))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        Active FutureForge Stage: {roadmap?.steps?.find(s => s.status === 'active')?.title || 'Stage 1'}
                      </span>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                        Daily Progress: {completedDailyCount} / {dailyTargets.length} Completed
                      </h3>
                    </div>
                    <Badge variant={dailyProgressPct === 100 ? 'success' : 'primary'}>
                      {dailyProgressPct}% Complete
                    </Badge>
                  </div>
                  <ProgressBar value={completedDailyCount} max={dailyTargets.length || 1} size="base" />
                </Card>

                {dailyTargets.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No Daily Targets Scheduled"
                    description="Set your career goal in FutureForge to generate daily learning targets."
                    action={{ label: 'View FutureForge Roadmap', onClick: () => navigate('/roadmap') }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {dailyTargets.map(target => {
                      const isDone = target.status === 'completed';
                      const isSkipped = target.status === 'skipped';
                      const isCompleting = completingId === target.id;

                      return (
                        <Card
                          key={target.id}
                          style={{
                            borderLeft: `5px solid ${isDone ? 'var(--color-success)' : isSkipped ? 'var(--color-text-muted)' : 'var(--color-primary)'}`,
                            opacity: isDone || isSkipped ? 0.75 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, marginTop: 2 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  background: isDone ? 'var(--color-success)' : 'var(--color-surface-alt)',
                                  border: `2px solid ${isDone ? 'var(--color-success)' : 'var(--color-border)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                }}
                              >
                                {isDone && <Check size={18} />}
                              </div>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                                <h3 style={{
                                  fontSize: 'var(--font-size-base)',
                                  fontWeight: 700,
                                  margin: 0,
                                  textDecoration: isDone ? 'line-through' : 'none',
                                  color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                                }}>
                                  {target.title}
                                </h3>
                                <Badge variant={isDone ? 'success' : isSkipped ? 'muted' : 'primary'}>
                                  {isDone ? '✓ Completed' : isSkipped ? 'Skipped' : 'Pending'}
                                </Badge>
                              </div>

                              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                                {target.description}
                              </p>

                              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flexWrap: 'wrap', marginBottom: isDone ? 0 : 'var(--space-3)' }}>
                                <span>📚 {target.course}</span>
                                <span>⏱ {target.estimatedDuration} mins</span>
                                <span>📊 Difficulty: {target.difficulty}</span>
                                {target.date && <span>📅 Date: {target.date}</span>}
                              </div>

                              {!isDone && !isSkipped && (
                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleCompleteDaily(target.id)}
                                    disabled={isCompleting}
                                  >
                                    <CheckCircle size={14} /> {isCompleting ? 'Saving...' : 'Mark as Complete'}
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleSkipDaily(target.id)}
                                  >
                                    <SkipForward size={14} /> Skip
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => navigate('/timer')}
                                  >
                                    <Clock size={14} /> Start Timer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. WEEKLY TARGETS SUB-TAB */}
            {/* ============================================================ */}
            {activeTab === 'weekly' && (
              <div>
                <Alert type="info">
                  Weekly targets aggregate your daily milestones into structured weekly learning objectives. Completing a week advances your FutureForge roadmap.
                </Alert>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                  {(roadmap?.weeklyTargets || []).map((wt, idx) => (
                    <Card key={wt.id} style={{ borderLeft: `5px solid ${wt.status === 'completed' ? 'var(--color-success)' : wt.status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <div>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                            Week {wt.weekNumber || idx + 1} Milestone
                          </span>
                          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                            {wt.title}
                          </h3>
                        </div>
                        <Badge variant={wt.status === 'completed' ? 'success' : wt.status === 'in_progress' ? 'primary' : 'muted'}>
                          {wt.status === 'completed' ? '✓ Completed' : wt.status === 'in_progress' ? '● In Progress' : '🔒 Upcoming'}
                        </Badge>
                      </div>

                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                        {wt.description}
                      </p>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {wt.skills?.map(s => (
                          <span key={s} style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 3. MONTHLY TARGETS SUB-TAB */}
            {/* ============================================================ */}
            {activeTab === 'monthly' && (
              <div>
                <Alert type="info">
                  Monthly targets represent major competency milestones and tangible project deliverables.
                </Alert>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                  {(roadmap?.monthlyTargets || []).map((mt, idx) => (
                    <Card key={mt.id} style={{ borderLeft: `5px solid ${mt.status === 'completed' ? 'var(--color-success)' : mt.status === 'in_progress' ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                          {mt.title}
                        </h3>
                        <Badge variant={mt.status === 'completed' ? 'success' : mt.status === 'in_progress' ? 'primary' : 'muted'}>
                          {mt.status === 'completed' ? 'Completed' : mt.status === 'in_progress' ? 'Active' : 'Upcoming'}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                        🎯 <strong>Monthly Milestone:</strong> {mt.milestone}
                      </div>

                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                        🛠️ <strong>Expected Output:</strong> {mt.expectedOutcome}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. YEARLY TARGETS SUB-TAB */}
            {/* ============================================================ */}
            {activeTab === 'yearly' && (
              <div>
                <Alert type="info">
                  Yearly targets connect your daily and monthly progress directly to your ultimate career outcome (Internship & Global Job Readiness).
                </Alert>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                  {(roadmap?.yearlyTargets || []).map(yt => (
                    <Card key={yt.id} style={{ border: '2px solid var(--color-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                        <Sparkles size={14} /> Comprehensive 1-Year Transformation Plan
                      </div>
                      <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, marginBottom: 'var(--space-3)' }}>
                        {yt.title}
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                        {yt.goal}
                      </p>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                          Yearly Competency Milestones:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {yt.milestones?.map((m, mi) => (
                            <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                                {mi + 1}
                              </span>
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
