import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Award } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, StatCard, ProgressBar, DemoBanner, LoadingState } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { DEMO_ACHIEVEMENTS } from '../data/demoData.js';

export default function Habits() {
  const { user } = useAuth();
  const { streak: ctxStreak, refreshStreak } = useApp();
  const [streak, setStreak] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activityDates, setActivityDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      await refreshStreak();
      const [s, a] = await Promise.all([
        dataService.getStreak(user.userId),
        dataService.getAchievements(user.userId),
      ]);
      setStreak(s);
      setActivityDates(s?.activityDates || []);
      setAchievements(a || []);
      setLoading(false);
    }
    load();
  }, [user, refreshStreak]);

  // Build last 70 days (10 weeks) for calendar
  const today = new Date();
  const calendarDays = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({ date: dateStr, active: activityDates.includes(dateStr), isToday: i === 0 });
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const currentStreak = streak?.currentStreak || ctxStreak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || ctxStreak?.longestStreak || 0;
  const totalDays = streak?.totalActiveDays || ctxStreak?.totalActiveDays || 0;

  return (
    <AppLayout pageTitle="Habits & Streaks">
      {user?.isDemo && <DemoBanner />}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="page-title">Habits & Streaks 🔥</h1>
        <p className="page-subtitle">Track your study consistency and build lasting habits</p>
      </div>

      {loading ? <LoadingState text="Loading habit data..." /> : (
        <>
          {/* Stats */}
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
            <StatCard label="Current Streak" value={`${currentStreak} 🔥`} meta="Consecutive days" icon={<Flame size={18} />} iconBg="rgba(245,158,11,0.15)" iconColor="var(--color-warning)" />
            <StatCard label="Longest Streak" value={`${longestStreak} 🏆`} meta="Personal best" icon={<Award size={18} />} iconBg="rgba(124,58,237,0.15)" iconColor="var(--color-accent)" />
            <StatCard label="Total Active Days" value={totalDays} meta="All time" icon={<Calendar size={18} />} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />
            <StatCard label="Achievements" value={`${unlockedCount}/${achievements.length}`} meta="Unlocked" icon={<Award size={18} />} iconBg="var(--color-success-light)" iconColor="var(--color-success)" />
          </div>

          {/* Activity Calendar */}
          <Card style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>📅 Activity Calendar — Last 10 Weeks</h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
              A day is marked active when you complete a target or log a study session.
            </p>

            {/* Day of week labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {calendarDays.map(day => (
                <div
                  key={day.date}
                  title={`${day.date}${day.active ? ' ✓ Active' : ''}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 4,
                    background: day.active ? 'var(--color-success)' : 'var(--color-surface-alt)',
                    outline: day.isToday ? '2px solid var(--color-primary)' : 'none',
                    outlineOffset: 1,
                    cursor: 'default',
                    transition: 'opacity 150ms',
                    opacity: day.active ? 1 : 0.4,
                  }}
                  aria-label={`${day.date}: ${day.active ? 'Active' : 'No activity'}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-success)' }} /> Active day
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-surface-alt)', opacity: 0.4 }} /> No activity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-surface-alt)', outline: '2px solid var(--color-primary)', outlineOffset: 1 }} /> Today
              </div>
            </div>
          </Card>

          {/* Streak Policy */}
          <Card style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>📏 Streak Policy</h2>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              <p>• Your streak counts <strong>consecutive days</strong> with at least one completed target or logged study session.</p>
              <p>• If you miss a day, your streak resets to 0.</p>
              <p>• Activity from <strong>today or yesterday</strong> keeps your streak alive.</p>
              <p>• Longest streak is your personal record and never resets.</p>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <h2 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>🏆 Achievements</h2>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              {achievements.map(a => (
                <div key={a.id} className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon" style={{ background: a.unlocked ? 'var(--color-warning-light)' : 'var(--color-surface-alt)' }}>
                    {a.unlocked ? a.emoji : '🔒'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{a.description}</div>
                    {a.unlocked && a.unlockedAt && (
                      <div style={{ fontSize: 10, color: 'var(--color-warning)', marginTop: 3, fontWeight: 600 }}>
                        Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                    {!a.unlocked && (
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3 }}>Keep studying to unlock</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
