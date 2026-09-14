import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, CheckCircle, PlayCircle, ChevronRight, Award, Compass,
  Sparkles, BookOpen, Layers, Target, Clock, ArrowRight, Check,
  Calendar, CheckCircle2, AlertCircle, Zap, FastForward
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, EmptyState, LoadingState, SectionHeader, Modal, Alert, Tabs } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';

export default function FutureForgeRoadmap() {
  const { user } = useAuth();
  const { showToast, refreshRoadmap, refreshProfile } = useApp();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [markingStageId, setMarkingStageId] = useState(null);

  // Active view: 'journey' | 'weekly' | 'monthly' | 'yearly'
  const [roadmapView, setRoadmapView] = useState('journey');

  // Knowledge-aware adaptation modal state
  const [knowThisModalStage, setKnowThisModalStage] = useState(null);

  useEffect(() => {
    if (!user) return;
    dataService.getRoadmap(user.userId).then(r => {
      setRoadmap(r);
      setLoading(false);
    });
  }, [user]);

  async function handleMarkComplete(stage) {
    if (stage.status !== 'active') return;
    setMarkingStageId(stage.id);

    const result = await dataService.updateRoadmapStep(user.userId, stage.id, {
      status: 'completed',
      progress: 100,
    });

    if (result.success) {
      const fresh = await dataService.getRoadmap(user.userId);
      setRoadmap(fresh);
      await refreshRoadmap();
      showToast(`🎉 "${stage.title}" completed! Next FutureForge milestone unlocked.`, 'success');
      setSelectedStage(null);
    }
    setMarkingStageId(null);
  }

  async function handleUpdateProgress(stageId, newProgress) {
    const p = Math.max(0, Math.min(100, parseInt(newProgress) || 0));
    await dataService.updateRoadmapStep(user.userId, stageId, { progress: p });
    const fresh = await dataService.getRoadmap(user.userId);
    setRoadmap(fresh);
    await refreshRoadmap();
  }

  // Knowledge-Aware Adaptation: "Already Know This" action
  async function handleApplyKnowledgeAdaptation() {
    if (!user || !knowThisModalStage) return;
    const stage = knowThisModalStage;
    setKnowThisModalStage(null);
    setSelectedStage(null);

    // 1. Mark current stage completed
    await dataService.updateRoadmapStep(user.userId, stage.id, {
      status: 'completed',
      progress: 100,
    });

    // 2. Add stage skills to student profile
    const profile = await dataService.getStudentProfile(user.userId);
    const existingSkills = profile?.skills || [];
    const newSkills = Array.from(new Set([...existingSkills, ...(stage.skills || [])]));
    await dataService.saveStudentProfile(user.userId, { skills: newSkills });

    // 3. Refresh authoritative data
    const fresh = await dataService.getRoadmap(user.userId);
    setRoadmap(fresh);
    await refreshRoadmap();
    await refreshProfile();

    showToast(`⚡ Knowledge confirmed! "${stage.title}" skipped and downstream targets accelerated.`, 'success');
  }

  if (loading) {
    return (
      <AppLayout pageTitle="FutureForge">
        <LoadingState text="Loading your FutureForge Career Journey..." />
      </AppLayout>
    );
  }

  if (!roadmap) {
    return (
      <AppLayout pageTitle="FutureForge">
        <EmptyState
          icon="🗺️"
          title="FutureForge Journey Not Yet Configured"
          description="Configure your career direction in Settings to forge your personalized, skill-first roadmap."
          action={{ label: 'Configure in Settings', onClick: () => navigate('/settings') }}
        />
      </AppLayout>
    );
  }

  const steps = roadmap.steps || [];
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const activeStep = steps.find(s => s.status === 'active') || steps[0];
  const overallProgress = Math.round(steps.reduce((sum, s) => sum + (s.progress || 0), 0) / (steps.length || 1));

  const ROADMAP_VIEWS = [
    { id: 'journey', label: 'Milestone Journey' },
    { id: 'weekly', label: 'Weekly View' },
    { id: 'monthly', label: 'Monthly Sprints' },
    { id: 'yearly', label: 'Yearly Plan' },
  ];

  return (
    <AppLayout pageTitle="Roadmap">
      {/* Header Banner */}
      <div className="roadmap-hero-banner">
        <div>
          <div className="roadmap-hero-pill">
            <Sparkles size={13} /> FutureForge Personalized Engine
          </div>
          <h1 className="roadmap-hero-title">
            {roadmap.goal} Pathway
          </h1>
          <p className="roadmap-hero-sub">
            Target Destination: <strong>{roadmap.country || 'International'}</strong> · {steps.length} Milestones · Personalized & Adaptive
          </p>
        </div>

        <div className="roadmap-hero-metrics">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700 }}>Overall Readiness</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1.1 }}>{overallProgress}%</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/goal-career')}>
            <Target size={15} /> View Destination
          </button>
        </div>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Completed Stages</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)' }}>{completedCount} / {steps.length}</div>
        </Card>
        <Card style={{ textAlign: 'center', border: '1px solid var(--color-primary)', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 4, fontWeight: 800, textTransform: 'uppercase' }}>● Current Active Stage</div>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeStep?.title || 'None'}
          </div>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Skill Diagnostic Ready</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/skill-quiz')} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            <Award size={16} /> Take Diagnostic Quiz →
          </button>
        </Card>
      </div>

      {/* View Selector (Journey, Weekly, Monthly, Yearly) */}
      <Tabs tabs={ROADMAP_VIEWS} active={roadmapView} onChange={setRoadmapView} />

      <div style={{ marginTop: 'var(--space-6)' }}>
        
        {/* ============================================================ */}
        {/* 1. JOURNEY / VERTICAL TIMELINE VIEW                          */}
        {/* ============================================================ */}
        {roadmapView === 'journey' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-alt)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>🏁 START</span>
                <span>→</span>
                <span>SKILL BUILDING</span>
                <span>→</span>
                <span>PRACTICE CAPSTONES</span>
                <span>→</span>
                <span>GLOBAL HIRING 🚀</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {steps.map((stage, idx) => {
                const isCompleted = stage.status === 'completed';
                const isActive = stage.status === 'active';
                const isLocked = stage.status === 'locked';

                return (
                  <div key={stage.id} style={{ position: 'relative' }}>
                    {/* Connecting Path Line */}
                    {idx < steps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: 24,
                        top: 50,
                        bottom: -28,
                        width: 4,
                        background: isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                        zIndex: 1,
                      }} />
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                      {/* Node Circle */}
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                        border: `3px solid ${isActive ? 'rgba(13, 148, 136, 0.3)' : 'var(--color-surface)'}`,
                        color: isCompleted || isActive ? 'white' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 13,
                        boxShadow: isActive ? '0 0 16px rgba(13, 148, 136, 0.35)' : 'var(--shadow-sm)',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedStage(stage)}
                      title="Tap for stage details"
                      >
                        {isCompleted ? <Check size={20} /> : isActive ? <PlayCircle size={20} /> : <Lock size={18} />}
                      </div>

                      {/* Stage Card */}
                      <Card
                        className="card-hover"
                        style={{
                          flex: 1,
                          borderLeft: `4px solid ${isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isActive ? 'linear-gradient(135deg, var(--color-surface), rgba(13, 148, 136, 0.03))' : 'var(--color-surface)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedStage(stage)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 3, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                Milestone {idx + 1}
                              </span>
                              {isActive && (
                                <span style={{
                                  background: 'var(--color-primary)',
                                  color: 'white',
                                  fontSize: 9,
                                  fontWeight: 900,
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-full)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}>
                                  📍 ACTIVE
                                </span>
                              )}
                              {isCompleted && <Badge variant="success">✓ Done</Badge>}
                              {isLocked && <Badge variant="muted">🔒 Locked</Badge>}
                            </div>

                            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0, color: isLocked ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                              {stage.title}
                            </h2>
                          </div>

                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> ~{stage.estimatedWeeks || 3} Wks
                          </div>
                        </div>

                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                          {stage.description}
                        </p>

                        {/* Skills pills */}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                          {stage.skills?.map(skill => (
                            <span key={skill} style={{
                              background: 'var(--color-surface-alt)',
                              color: 'var(--color-text-primary)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '2px 7px',
                              fontSize: 10,
                              fontWeight: 600,
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Progress Bar for Active & Completed */}
                        {!isLocked && (
                          <div style={{ marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>
                              <span>Progress</span>
                              <span style={{ color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }}>{stage.progress || 0}%</span>
                            </div>
                            <ProgressBar value={stage.progress || 0} variant={isCompleted ? 'success' : 'primary'} size="sm" />
                          </div>
                        )}

                        {/* Quick Action Footer */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => setSelectedStage(stage)}
                          >
                            <BookOpen size={12} /> Stage Details & Actions
                          </button>

                          {isActive && (
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() => handleMarkComplete(stage)}
                              disabled={markingStageId === stage.id}
                            >
                              {markingStageId === stage.id ? 'Saving...' : '✓ Mark Complete'}
                            </button>
                          )}

                          {!isCompleted && (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setKnowThisModalStage(stage)}
                              style={{ color: 'var(--color-champagne-text)', fontWeight: 700 }}
                              title="Skip this milestone if already known"
                            >
                              <FastForward size={12} /> Already Know This
                            </button>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. WEEKLY ROADMAP VIEW                                       */}
        {/* ============================================================ */}
        {roadmapView === 'weekly' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                📅 Current Weekly Focus Sprint
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Active weekly targets breakdown for {activeStep?.title || 'Core Skills'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {(activeStep?.dailyTargets || [
                { day: 1, title: 'Concept Foundations & Theory', duration: 45, difficulty: 'Easy' },
                { day: 2, title: 'Hands-on Syntax & Core Mechanics', duration: 60, difficulty: 'Medium' },
                { day: 3, title: 'Algorithmic Problem Solving & Edge Cases', duration: 90, difficulty: 'Hard' },
                { day: 4, title: 'Real-World Architectural Pattern Build', duration: 90, difficulty: 'Hard' },
                { day: 5, title: 'Weekly Capstone Mini-Project & Code Review', duration: 90, difficulty: 'Hard' },
              ]).map(target => (
                <Card key={target.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'var(--color-primary)' }}>
                      D{target.day}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{target.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>⏱ {target.duration} min · {target.difficulty}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-xs" onClick={() => navigate('/targets')}>
                    Practice →
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. MONTHLY ROADMAP VIEW                                      */}
        {/* ============================================================ */}
        {roadmapView === 'monthly' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                🗓️ Monthly Milestone Sprints
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                4-week milestone blocks mapped toward {roadmap.goal} readiness
              </p>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              {steps.map((stage, i) => (
                <Card key={stage.id} style={{ borderTop: `3px solid ${stage.status === 'completed' ? 'var(--color-success)' : stage.status === 'active' ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      Month {i + 1}
                    </span>
                    <Badge variant={stage.status === 'completed' ? 'success' : stage.status === 'active' ? 'primary' : 'muted'}>
                      {stage.status === 'completed' ? 'Completed' : stage.status === 'active' ? 'Active Sprint' : 'Upcoming'}
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '0 0 6px' }}>{stage.title}</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                    {stage.description}
                  </p>
                  <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700 }}>
                    🎯 Target: {stage.practiceTask ? stage.practiceTask.slice(0, 60) + '...' : 'Complete technical capstone'}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. YEARLY ROADMAP VIEW                                       */}
        {/* ============================================================ */}
        {roadmapView === 'yearly' && (
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                🎓 Yearly Strategic Career Plan
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Macro roadmap connecting current academic year to graduation and international hiring
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[
                { year: 'Year 1: Foundations & Core Logic', focus: 'Programming syntax, algorithmic complexity, Git, and data structures fundamentals.' },
                { year: 'Year 2: Systems, APIs & Backend Scalability', focus: 'Databases, REST APIs, authentication, testing, and full-stack projects.' },
                { year: 'Year 3: Industrial Capstone & Internship', focus: 'Production portfolio development, cross-functional sprints, and LeetCode problem solving.' },
                { year: 'Year 4: Technical Interviews & Global Placement', focus: 'System design interviews, resume benchmarking, and target country visa requirements.' },
              ].map((yr, idx) => (
                <Card key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                      {idx + 1}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>{yr.year}</h3>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '6px 0 0', paddingLeft: 40, lineHeight: 1.5 }}>
                    {yr.focus}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* STAGE DETAIL MODAL / BOTTOM SHEET                            */}
      {/* ============================================================ */}
      {selectedStage && (
        <Modal
          isOpen={Boolean(selectedStage)}
          onClose={() => setSelectedStage(null)}
          title={`Milestone: ${selectedStage.title}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 2 }}>
                Stage Objective
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {selectedStage.description}
              </p>
            </div>

            {/* Proficiency Levels */}
            <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
              <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Level</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginTop: 2 }}>
                  {selectedStage.status === 'completed' ? 'Satisfied / Competent' : selectedStage.status === 'active' ? 'In Progress' : 'Pending Prerequisites'}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Target Level</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginTop: 2 }}>
                  Production Benchmark
                </div>
              </div>
            </div>

            {selectedStage.whyItMatters && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 2 }}>
                  💡 Why This Skill Matters for Your Career
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', margin: 0 }}>
                  {selectedStage.whyItMatters}
                </p>
              </div>
            )}

            {selectedStage.conceptDetails && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  📚 Weekly Topics & Core Concepts
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {selectedStage.conceptDetails}
                </p>
              </div>
            )}

            {selectedStage.practiceTask && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 2 }}>
                  🛠️ Capstone Practice Exercise
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {selectedStage.practiceTask}
                </p>
              </div>
            )}

            {/* Quick progress slider */}
            {selectedStage.status === 'active' && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label htmlFor="stage-prog-input" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Update Stage Progress %</label>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{selectedStage.progress}%</span>
                </div>
                <input
                  id="stage-prog-input"
                  type="range"
                  min="0"
                  max="100"
                  value={selectedStage.progress || 0}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setSelectedStage({ ...selectedStage, progress: val });
                    handleUpdateProgress(selectedStage.id, val);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Actions: Start, Mark Complete, Already Know This, Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedStage(null)}>
                Close
              </button>

              {selectedStage.status !== 'completed' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setKnowThisModalStage(selectedStage);
                  }}
                  style={{ color: 'var(--color-champagne-text)', fontWeight: 700 }}
                >
                  <FastForward size={14} /> Already Know This
                </button>
              )}

              {selectedStage.status === 'active' && (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedStage(null);
                      navigate('/targets');
                    }}
                  >
                    Start Daily Practice
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleMarkComplete(selectedStage)}
                  >
                    ✓ Mark Stage Complete
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* KNOWLEDGE-AWARE ADAPTATION CONFIRMATION MODAL                */}
      {/* ============================================================ */}
      {knowThisModalStage && (
        <Modal
          isOpen={Boolean(knowThisModalStage)}
          onClose={() => setKnowThisModalStage(null)}
          title="Knowledge-Aware Adaptation"
          size="md"
        >
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              PathWise proposes skipping the <strong>"{knowThisModalStage.title}"</strong> section because you marked it as already known.
            </p>
            <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 2 }}>
                ⚡ Proposed System Changes:
              </div>
              <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
                <li>{knowThisModalStage.title} → Marked as Target Met (100%)</li>
                <li>Next Milestone → Promoted to Active focus sprint</li>
                <li>Weekly, Monthly & Yearly Targets → Accelerated</li>
                <li>Skills Profile & AI Mentor context → Synchronized</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setKnowThisModalStage(null)}
              >
                Keep Current Path
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApplyKnowledgeAdaptation}
              >
                Apply Change ⚡
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
