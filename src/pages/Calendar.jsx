import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, CheckCircle, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, Modal, SectionHeader } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { dataService } from '../services/dataService.js';

const TYPE_CONFIG = {
  assignment: { color: '#ef4444', emoji: '📝', label: 'Assignment Deadline' },
  exam: { color: '#f59e0b', emoji: '📚', label: 'Exam Schedule' },
  target: { color: '#0d9488', emoji: '🎯', label: 'Learning Target' },
  custom: { color: '#10b981', emoji: '📌', label: 'Event' },
};

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  // Fill leading days from previous month
  const startDow = (firstDay.getDay() + 6) % 7; // Monday first
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, current: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true });
  }
  // Fill trailing days
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    days.push({ date: next, current: false });
  }
  return days;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!user) return;
    async function loadUnifiedCalendar() {
      const [calEvents, assigns, exams, targets] = await Promise.all([
        dataService.getCalendarEvents(user.userId),
        dataService.getAssignments(user.userId),
        dataService.getExams(user.userId),
        dataService.getTargets(user.userId),
      ]);

      // Combine direct calendar events and live entity synchronizations
      const unifiedMap = new Map();

      // 1. Assignments
      assigns.forEach(a => {
        if (a.deadline) {
          unifiedMap.set(`asg_${a.id}`, {
            id: `asg_${a.id}`,
            date: a.deadline,
            type: 'assignment',
            title: `📝 ${a.title} Deadline`,
            detail: `${a.subject || 'Assignment'} — Priority: ${a.priorityCategory || 'Medium'}`,
            completed: a.status === 'completed',
          });
        }
      });

      // 2. Exams
      exams.forEach(e => {
        if (e.date) {
          unifiedMap.set(`exm_${e.id}`, {
            id: `exm_${e.id}`,
            date: e.date,
            type: 'exam',
            title: `📚 ${e.name}`,
            detail: `${e.type || 'Exam'} (${e.syllabus || 'Topics scheduled'})`,
            completed: false,
          });
        }
      });

      // 3. Targets
      targets.forEach(t => {
        if (t.date) {
          unifiedMap.set(`tgt_${t.id}`, {
            id: `tgt_${t.id}`,
            date: t.date,
            type: 'target',
            title: `🎯 ${t.title}`,
            detail: `${t.course || 'Learning Target'} (${t.estimatedDuration || 45}m)`,
            completed: t.status === 'completed',
          });
        }
      });

      // 4. Any custom calendar events
      calEvents.forEach(ce => {
        if (!unifiedMap.has(`asg_${ce.referenceId}`) && !unifiedMap.has(`exm_${ce.referenceId}`)) {
          unifiedMap.set(ce.id, {
            id: ce.id,
            date: ce.date,
            type: ce.type || 'custom',
            title: ce.title,
            detail: ce.detail,
          });
        }
      });

      setEvents(Array.from(unifiedMap.values()));
    }

    loadUnifiedCalendar();
  }, [user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);
  const todayStr = new Date().toISOString().split('T')[0];

  function getEventsForDate(dateObj) {
    const dStr = dateObj.toISOString().split('T')[0];
    return events.filter(e => {
      const matchDate = e.date === dStr;
      const matchFilter = filterType === 'all' || e.type === filterType;
      return matchDate && matchFilter;
    });
  }

  function handleDayClick(dayObj) {
    const evs = getEventsForDate(dayObj.date);
    setSelectedDay(dayObj.date.toISOString().split('T')[0]);
    setDayEvents(evs);
  }

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <AppLayout pageTitle="Unified Calendar">
      <SectionHeader
        title="Unified Calendar 📅"
        subtitle="Automatic synchronization across assignment deadlines, exam schedules, and daily learning targets"
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Synchronized Events' },
          { id: 'assignment', label: '📝 Assignment Deadlines' },
          { id: 'exam', label: '📚 Exams' },
          { id: 'target', label: '🎯 Learning Targets' },
        ].map(f => (
          <button
            key={f.id}
            className={`btn ${filterType === f.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilterType(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
        {/* Calendar Grid Card */}
        <Card>
          {/* Month Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, margin: 0 }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="calendar-monthly-grid" style={{ marginBottom: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="calendar-weekday-header">
                {d}
              </div>
            ))}
          </div>

          {/* Monthly Box Grid Days */}
          <div className="calendar-monthly-grid">
            {days.map((day, idx) => {
              const dStr = day.date.toISOString().split('T')[0];
              const dayEvs = getEventsForDate(day.date);
              const isToday = dStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`calendar-day-box ${isToday ? 'is-today' : ''} ${!day.current ? 'other-month' : ''}`}
                  onClick={() => handleDayClick(day)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleDayClick(day)}
                  title={`${dStr}${dayEvs.length > 0 ? ` (${dayEvs.length} events)` : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="calendar-day-num">{day.date.getDate()}</span>
                    {isToday && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Today</span>
                    )}
                  </div>

                  {/* Compact Event Chips */}
                  <div className="calendar-events-container">
                    {dayEvs.slice(0, 2).map((ev, ei) => {
                      const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                      return (
                        <div
                          key={ei}
                          className="calendar-event-chip"
                          style={{
                            borderLeftColor: cfg.color,
                            background: 'var(--color-surface-alt)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          <span>{cfg.emoji}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.title.replace(/^[📝📚🎯📌]\s*/, '')}
                          </span>
                        </div>
                      );
                    })}
                    {dayEvs.length > 2 && (
                      <div className="calendar-more-badge">
                        +{dayEvs.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color }} />
                <span style={{ fontWeight: 600 }}>{cfg.emoji} {cfg.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Synchronized Events Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} className="text-primary" /> Upcoming Synchronized Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {events
                .filter(e => e.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 8)
                .map(ev => {
                  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                  const daysLeft = Math.ceil((new Date(ev.date) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div
                      key={ev.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-alt)',
                        borderLeft: `4px solid ${cfg.color}`,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <span>📅 {ev.date}</span>
                        <span style={{ fontWeight: 700, color: daysLeft <= 2 ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                          {daysLeft === 0 ? 'Due Today' : `${daysLeft} days away`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {events.filter(e => e.date >= todayStr).length === 0 && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
                  No upcoming deadlines or scheduled exams.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <Modal
          isOpen={Boolean(selectedDay)}
          onClose={() => setSelectedDay(null)}
          title={`Events on ${selectedDay}`}
        >
          {dayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              No synchronized events on this date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {dayEvents.map(ev => {
                const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.custom;
                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-alt)',
                      borderLeft: `5px solid ${cfg.color}`,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {ev.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </AppLayout>
  );
}
