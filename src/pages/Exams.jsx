import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, EmptyState, LoadingState, DemoBanner, Modal, ConfirmDialog, SectionHeader } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';

const EXAM_TYPES = ['Internal/Mid Exam', 'Semester Exam', 'Quiz', 'Viva/Practical', 'Other'];
const SUBJECTS = ['Data Structures & Algorithms', 'Database Management Systems', 'Java OOP', 'Machine Learning', 'Computer Networks', 'Engineering Mathematics', 'Professional Ethics', 'All Subjects'];

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function urgencyColor(days) {
  if (days < 0) return 'var(--color-error)';
  if (days <= 3) return 'var(--color-error)';
  if (days <= 7) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function ExamForm({ onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ name: '', type: 'Internal/Mid Exam', date: '', subjects: [], syllabus: '' });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.date) return;
    const days = daysUntil(form.date);
    onSave({ ...form, daysRemaining: days, prepProgress: 0 });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="exam-name" className="form-label">Exam Name *</label>
        <input id="exam-name" type="text" className="form-input" placeholder="e.g., Internal Assessment I — DSA" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
      </div>
      <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="exam-type" className="form-label">Exam Type</label>
          <select id="exam-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="exam-date" className="form-label">Date *</label>
          <input id="exam-date" type="date" className="form-input" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="exam-syllabus" className="form-label">Syllabus / Topics</label>
        <textarea id="exam-syllabus" className="form-textarea" placeholder="Units / topics covered in this exam" value={form.syllabus} onChange={e => setForm(f => ({ ...f, syllabus: e.target.value }))} rows={2} />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" id="save-exam-btn">Add Exam</button>
      </div>
    </form>
  );
}

export default function Exams() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const e = await dataService.getExams(user.userId);
    setExams(e.sort((a, b) => a.date.localeCompare(b.date)));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(exam) {
    await dataService.saveExam(user.userId, exam);
    setAddOpen(false);
    await load();
    showToast('Exam added!', 'success');
  }

  async function handleDelete() {
    await dataService.deleteExam(user.userId, deleteId);
    setDeleteId(null);
    await load();
    showToast('Exam removed.', 'info');
  }

  async function updatePrepProgress(examId, progress) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    await dataService.saveExam(user.userId, { ...exam, prepProgress: parseInt(progress) });
    await load();
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = exams.filter(e => e.date >= today);
  const past = exams.filter(e => e.date < today);

  return (
    <AppLayout pageTitle="Exams">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader
        title="Exam Planner 📝"
        subtitle="Track upcoming exams and preparation progress"
        action={
          <button className="btn btn-primary" onClick={() => setAddOpen(true)} id="add-exam-btn">
            <Plus size={16} /> Add Exam
          </button>
        }
      />

      {loading ? <LoadingState text="Loading exams..." /> : (
        <>
          {/* Upcoming */}
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            📅 Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming exams" description="Add your exam schedule to track preparation" action={{ label: '+ Add Exam', onClick: () => setAddOpen(true) }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              {upcoming.map(exam => {
                const days = daysUntil(exam.date);
                const isExpanded = expandedId === exam.id;
                return (
                  <Card key={exam.id} style={{ borderLeft: `4px solid ${urgencyColor(days)}` }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                          <h3 style={{ fontWeight: 700 }}>{exam.name}</h3>
                          <Badge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'success'}>
                            {days === 0 ? 'Today!' : days < 0 ? `${Math.abs(days)}d ago` : `${days} days away`}
                          </Badge>
                          <Badge variant="muted">{exam.type}</Badge>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                          <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{exam.date}
                        </div>

                        {/* Prep progress */}
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 4 }}>
                            <span>Preparation Progress</span>
                            <span style={{ color: 'var(--color-primary)' }}>{exam.prepProgress || 0}%</span>
                          </div>
                          <ProgressBar value={exam.prepProgress || 0} variant={exam.prepProgress >= 80 ? 'success' : exam.prepProgress >= 40 ? 'primary' : 'warning'} />
                        </div>

                        {/* Update progress */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <label htmlFor={`prep-${exam.id}`} style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Update prep %:</label>
                            <input
                              id={`prep-${exam.id}`}
                              type="number" min="0" max="100"
                              defaultValue={exam.prepProgress || 0}
                              style={{ width: 60, padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                              onBlur={e => updatePrepProgress(exam.id, e.target.value)}
                            />
                          </div>
                          <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(isExpanded ? null : exam.id)}>
                            {isExpanded ? 'Less ▲' : 'Details ▼'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(exam.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {isExpanded && exam.syllabus && (
                          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                            <strong>Syllabus:</strong> {exam.syllabus}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                📁 Past ({past.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', opacity: 0.7 }}>
                {past.map(exam => (
                  <Card key={exam.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{exam.name}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-3)' }}>{exam.date}</span>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(exam.id)}><Trash2 size={12} /></button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Exam">
        <ExamForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Remove Exam" message="Remove this exam from your planner?" confirmLabel="Remove" danger />
    </AppLayout>
  );
}
