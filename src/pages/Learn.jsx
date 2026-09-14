import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Timer, ClipboardList, Plus, Sparkles, CheckCircle2, Play, Flame } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, Tabs, EmptyState, LoadingState, PriorityIndicator } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { sortByPriority } from '../services/priorityEngine.js';
import { rankSubjectsByDifficulty } from '../services/difficultyEngine.js';

export default function Learn() {
  const { user } = useAuth();
  const { showToast, streak } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'assignments';

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [studyTimeToday, setStudyTimeToday] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [assigns, subs, sess, anl] = await Promise.all([
        dataService.getAssignments(user.userId),
        dataService.getSubjects(user.userId),
        dataService.getStudySessions(user.userId),
        dataService.getAnalytics(user.userId),
      ]);
      setAssignments(assigns);
      setSubjects(rankSubjectsByDifficulty(subs));
      setSessions(sess.slice(0, 5));
      setStudyTimeToday(anl?.studyTime?.today || 0);
      setLoading(false);
    }
    loadData();
  }, [user]);

  function setTab(tabId) {
    setSearchParams({ tab: tabId });
  }

  const today = new Date().toISOString().split('T')[0];
  const pendingAssignments = sortByPriority(assignments.filter(a => a.status === 'pending'));
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  async function handleCompleteAssignment(id) {
    await dataService.completeAssignment(user.userId, id);
    const updated = await dataService.getAssignments(user.userId);
    setAssignments(updated);
    showToast('Assignment marked complete!', 'success');
  }

  const LEARN_TABS = [
    { id: 'assignments', label: 'Assignments', count: pendingAssignments.length },
    { id: 'velocity', label: 'Study Velocity' },
    { id: 'curriculum', label: 'Curriculum & Syllabus' },
  ];

  const hoursToday = (studyTimeToday / 3600).toFixed(1);

  return (
    <AppLayout pageTitle="Learn">
      {/* Mobile-First Header Strip */}
      <div className="learn-hub-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="learn-hub-icon">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="learn-hub-title">Learning Hub</h1>
            <p className="learn-hub-sub">Coursework, study sessions & academic syllabus</p>
          </div>
        </div>

        <div className="learn-hub-kpis">
          <div className="learn-kpi-pill">
            <Flame size={13} color="var(--color-warning)" />
            <span>{streak?.currentStreak || 0}d Streak</span>
          </div>
          <div className="learn-kpi-pill">
            <Timer size={13} color="var(--color-primary)" />
            <span>{hoursToday}h Today</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <Tabs tabs={LEARN_TABS} active={activeTab} onChange={setTab} />

      <div style={{ marginTop: 'var(--space-5)' }}>
        {loading ? (
          <LoadingState text="Loading learning data..." />
        ) : (
          <>
            {/* ===== ASSIGNMENTS TAB ===== */}
            {activeTab === 'assignments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                      Active Coursework ({pendingAssignments.length})
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                      Prioritized by deadline urgency, difficulty & academic weight
                    </p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/assignments')}>
                    <Plus size={14} /> Add Assignment
                  </button>
                </div>

                {pendingAssignments.length === 0 ? (
                  <EmptyState
                    icon="✨"
                    title="No pending assignments"
                    description="You are completely caught up! Add a new coursework item to track deadlines."
                    action={{ label: '+ Add Assignment', onClick: () => navigate('/assignments') }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {pendingAssignments.map(a => {
                      const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      const isOverdue = a.deadline < today;
                      return (
                        <Card key={a.id} className="learn-assignment-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                                <PriorityIndicator category={a.priorityCategory} />
                                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                                  {a.title}
                                </span>
                              </div>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 4 }}>
                                <span>📘 {a.subject || 'General'}</span>
                                <span style={{ color: isOverdue ? 'var(--color-error)' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                                  📅 {isOverdue ? '⚠️ Overdue' : `Due: ${a.deadline} (${daysLeft}d left)`}
                                </span>
                                <span>⏱ ~{a.estimatedHours}h</span>
                              </div>
                            </div>

                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleCompleteAssignment(a.id)}
                              style={{ flexShrink: 0 }}
                              title="Mark assignment as completed"
                            >
                              <CheckCircle2 size={15} />
                              <span className="hide-on-mobile-sm">Done</span>
                            </button>
                          </div>
                        </Card>
                      );
                    })}

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>
                        View Full Assignment Manager ({assignments.length} total) →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== STUDY VELOCITY TAB ===== */}
            {activeTab === 'velocity' && (
              <div>
                <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  <Card style={{ textAlign: 'center', background: 'var(--gradient-primary-subtle)', border: '1px solid rgba(13, 148, 136, 0.25)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Today's Focused Time
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                      {hoursToday}h
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 6, marginBottom: 'var(--space-4)' }}>
                      Recorded through the Study Velocity Timer
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/timer')} style={{ margin: '0 auto' }}>
                      <Play size={14} /> Open Live Study Timer
                    </button>
                  </Card>

                  <Card>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                      ⏱️ Recent Study Sessions
                    </div>
                    {sessions.length === 0 ? (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0' }}>
                        No study sessions logged today. Start a focused timer session!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {sessions.map((s, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)' }}>
                            <span style={{ fontWeight: 600 }}>{s.subject}</span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                              {Math.floor(s.duration / 60)} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/timer')}>
                    Launch Full Stopwatch & Velocity Engine →
                  </button>
                </div>
              </div>
            )}

            {/* ===== CURRICULUM & SYLLABUS TAB ===== */}
            {activeTab === 'curriculum' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                      Academic Subjects ({subjects.length})
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                      Ranked by algorithmic difficulty & conceptual density
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/academic')}>
                    Open Syllabus Upload →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {subjects.slice(0, 4).map((sub, idx) => (
                    <Card key={sub.id} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: idx === 0 ? 'var(--color-error-light)' : idx === 1 ? 'var(--color-warning-light)' : 'var(--color-surface-alt)',
                            color: idx === 0 ? 'var(--color-error)' : idx === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, flexShrink: 0
                          }}>
                            #{idx + 1}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              {sub.code} · {sub.units} Units · {sub.topicCount} Topics
                            </div>
                          </div>
                        </div>

                        <Badge variant={sub.category === 'Difficult' ? 'error' : sub.category === 'Moderate' ? 'warning' : 'success'}>
                          {sub.category} ({sub.score}/100)
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/academic')}>
                    View Full Academic Syllabus & Attendance →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
