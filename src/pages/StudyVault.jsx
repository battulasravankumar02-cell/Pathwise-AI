import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Trash2, ExternalLink, BookOpen, Download,
  Sparkles, FileText, CheckCircle, Award, Eye, UploadCloud, X
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, EmptyState, LoadingState, Modal, ConfirmDialog, SectionHeader, Alert } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { analyzeStudyResource } from '../services/aiService.js';

const CATEGORIES = ['PDF Document', 'Notes', 'Cheatsheet', 'Practice', 'Article', 'Book', 'Course', 'Other'];
const SUBJECTS = ['Python', 'DSA', 'DBMS', 'Machine Learning', 'Computer Networks', 'Mathematics', 'Other'];

const CATEGORY_ICONS = {
  'PDF Document': '📄', Notes: '📝', Cheatsheet: '📋', Practice: '💻',
  Article: '📰', Book: '📚', Course: '🎓', Other: '📌',
};

function ResourceUploadForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    url: '',
    type: 'PDF Document',
    subject: 'Python',
    notes: '',
    fileSize: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setForm(f => ({
      ...f,
      title: f.title || file.name.replace(/\.[^/.]+$/, ''),
      fileSize: `${sizeMb} MB`,
      type: file.type.includes('pdf') ? 'PDF Document' : 'Notes',
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return;
    onSave({
      ...form,
      fileName: selectedFile?.name || `${form.title}.pdf`,
      storagePath: selectedFile ? `vault/${Date.now()}_${selectedFile.name}` : null,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* File Upload Drop Area */}
      <div
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'center',
          background: 'var(--color-surface-alt)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <UploadCloud size={32} style={{ color: 'var(--color-primary)', margin: '0 auto var(--space-2)' }} />
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 2 }}>
          {selectedFile ? `Selected: ${selectedFile.name} (${form.fileSize})` : 'Choose learning resource file (PDF, TXT, DOCX)'}
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          Files will be securely stored and analyzed for important topics & quiz generation
        </p>
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
          <Plus size={14} /> Browse File
          <input type="file" accept=".pdf,.doc,.docx,.txt,.md" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="vault-title" className="form-label">Resource Title *</label>
        <input
          id="vault-title"
          type="text"
          className="form-input"
          placeholder="e.g., Python Fundamentals & OOP Guide"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label htmlFor="vault-type" className="form-label">Resource Type</label>
          <select id="vault-type" className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="vault-subject" className="form-label">Associated Subject</label>
          <select id="vault-subject" className="form-select" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="vault-url" className="form-label">External Reference Link (optional)</label>
        <input
          id="vault-url"
          type="url"
          className="form-input"
          placeholder="https://..."
          value={form.url}
          onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="vault-notes" className="form-label">Key Takeaways / Notes (optional)</label>
        <textarea
          id="vault-notes"
          className="form-textarea"
          placeholder="What concepts does this resource cover?"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" id="save-vault-resource-btn">
          Save & Ingest Resource
        </button>
      </div>
    </form>
  );
}

