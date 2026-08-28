import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, Timer } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, StatCard, EmptyState, LoadingState, DemoBanner } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';

const SUBJECTS = ['Data Structures & Algorithms', 'Database Management Systems', 'Python Fundamentals', 'Machine Learning', 'Computer Networks', 'Engineering Mathematics', 'Professional Ethics', 'Other'];
const ACTIVITIES = ['Study', 'Practice / Coding', 'Revision', 'Assignment', 'Lecture Notes', 'Other'];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function StudyTimer() {
  const { user } = useAuth();
  const { showToast, refreshStreak } = useApp();

  const [timerState, setTimerState] = useState('idle'); // idle | running | paused
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('');
  const [activity, setActivity] = useState('Study');
  const [sessionNote, setSessionNote] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [s, a] = await Promise.all([
        dataService.getStudySessions(user.userId),
        dataService.getAnalytics(user.userId),
      ]);
      setSessions(s.slice(0, 15));
      setAnalytics(a);
      setLoading(false);
    }
    load();
  }, [user]);

  // Cleanup on unmount
  useEffect(() => { return () => clearInterval(intervalRef.current); }, []);

  function handleStart() {
    if (!subject) { showToast('Please select a subject first.', 'error'); return; }
    const now = new Date();
    setStartTime(now);
    startTimeRef.current = Date.now() - pausedAtRef.current * 1000;
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function handlePause() {
    clearInterval(intervalRef.current);
    pausedAtRef.current = elapsed;
    setTimerState('paused');
  }

  function handleResume() {
    startTimeRef.current = Date.now() - pausedAtRef.current * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setTimerState('running');
  }

  async function handleStop() {
    clearInterval(intervalRef.current);
    if (elapsed < 10) { showToast('Session too short to save (< 10 seconds).', 'warning'); handleReset(); return; }
    setSaving(true);
    const endTime = new Date();
    const session = {
      date: new Date().toISOString().split('T')[0],
      startTime: startTime?.toTimeString().slice(0, 5) || '00:00',
      endTime: endTime.toTimeString().slice(0, 5),
      duration: elapsed,
      subject,
      activity,
      notes: sessionNote,
    };
    await dataService.saveStudySession(user.userId, session);
    await refreshStreak();
    const updated = await dataService.getStudySessions(user.userId);
    setSessions(updated.slice(0, 15));
    const updatedAnalytics = await dataService.getAnalytics(user.userId);
    setAnalytics(updatedAnalytics);
    setSaving(false);
    showToast(`✅ Session saved! ${formatDuration(elapsed)} of ${subject} recorded.`, 'success');
    handleReset();
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setElapsed(0);
    pausedAtRef.current = 0;
    setStartTime(null);
    setTimerState('idle');
    setSessionNote('');
  }

  const todayStudyTime = analytics?.studyTime?.today || 0;
  const weekStudyTime = analytics?.studyTime?.week || 0;
  const totalStudyTime = analytics?.studyTime?.total || 0;

  return (
    <AppLayout pageTitle="Study Timer">
      {user?.isDemo && <DemoBanner />}
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 className="page-title">Study Timer ⏱</h1>
          <p className="page-subtitle">Track your focused study sessions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
          <StatCard label="Today" value={formatDuration(todayStudyTime)} meta="Study time logged" icon={<Timer size={18} />} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />
          <StatCard label="This Week" value={formatDuration(weekStudyTime)} meta="Week total" icon={<Timer size={18} />} iconBg="var(--color-success-light)" iconColor="var(--color-success)" />
          <StatCard label="All Time" value={formatDuration(totalStudyTime)} meta="Total recorded" icon={<Timer size={18} />} iconBg="var(--color-accent-light)" iconColor="var(--color-accent)" />
        </div>

        <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
          {/* Timer card */}
          <Card>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Session Timer</h2>

            {/* Subject & Activity (only when idle) */}
            {timerState === 'idle' && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="form-group">
                  <label htmlFor="timer-subject" className="form-label">Subject / Course *</label>
                  <select id="timer-subject" className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
                    <option value="">Select a subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="timer-activity" className="form-label">Activity Type</label>
                  <select id="timer-activity" className="form-select" value={activity} onChange={e => setActivity(e.target.value)}>
                    {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Timer display */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)', padding: 'var(--space-8)' }}>
              <div className={`timer-display ${timerState === 'running' ? 'running' : timerState === 'paused' ? 'paused' : ''}`} aria-live="polite" aria-label={`Timer: ${formatTime(elapsed)}`}>
                {formatTime(elapsed)}
              </div>
              {timerState !== 'idle' && (
                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  {subject} · {activity}
                  {timerState === 'paused' && <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}> · PAUSED</span>}
                </div>
              )}
            </div>

            {/* Session note */}
            {timerState !== 'idle' && (
              <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                <label htmlFor="session-note" className="form-label">Session Note (optional)</label>
                <textarea id="session-note" className="form-textarea" placeholder="What did you study?" value={sessionNote} onChange={e => setSessionNote(e.target.value)} rows={2} />
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {timerState === 'idle' && (
                <button className="btn btn-primary btn-lg" onClick={handleStart} id="timer-start-btn" style={{ minWidth: 140 }}>
                  <Play size={20} /> Start
                </button>
              )}
              {timerState === 'running' && (
                <>
                  <button className="btn btn-secondary btn-lg" onClick={handlePause} id="timer-pause-btn">
                    <Pause size={20} /> Pause
                  </button>
                  <button className="btn btn-danger btn-lg" onClick={handleStop} disabled={saving} id="timer-stop-btn">
                    <Square size={20} /> {saving ? 'Saving...' : 'Stop & Save'}
                  </button>
                </>
              )}
              {timerState === 'paused' && (
                <>
                  <button className="btn btn-primary btn-lg" onClick={handleResume} id="timer-resume-btn">
                    <Play size={20} /> Resume
                  </button>
                  <button className="btn btn-danger btn-lg" onClick={handleStop} disabled={saving} id="timer-stop-paused-btn">
                    <Square size={20} /> {saving ? 'Saving...' : 'Stop & Save'}
                  </button>
                </>
              )}
              {(timerState === 'paused' || timerState === 'running') && (
                <button className="btn btn-ghost btn-lg" onClick={handleReset} id="timer-reset-btn">
                  <RotateCcw size={18} /> Reset
                </button>
              )}
            </div>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Recent Sessions</h2>
            {loading ? <LoadingState text="Loading sessions..." /> :
              sessions.length === 0 ? (
                <EmptyState icon="⏱" title="No sessions yet" description="Start your first study session using the timer" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {sessions.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                        <Timer size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.date} · {s.activity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>
                        {formatDuration(s.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
