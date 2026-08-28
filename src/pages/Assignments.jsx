import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, Tabs, EmptyState, LoadingState, DemoBanner, Modal, ConfirmDialog, PriorityIndicator, SectionHeader } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { calculatePriorityScore, sortByPriority } from '../services/priorityEngine.js';

const SUBJECTS = ['Data Structures & Algorithms', 'Database Management Systems', 'Java OOP', 'Machine Learning', 'Computer Networks', 'Engineering Mathematics', 'Professional Ethics', 'Other'];

function AssignmentForm({ onSave, onClose }) {
  const [form, setForm] = useState({ title: '', subject: '', difficulty: 3, estimatedHours: 2, deadline: '', importance: 3, notes: '' });
  const [preview, setPreview] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  function handleChange(field, value) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (updated.deadline) {
      setPreview(calculatePriorityScore(updated));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.deadline) return;
    const priority = calculatePriorityScore(form);
    onSave({ ...form, status: 'pending', priorityScore: priority.score, priorityCategory: priority.category });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="assign-title" className="form-label">Assignment Title *</label>
        <input id="assign-title" type="text" className="form-input" placeholder="e.g., DBMS Lab — ER Diagrams" value={form.title} onChange={e => handleChange('title', e.target.value)} required autoFocus />
      </div>
      <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="assign-subject" className="form-label">Subject</label>
          <select id="assign-subject" className="form-select" value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
            <option value="">Select subject</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="assign-deadline" className="form-label">Deadline *</label>
          <input id="assign-deadline" type="date" className="form-input" min={today} value={form.deadline} onChange={e => handleChange('deadline', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="assign-difficulty" className="form-label">Difficulty (1–5)</label>
          <input id="assign-difficulty" type="number" className="form-input" min={1} max={5} value={form.difficulty} onChange={e => handleChange('difficulty', parseInt(e.target.value))} />
        </div>
        <div className="form-group">
          <label htmlFor="assign-hours" className="form-label">Est. Hours</label>
          <input id="assign-hours" type="number" className="form-input" min={0.5} step={0.5} value={form.estimatedHours} onChange={e => handleChange('estimatedHours', parseFloat(e.target.value))} />
        </div>
        <div className="form-group">
          <label htmlFor="assign-importance" className="form-label">Importance (1–5)</label>
          <input id="assign-importance" type="number" className="form-input" min={1} max={5} value={form.importance} onChange={e => handleChange('importance', parseInt(e.target.value))} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="assign-notes" className="form-label">Notes (optional)</label>
        <textarea id="assign-notes" className="form-textarea" placeholder="Assignment requirements..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
      </div>

      {preview && (
        <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>PRIORITY PREVIEW</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <PriorityIndicator category={preview.category} />
            <span style={{ fontWeight: 700 }}>{preview.score}/100</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>({preview.urgencyDays < 0 ? 'OVERDUE' : `${preview.urgencyDays} days away`})</span>
          </div>
        </div>
      )}

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" id="save-assignment-btn">Add Assignment</button>
      </div>
    </form>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [tab, setTab] = useState('all');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const a = await dataService.getAssignments(user.userId);
    setAssignments(a);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(assignment) {
    await dataService.saveAssignment(user.userId, assignment);
    setAddOpen(false);
    await load();
    showToast('✅ Assignment added successfully!', 'success');
  }

  async function handleComplete(id) {
    await dataService.completeAssignment(user.userId, id);
    await load();
    showToast('Assignment marked complete!', 'success');
  }

  async function handleDelete() {
    await dataService.deleteAssignment(user.userId, deleteId);
    setDeleteId(null);
    await load();
    showToast('Assignment deleted.', 'info');
  }

  const today = new Date().toISOString().split('T')[0];
  const pending = sortByPriority(assignments.filter(a => a.status === 'pending' && a.deadline >= today));
  const overdue = sortByPriority(assignments.filter(a => a.status !== 'completed' && a.deadline < today));
  const completed = assignments.filter(a => a.status === 'completed');

  const filtered = tab === 'all' ? [...overdue, ...pending] : tab === 'completed' ? completed : overdue;

  const TABS = [
    { id: 'all', label: '📋 All Active', count: pending.length + overdue.length },
    { id: 'overdue', label: '🚨 Overdue', count: overdue.length },
    { id: 'completed', label: '✅ Completed', count: completed.length },
  ];

  return (
    <AppLayout pageTitle="Assignments">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader
        title="Smart Assignments"
        subtitle="AI-powered priority scoring based on deadline, difficulty, and importance"
        action={
          <button className="btn btn-primary" onClick={() => setAddOpen(true)} id="add-assignment-btn">
            <Plus size={16} /> Add Assignment
          </button>
        }
      />

      {/* Priority explanation */}
      <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        📊 <strong>Priority Score</strong> = Deadline Urgency (40%) + Difficulty (25%) + Importance (20%) + Workload (15%) — sorted from highest to lowest
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 'var(--space-6)' }}>
        {loading ? <LoadingState text="Loading assignments..." /> :
          filtered.length === 0 ? (
            <EmptyState
              icon="📝"
              title={tab === 'completed' ? 'No completed assignments' : tab === 'overdue' ? 'No overdue assignments! 🎉' : 'No assignments yet'}
              description={tab === 'all' ? 'Add your first assignment to start tracking.' : undefined}
              action={tab === 'all' ? { label: '+ Add Assignment', onClick: () => setAddOpen(true) } : undefined}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filtered.map(a => {
                const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const isOverdue = a.deadline < today && a.status !== 'completed';
                return (
                  <Card key={a.id} style={{ borderLeft: `4px solid ${a.priorityCategory === 'HIGH' ? 'var(--color-high)' : a.priorityCategory === 'MEDIUM' ? 'var(--color-medium)' : 'var(--color-low)'}` }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                          <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{a.title}</h3>
                          {a.status !== 'completed' && <PriorityIndicator category={a.priorityCategory} />}
                          {a.status === 'completed' && <Badge variant="success">✅ Completed</Badge>}
                          {isOverdue && <Badge variant="error">⚠️ OVERDUE</Badge>}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                          <span>📘 {a.subject || 'No subject'}</span>
                          <span>📅 Due: {a.deadline} {!isOverdue && a.status !== 'completed' ? `(${daysLeft}d)` : ''}</span>
                          <span>⏱ ~{a.estimatedHours}h</span>
                          <span>⚡ Difficulty: {a.difficulty}/5</span>
                          {a.status !== 'completed' && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Score: {a.priorityScore}/100</span>}
                        </div>
                        {a.notes && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{a.notes}</p>}

                        {a.status !== 'completed' && (
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleComplete(a.id)} id={`complete-assign-${a.id}`}>
                              <CheckCircle size={14} /> Mark Complete
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(a.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        }
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Assignment" size="lg">
        <AssignmentForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </AppLayout>
  );
}
