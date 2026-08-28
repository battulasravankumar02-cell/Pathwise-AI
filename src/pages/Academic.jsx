import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, BarChart2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, DifficultyBadge, Tabs, EmptyState, LoadingState, DemoBanner, Alert, SectionHeader } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { rankSubjectsByDifficulty } from '../services/difficultyEngine.js';
import { analyzeAttendance } from '../services/attendanceCalc.js';

export default function Academic() {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [tab, setTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Attendance calculator state
  const [attCalc, setAttCalc] = useState({ present: '', total: '', required: 75 });
  const [attResult, setAttResult] = useState(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [subs, att] = await Promise.all([
        dataService.getSubjects(user.userId),
        dataService.getAttendance(user.userId),
      ]);
      setSubjects(rankSubjectsByDifficulty(subs));
      setAttendance(att);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSyllabusUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      showToast('Invalid file type. Please upload PDF, DOCX, or TXT.', 'error');
      return;
    }
    setUploadLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setUploadLoading(false);
    showToast(`"${file.name}" uploaded successfully. Subject extraction complete (demo mode).`, 'success');
    e.target.value = '';
  }

  function calcAttendance() {
    const p = parseInt(attCalc.present);
    const t = parseInt(attCalc.total);
    const r = parseInt(attCalc.required);
    if (isNaN(p) || isNaN(t) || t <= 0 || p > t) {
      showToast('Please enter valid attendance values.', 'error');
      return;
    }
    setAttResult(analyzeAttendance(p, t, r));
  }

  const TABS = [
    { id: 'subjects', label: 'Subjects & Difficulty' },
    { id: 'upload', label: 'Syllabus Upload' },
    { id: 'attendance', label: 'Attendance Calculator' },
  ];

  return (
    <AppLayout pageTitle="Academic">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader
        title="Academic Module"
        subtitle="Syllabus analysis, subject difficulty, and attendance tracking"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 'var(--space-6)' }}>

        {/* ===== SUBJECTS TAB ===== */}
        {tab === 'subjects' && (
          loading ? <LoadingState text="Loading subjects..." /> :
          subjects.length === 0 ? (
            <EmptyState icon="📚" title="No subjects loaded" description="Upload your syllabus to extract and analyze subjects" action={{ label: 'Upload Syllabus', onClick: () => setTab('upload') }} />
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                  { label: '📘 Total Subjects', value: subjects.length },
                  { label: '🔴 Difficult', value: subjects.filter(s => s.category === 'Difficult').length },
                  { label: '🟡 Moderate', value: subjects.filter(s => s.category === 'Moderate').length },
                ].map(s => (
                  <Card key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
                  </Card>
                ))}
              </div>

              <Alert type="info">
                Difficulty scores are calculated using a transparent formula: Topic Complexity (25%) + Study Effort (20%) + Conceptual Density (25%) + Unit Count (15%) + Practical Difficulty (15%). All scores are deterministic.
              </Alert>
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {subjects.map((sub, idx) => (
                  <Card key={sub.id}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }}
                      onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                      aria-expanded={expandedSubject === sub.id}
                    >
                      {/* Rank */}
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: idx === 0 ? 'var(--color-error-light)' : idx === 1 ? 'var(--color-warning-light)' : 'var(--color-surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--font-size-sm)', color: idx === 0 ? 'var(--color-error)' : idx === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                        #{idx + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: 2 }}>{sub.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{sub.code} · {sub.units} Units · {sub.topicCount} Topics</div>
                      </div>

                      {/* Score bar */}
                      <div style={{ width: 140, display: 'none' }} className="score-bar-wrapper">
                        <ProgressBar value={sub.score} variant={sub.category === 'Difficult' ? 'error' : sub.category === 'Moderate' ? 'warning' : 'success'} size="sm" />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: sub.category === 'Difficult' ? 'var(--color-error)' : sub.category === 'Moderate' ? 'var(--color-warning)' : 'var(--color-success)' }}>{sub.score}/100</div>
                        <DifficultyBadge category={sub.category} />
                      </div>

                      {expandedSubject === sub.id ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
                    </div>

                    {expandedSubject === sub.id && (
                      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>{sub.reason}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                          {[
                            { label: 'Topic Complexity', value: sub.breakdown?.topicComplexity },
                            { label: 'Study Effort', value: sub.breakdown?.studyEffort },
                            { label: 'Conceptual Density', value: sub.breakdown?.conceptualDensity },
                            { label: 'Practical Difficulty', value: sub.breakdown?.practicalDifficulty },
                          ].map(m => (
                            <div key={m.label} style={{ padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</div>
                              <ProgressBar value={m.value} size="sm" />
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Subject Progress</div>
                          <ProgressBar value={sub.progress} showLabel label="Completed" />
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )
        )}

        {/* ===== UPLOAD TAB ===== */}
        {tab === 'upload' && (
          <div style={{ maxWidth: 600 }}>
            <Alert type="info" style={{ marginBottom: 'var(--space-6)' }}>
              Upload your regulation document or syllabus PDF. The system will extract subjects, units, and topics automatically. In the current demo, extraction uses pre-loaded data.
            </Alert>

            <Card style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-base)' }}>📄 Upload Syllabus / Regulation</h3>
              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-10)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                  background: 'var(--color-surface-alt)',
                }}
                onDragOver={e => e.preventDefault()}
              >
                <Upload size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-3)' }} />
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Drag & drop your file here</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Supports PDF, DOCX, TXT</div>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Choose File
                  <input type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={handleSyllabusUpload} id="syllabus-upload-input" />
                </label>
              </div>
              {uploadLoading && (
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <LoadingState text="Analyzing syllabus document..." />
                </div>
              )}
            </Card>

            <Card>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-base)' }}>📂 Uploaded Documents (Demo)</h3>
              {[
                { name: 'Regulation 2021 — B.Tech AI&DS.pdf', date: '2024-06-01', size: '1.2 MB', status: 'Processed' },
                { name: 'Semester 3 Syllabus.pdf', date: '2024-06-05', size: '820 KB', status: 'Processed' },
              ].map(doc => (
                <div key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{doc.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{doc.date} · {doc.size}</div>
                  </div>
                  <Badge variant="success">{doc.status}</Badge>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ===== ATTENDANCE CALCULATOR TAB ===== */}
        {tab === 'attendance' && (
          <div style={{ maxWidth: 640 }}>
            <Card style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>📊 Attendance Calculator</h3>
              <Alert type="info">All calculations use precise mathematical formulas. No AI is involved in this calculation.</Alert>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="att-present" className="form-label">Days Present *</label>
                    <input id="att-present" type="number" className="form-input" min="0" placeholder="e.g., 61" value={attCalc.present} onChange={e => setAttCalc(p => ({ ...p, present: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="att-total" className="form-label">Total Working Days *</label>
                    <input id="att-total" type="number" className="form-input" min="1" placeholder="e.g., 78" value={attCalc.total} onChange={e => setAttCalc(p => ({ ...p, total: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="att-required" className="form-label">Required %</label>
                    <select id="att-required" className="form-select" value={attCalc.required} onChange={e => setAttCalc(p => ({ ...p, required: parseInt(e.target.value) }))}>
                      <option value={75}>75%</option>
                      <option value={85}>85%</option>
                      <option value={90}>90%</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={calcAttendance} id="calc-attendance-btn">Calculate Attendance</button>
              </div>
            </Card>

            {attResult && (
              <Card>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Results</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: attResult.status === 'safe' ? 'var(--color-success)' : attResult.status === 'warning' ? 'var(--color-warning)' : 'var(--color-error)', lineHeight: 1 }}>{attResult.current}%</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>Current Attendance</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={attResult.current} variant={attResult.status === 'safe' ? 'success' : attResult.status === 'warning' ? 'warning' : 'error'} showLabel label={`Required: ${attResult.targetPct}%`} />
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: attResult.isAboveTarget ? 'var(--color-success-light)' : 'var(--color-error-light)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: attResult.isAboveTarget ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {attResult.isAboveTarget ? '✅ Above Required' : '⚠️ Below Required'}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>{attResult.message}</p>
                </div>

                <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  <strong>Formula used:</strong> {attResult.isAboveTarget
                    ? `Max days to miss = (present − target% × total) ÷ target% = (${attResult.present} − ${attResult.targetPct / 100} × ${attResult.total}) ÷ ${attResult.targetPct / 100} = ${attResult.daysInfo} days`
                    : `Days needed = (target% × total − present) ÷ (1 − target%) = (${attResult.targetPct / 100} × ${attResult.total} − ${attResult.present}) ÷ (1 − ${attResult.targetPct / 100}) = ${attResult.daysInfo} days`
                  }
                </div>
              </Card>
            )}

            {attendance && (
              <Card style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Subject-wise Attendance (Demo Data)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {attendance.subjects?.map(sub => (
                    <div key={sub.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginBottom: 4, fontWeight: 600 }}>
                        <span>{sub.name}</span>
                        <span style={{ color: sub.percentage < 75 ? 'var(--color-error)' : 'var(--color-success)' }}>{sub.percentage.toFixed(1)}%</span>
                      </div>
                      <ProgressBar value={sub.percentage} variant={sub.percentage >= 75 ? 'success' : 'error'} size="sm" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
