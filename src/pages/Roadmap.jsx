import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, CheckCircle, PlayCircle, ChevronRight, Award, Compass,
  Sparkles, BookOpen, Layers, Target, Clock, ArrowRight, Check
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, EmptyState, LoadingState, SectionHeader, Modal, Alert } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';

export default function FutureForgeRoadmap() {
  const { user } = useAuth();
  const { showToast, refreshRoadmap } = useApp();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [markingStageId, setMarkingStageId] = useState(null);

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
          description="Select your career direction to forge your personalized, skill-first roadmap."
          action={{ label: 'Set Career Goal', onClick: () => navigate('/goal-career') }}
        />
      </AppLayout>
    );
  }

  const steps = roadmap.steps || [];
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const activeStep = steps.find(s => s.status === 'active') || steps[0];
  const overallProgress = Math.round(steps.reduce((sum, s) => sum + (s.progress || 0), 0) / (steps.length || 1));

  return (
    <AppLayout pageTitle="FutureForge">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(212, 175, 122, 0.06))',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6) var(--space-8)',
        marginBottom: 'var(--space-8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            <Sparkles size={14} /> FutureForge Career Engine
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            {roadmap.goal} Pathway
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Destination: <strong>{roadmap.country || 'International'}</strong> · {steps.length} Milestones · Personalized & Skill-First
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>Overall Readiness</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>{overallProgress}%</div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/goal-career')}>
            <Compass size={16} /> Change Goal
          </button>
        </div>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Completed Stages</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)' }}>{completedCount} / {steps.length}</div>
        </Card>
        <Card style={{ textAlign: 'center', border: '1px solid var(--color-primary)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 4, fontWeight: 800, textTransform: 'uppercase' }}>● Current Active Stage</div>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeStep?.title || 'None'}
          </div>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>Skill Quizzes Ready</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/skill-quiz')} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            <Award size={16} /> Take Diagnostic Quiz →
          </button>
        </Card>
      </div>

      {/* Interactive Visual Journey Roadmap */}
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-alt)', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            <span>🏁 START</span>
            <span>→</span>
            <span>SKILL BUILDING</span>
            <span>→</span>
            <span>PROJECTS</span>
            <span>→</span>
            <span>CAREER READY 🚀</span>
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
                    left: 28,
                    top: 60,
                    bottom: -32,
                    width: 4,
                    background: isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                    zIndex: 1,
                  }} />
                )}

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                  {/* Node Circle */}
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    border: `4px solid ${isActive ? 'rgba(13, 148, 136, 0.3)' : 'var(--color-surface)'}`,
                    color: isCompleted || isActive ? 'white' : 'var(--color-text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 14,
                    boxShadow: isActive ? '0 0 20px rgba(13, 148, 136, 0.35)' : 'var(--shadow-md)',
                    flexShrink: 0,
                    transition: 'all 200ms ease',
                  }}>
                    {isCompleted ? <Check size={24} /> : isActive ? <PlayCircle size={24} /> : <Lock size={20} />}
                  </div>

                  {/* Stage Card */}
                  <Card
                    className="card-hover"
                    style={{
                      flex: 1,
                      borderLeft: `5px solid ${isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isActive ? 'linear-gradient(135deg, var(--color-surface), rgba(13, 148, 136, 0.04))' : 'var(--color-surface)',
                      boxShadow: isActive ? '0 4px 20px rgba(13, 148, 136, 0.08)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Milestone {idx + 1}
                          </span>
                          {isActive && (
                            <span style={{
                              background: 'var(--color-primary)',
                              color: 'white',
                              fontSize: 10,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              animation: 'pulse 2s infinite',
                            }}>
                              📍 YOU ARE HERE
                            </span>
                          )}
                          {isCompleted && <Badge variant="success">✓ Completed</Badge>}
                          {isLocked && <Badge variant="muted">🔒 Locked</Badge>}
                        </div>

                        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0, color: isLocked ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                          {stage.title}
                        </h2>
                      </div>

                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> ~{stage.estimatedWeeks || 3} Weeks
                      </div>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                      {stage.description}
                    </p>

                    {/* Skills pills */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                      {stage.skills?.map(skill => (
                        <span key={skill} style={{
                          background: 'var(--color-surface-alt)',
                          color: 'var(--color-text-primary)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar for Active & Completed */}
                    {!isLocked && (
                      <div style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: 4 }}>
                          <span>Stage Progress</span>
                          <span style={{ color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }}>{stage.progress || 0}%</span>
                        </div>
                        <ProgressBar value={stage.progress || 0} variant={isCompleted ? 'success' : 'primary'} size="sm" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedStage(stage)}
                      >
                        <BookOpen size={14} /> View Stage Details & Tasks
                      </button>

                      {isActive && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/targets')}
                          >
                            <Target size={14} /> Open Daily Targets
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleMarkComplete(stage)}
                            disabled={markingStageId === stage.id}
                          >
                            {markingStageId === stage.id ? 'Completing...' : '✓ Mark Stage Complete'}
                          </button>
                        </>
                      )}

                      {stage.quizId && !isLocked && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate('/skill-quiz')}
                          style={{ color: 'var(--color-accent)', fontWeight: 700 }}
                        >
                          <Award size={14} /> Skill Quiz
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

      {/* Stage Detail Drawer / Modal */}
      {selectedStage && (
        <Modal
          isOpen={Boolean(selectedStage)}
          onClose={() => setSelectedStage(null)}
          title={`FutureForge: ${selectedStage.title}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 2 }}>
                Stage Overview
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {selectedStage.description}
              </p>
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
                  📚 Core Concepts Covered
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {selectedStage.conceptDetails}
                </p>
              </div>
            )}

            {selectedStage.practiceTask && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 2 }}>
                  🛠️ Practical Capstone / Practice Exercise
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {selectedStage.practiceTask}
                </p>
              </div>
            )}

            {/* Quick progress update slider */}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedStage(null)}>
                Close
              </button>
              {selectedStage.status === 'active' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleMarkComplete(selectedStage)}
                >
                  ✓ Complete & Unlock Next Milestone
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