export default function StudyVault() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [analyzingResource, setAnalyzingResource] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const r = await dataService.getStudyVaultResources(user.userId);
    setResources(r);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(resource) {
    await dataService.saveStudyVaultResource(user.userId, resource);
    setAddOpen(false);
    await load();
    showToast('✅ Resource saved to Study Vault!', 'success');
  }

  async function handleDelete() {
    await dataService.deleteStudyVaultResource(user.userId, deleteId);
    setDeleteId(null);
    await load();
    showToast('Resource deleted from vault and storage.', 'info');
  }

  function handleDownload(resource) {
    const textContent = `# ${resource.title}\nSubject: ${resource.subject || 'General'}\nType: ${resource.type}\nSaved Date: ${resource.savedAt || 'Today'}\n\nNotes & Takeaways:\n${resource.notes || 'No extra notes recorded.'}\n\nPathWise AI Study Vault Resource\n"Forge Your Skills. Build Your Future."`;
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`📥 Downloading "${resource.title}"`, 'success');
  }

  function handleOpenAnalysis(resource) {
    const analysis = analyzeStudyResource(resource);
    setAnalyzingResource(resource);
    setAnalysisResult(analysis);
  }

  function handleStartQuizFromResource(resource) {
    navigate('/skill-quiz', { state: { selectedResource: resource, autoMode: 'resource' } });
  }

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.subject?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !filterSubject || r.subject === filterSubject;
    const matchType = !filterType || r.type === filterType;
    return matchSearch && matchSubject && matchType;
  });

  const subjects = [...new Set(resources.map(r => r.subject).filter(Boolean))];
  const types = [...new Set(resources.map(r => r.type).filter(Boolean))];

  return (
    <AppLayout pageTitle="Study Vault">
      <SectionHeader
        title="Study Vault 📁"
        subtitle="Manage, download, and analyze your learning materials with grounded AI"
        action={
          <button className="btn btn-primary" onClick={() => setAddOpen(true)} id="add-vault-resource-btn">
            <Plus size={16} /> Upload Resource
          </button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--color-primary)' }}>{resources.length}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Total Vault Items</div>
        </div>
        {Object.entries(CATEGORY_ICONS).slice(0, 3).map(([type, icon]) => {
          const count = resources.filter(r => r.type === type).length;
          return (
            <div key={type} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{icon} {count}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{type}</div>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search vault documents, subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
            id="vault-search-input"
            aria-label="Search study vault"
          />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)} aria-label="Filter by subject">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)} aria-label="Filter by type">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{CATEGORY_ICONS[t] || '📌'} {t}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingState text="Loading your study vault..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📁"
          title={search || filterSubject || filterType ? 'No matching resources found' : 'Your Study Vault is empty'}
          description={search || filterSubject || filterType ? 'Try adjusting your filters or search terms' : 'Upload your first study document or syllabus note to enable AI document analysis and quiz generation.'}
          action={!search && !filterSubject && !filterType ? { label: '+ Upload First Resource', onClick: () => setAddOpen(true) } : undefined}
        />
      ) : (
        <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
          {filtered.map(r => (
            <Card key={r.id} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 30, flexShrink: 0 }}>{CATEGORY_ICONS[r.type] || '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge variant="muted">{r.type || 'Document'}</Badge>
                      {r.subject && <Badge variant="primary">{r.subject}</Badge>}
                      {r.fileSize && <Badge variant="muted">{r.fileSize}</Badge>}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => setDeleteId(r.id)}
                  style={{ color: 'var(--color-error)' }}
                  title="Delete resource"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {r.notes && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                  {r.notes}
                </p>
              )}

              {/* Action Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-3)' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                  Saved {r.savedAt || 'Recently'}
                </span>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenAnalysis(r)}
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Sparkles size={13} /> ⭐ Analyze
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStartQuizFromResource(r)}
                  >
                    <Award size={13} /> Quiz
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDownload(r)}
                    title="Download resource file"
                  >
                    <Download size={13} />
                  </button>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      title="Open external link"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Upload to Study Vault" size="lg">
        <ResourceUploadForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
      </Modal>

      {/* AI Document Analysis Modal */}
      {analysisResult && (
        <Modal
          isOpen={Boolean(analysisResult)}
          onClose={() => { setAnalysisResult(null); setAnalyzingResource(null); }}
          title={`⭐ Document Analysis: ${analyzingResource?.title}`}
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setAnalysisResult(null); setAnalyzingResource(null); }}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => { const res = analyzingResource; setAnalysisResult(null); handleStartQuizFromResource(res); }}>
                <Award size={16} /> Generate Quiz from this Resource →
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Alert type="info">
              Analysis is grounded strictly in the material and curriculum concepts of <strong>{analyzingResource?.title}</strong>.
            </Alert>

            {/* Important Topics */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                <Sparkles size={16} /> ⭐ Important Topics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {analysisResult.importantTopics.map((topic, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', padding: '6px 10px', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 11 }}>{idx + 1}.</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Concepts */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                <BookOpen size={16} /> ⭐ Important Concepts & Core Rules
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {analysisResult.importantConcepts.map((item, idx) => (
                  <div key={idx} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                      {item.concept}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Questions */}
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                <CheckCircle size={16} /> ⭐ Important Practice Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {analysisResult.importantQuestions.map((q, idx) => (
                  <div key={idx} style={{ padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                      <Badge variant="muted">{q.type}</Badge>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Question {idx + 1}</span>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', margin: 0, fontWeight: 600 }}>
                      {q.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Resource"
        message="Are you sure you want to permanently delete this resource from your Study Vault and cloud storage?"
        confirmLabel="Delete Resource"
        danger
      />
    </AppLayout>
  );
}

