import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, StatCard, ProgressBar, Badge, LoadingState, EmptyState, SectionHeader } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { calculatePerformance, generateWeeklyInsight } from '../services/performanceCalc.js';

function formatDuration(s) {
  if (!s) return '0h';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
}

const COLORS = ['#0d9488', '#d4af7a', '#c2692a', '#dc2626', '#16a34a'];

export default function Analytics() {
  const { user } = useAuth();
  const { roadmap } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const a = await dataService.getAnalytics(user.userId);
      setAnalytics(a);
      if (a) {
        const perf = calculatePerformance({ ...a, roadmap });
        setPerformance(perf);
        setInsight(generateWeeklyInsight(a));
      }
      setLoading(false);
    }
    load();
  }, [user, roadmap]);

  if (loading) {
    return (
      <AppLayout pageTitle="Analytics">
        <LoadingState text="Computing real-time learning metrics..." />
      </AppLayout>
    );
  }

  // Normalize 1-day vs multi-day data for charts
  const studyData = analytics?.studyTimeByDay || [];
  
  let weeklyTargetData = analytics?.weeklyTargetsProgress || [];
  if (weeklyTargetData.length === 0 && (analytics?.targets?.totalCompleted > 0 || analytics?.targets?.total > 0)) {
    const rate = Math.round(((analytics?.targets?.totalCompleted || 0) / (analytics?.targets?.total || 1)) * 100);
    weeklyTargetData = [{ week: 'Day 1', completionRate: rate, completed: analytics?.targets?.totalCompleted || 0, total: analytics?.targets?.total || 1 }];
  }

  const skillData = analytics?.skillProgress || [];
  const quizData = analytics?.quizScores || [];
  const assignmentPieData = analytics?.assignments ? [
    { name: 'Completed', value: analytics.assignments.completed },
    { name: 'Pending', value: analytics.assignments.pending },
    { name: 'Overdue', value: analytics.assignments.overdue },
  ] : [];

  const hasActivity = 
    (analytics?.studyTime?.total > 0) || 
    (analytics?.targets?.totalCompleted > 0) || 
    (analytics?.targets?.total > 0) || 
    (quizData.length > 0) || 
    (assignmentPieData.some(d => d.value > 0)) ||
    (analytics?.streak?.currentStreak > 0) ||
    (analytics?.streak?.totalActiveDays > 0);

  return (
    <AppLayout pageTitle="Analytics">
      <SectionHeader
        title="Analytics & Diagnostic Trajectory 📊"
        subtitle="100% real-time metrics computed directly from your study sessions, targets, and quizzes"
      />

      {/* Overall Performance Score */}
      {performance && (
        <Card style={{ marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(79,110,247,0.05), rgba(124,58,237,0.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: `var(--color-${performance.label.color})`, lineHeight: 1 }}>
                {performance.overall}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>/ 100</div>
              <Badge variant={performance.label.color === 'success' ? 'success' : performance.label.color === 'primary' ? 'primary' : performance.label.color === 'warning' ? 'warning' : 'error'} style={{ marginTop: 8 }}>
                {performance.label.text}
              </Badge>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontWeight: 800, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-base)' }}>
                Holistic Performance Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {Object.values(performance.components).map(comp => (
                  <div key={comp.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: 3, fontWeight: 600 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{comp.label}</span>
                      <span>{comp.score}% <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(weight: {Math.round(comp.weight * 100)}%)</span></span>
                    </div>
                    <ProgressBar value={comp.score} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
            ⚠️ {performance.disclaimer}
          </p>
        </Card>
      )}

      {/* Real Stats Row */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard label="Active Streak" value={`${analytics?.streak?.currentStreak || 0} 🔥`} meta={`All-Time Best: ${analytics?.streak?.longestStreak || 0} days`} />
        <StatCard label="Today Targets" value={`${analytics?.targets?.todayCompleted || 0} / ${analytics?.targets?.todayTotal || 0}`} meta="Completed Today" />
        <StatCard label="Study Time (7 Days)" value={formatDuration(analytics?.studyTime?.week)} meta="Focused Deep Work" />
        <StatCard label="Total Focus Time" value={formatDuration(analytics?.studyTime?.total)} meta="All-Time Total" />
      </div>

      {!hasActivity ? (
        <EmptyState
          icon="📊"
          title="No Learning Activity Recorded Yet"
          description="Complete your daily learning targets, record focused time in the Study Timer, or take a Skill Quiz to see your performance analytics."
        />
      ) : (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            {/* Real Study Time by Day */}
            <Card>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                ⏱️ Daily Study Hours (Past 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} unit="h" />
                  <Tooltip formatter={v => [`${v}h`, 'Study Hours']} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} minPointSize={4} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Real Weekly Target Completion */}
            <Card>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                ✅ Learning Target Completion Rate
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyTargetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} unit="%" />
                  <Tooltip formatter={v => [`${v}%`, 'Completion Rate']} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="completionRate" stroke="var(--color-success)" strokeWidth={2.5} dot={{ r: 6, fill: 'var(--color-success)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            {/* Real Roadmap Skill Progress */}
            <Card>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                🗺️ FutureForge Stage Progression
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {skillData.length === 0 ? (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>No roadmap milestones generated yet.</div>
                ) : (
                  skillData.map(s => (
                    <div key={s.skill}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 3 }}>
                        <span>{s.skill}</span>
                        <span style={{ color: s.progress === 100 ? 'var(--color-success)' : s.progress > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                          {s.progress}%
                        </span>
                      </div>
                      <ProgressBar value={s.progress} variant={s.progress === 100 ? 'success' : 'primary'} />
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Real Assignments Distribution */}
            <Card>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                📝 Assignment Status Distribution
              </h3>
              {assignmentPieData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={assignmentPieData} cx="50%" cy="50%" outerRadius={68} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false} fontSize={11}>
                      {assignmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[COLORS[1], COLORS[0], COLORS[3]][index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  No assignments tracked yet. Add coursework in Assignments tab.
                </div>
              )}
            </Card>
          </div>

          {/* Real Diagnostic Quiz Performance */}
          {quizData.length > 0 && (
            <Card style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                🧠 Diagnostic Quiz Scores History
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quizData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="topic" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} unit="%" />
                  <Tooltip formatter={v => [`${v}%`, 'Diagnostic Score']} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} minPointSize={5}>
                    {quizData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 80 ? COLORS[1] : entry.score >= 60 ? COLORS[0] : COLORS[3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* AI Weekly Insight */}
          <Card style={{ background: 'linear-gradient(135deg, rgba(79,110,247,0.06), rgba(124,58,237,0.06))', border: '1px solid rgba(79,110,247,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  AI Performance Copilot Insight
                  <Badge variant="primary">Computed Real-Time</Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {insight}
                </p>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                  ⚠️ Generated from your authentic activity records. All metrics update synchronously with daily targets and study sessions.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  );
}

