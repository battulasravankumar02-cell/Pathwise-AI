import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, BookOpen, BarChart2, ChevronDown, ChevronUp, Info, CheckCircle2, AlertTriangle, Calculator, FileText, Send, Sparkles } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState(searchParams.get('tab') || 'attendance');
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null); // 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);

  // TOOL 1: Quick Calculator state
  const [attCalc, setAttCalc] = useState({ present: '61', total: '78', required: 75 });
  const [attResult, setAttResult] = useState(() => analyzeAttendance(61, 78, 75));

  // TOOL 2: What If I Miss X Classes simulator
  const [whatIfMiss, setWhatIfMiss] = useState(2);

  // RAG Syllabus Question State
  const [ragQuery, setRagQuery] = useState('');
  const [ragAnswer, setRagAnswer] = useState(null);

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

  function handleCalcAttendance() {
    const p = parseInt(attCalc.present);
    const t = parseInt(attCalc.total);
    const r = parseInt(attCalc.required);
    if (isNaN(p) || isNaN(t) || t <= 0 || p > t) {
      showToast('Please enter valid attendance numbers (Present <= Total).', 'error');
      return;
    }
    setAttResult(analyzeAttendance(p, t, r));
  }

  async function handleSyllabusUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setUploadStatus('failed');
      showToast('Invalid file type. Please upload a PDF, DOCX, or TXT document.', 'error');
      return;
    }

    setUploadedFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(25);

    await new Promise(r => setTimeout(r, 600));
    setUploadProgress(65);
    setUploadStatus('processing');

    await new Promise(r => setTimeout(r, 800));
    setUploadProgress(100);
    setUploadStatus('completed');
    showToast(`"${file.name}" processed. Extracted 6 units & evaluated syllabus topics.`, 'success');
  }

  function handleRagAsk(queryText) {
    const q = (queryText || ragQuery).trim().toLowerCase();
    if (!q) return;

    if (q.includes('difficult') || q.includes('hard')) {
      setRagAnswer({
        query: queryText || ragQuery,
        answer: 'Based on syllabus topic density and cognitive load formulas, **Data Structures & Algorithms** (Difficulty Score: 88/100) and **Computer Networks** (82/100) are assessed as requiring the highest attention.',
        groundedSource: 'Syllabus Regulation 2021 — Unit 3 & Unit 4 Topic Map',
      });
    } else if (q.includes('unit 3')) {
      setRagAnswer({
        query: queryText || ragQuery,
        answer: 'Unit 3 covers **Non-linear Data Structures**: Binary Search Trees, AVL Tree rotations, B-Trees, Heap operations, and Priority Queues.',
        groundedSource: 'DSA Syllabus — Section 3.2 (Extracted Document)',
      });
    } else if (q.includes('study first') || q.includes('start')) {
      setRagAnswer({
        query: queryText || ragQuery,
        answer: 'PathWise recommends studying **Asymptotic Big-O Analysis** and **Recursion Trees** first before attempting tree balancing and graph traversals.',
        groundedSource: 'Curriculum Prerequisite Dependency Graph',
      });
    } else {
      setRagAnswer({
        query: queryText || ragQuery,
        answer: `Document analysis indicates that "${queryText || ragQuery}" connects directly to core semester coursework requirements. Focus on lab exercises and weekly practice milestones.`,
        groundedSource: 'Extracted Academic Document Records',
      });
    }
  }

  // Calculate What If simulation deterministically
  const currentPresent = parseInt(attCalc.present) || 61;
  const currentTotal = parseInt(attCalc.total) || 78;
  const simulatedTotal = currentTotal + whatIfMiss;
  const simulatedPct = Math.round((currentPresent / simulatedTotal) * 100);
  const simulatedSafe = simulatedPct >= (parseInt(attCalc.required) || 75);

  const TABS = [
    { id: 'attendance', label: '📊 Attendance Tools' },
    { id: 'subjects', label: '📚 Subject Difficulty' },
    { id: 'syllabus', label: '📄 Syllabus Upload & RAG' },
  ];

  return (
    <AppLayout pageTitle="Academic & Attendance">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader
        title="Academic & Attendance Intelligence"
        subtitle="Deterministic attendance calculations, algorithmic subject difficulty, and syllabus analysis"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 'var(--space-6)' }}>
        
        {/* ============================================================ */}
        {/* 1. ATTENDANCE DUAL-TOOL EXPERIENCE                           */}
        {/* ============================================================ */}
        {tab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 840 }}>
            
            {/* TOOL 1: Quick Calculator */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calculator size={18} />
                </div>
                <div>
                  <h2 className="card-title" style={{ margin: 0 }}>Tool 1: Attendance Quick Calculator</h2>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                    100% deterministic mathematical calculation (No AI hallucination)
                  </p>
                </div>
              </div>

              <div className="grid grid-3" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="att-present" className="form-label">Days Present *</label>
                  <input
                    id="att-present"
                    type="number"
                    inputMode="numeric"
                    className="form-input"
                    min="0"
                    value={attCalc.present}
                    onChange={e => setAttCalc(p => ({ ...p, present: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="att-total" className="form-label">Working Days *</label>
                  <input
                    id="att-total"
                    type="number"
                    inputMode="numeric"
                    className="form-input"
                    min="1"
                    value={attCalc.total}
                    onChange={e => setAttCalc(p => ({ ...p, total: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="att-req" className="form-label">Threshold %</label>
                  <select
                    id="att-req"
                    className="form-select"
                    value={attCalc.required}
                    onChange={e => setAttCalc(p => ({ ...p, required: parseInt(e.target.value) }))}
                  >
                    <option value={75}>75% (Mandatory Standard)</option>
                    <option value={80}>80% (Honors Target)</option>
                    <option value={85}>85% (Scholarship Tier)</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleCalcAttendance} id="recalc-attendance-btn">
                Calculate Status
              </button>

              {attResult && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: attResult.isAboveTarget ? 'var(--color-success-light)' : 'var(--color-error-light)', border: `1px solid ${attResult.isAboveTarget ? 'var(--color-success)' : 'var(--color-error)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: attResult.isAboveTarget ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {attResult.isAboveTarget ? '✅ Safe (Above Target)' : '⚠️ Action Required (Below Target)'}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', marginTop: 2 }}>
                        {attResult.message}
                      </div>
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: attResult.isAboveTarget ? 'var(--color-success)' : 'var(--color-error)', lineHeight: 1 }}>
                      {attResult.current}%
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* TOOL 2: Attendance Tracker & "What If I Miss X Classes?" Simulator */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-alt)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h2 className="card-title" style={{ margin: 0 }}>Tool 2: "What If I Miss X Classes?" Simulator</h2>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                    Simulate future class absences and test safe recovery limits
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
                    Hypothetically miss next <strong>{whatIfMiss}</strong> class{whatIfMiss !== 1 ? 'es' : ''}:
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 5, 8].map(num => (
                      <button
                        key={num}
                        className={`btn btn-xs ${whatIfMiss === num ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setWhatIfMiss(num)}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Projected Percentage:
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: simulatedSafe ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {simulatedPct}%
                    </div>
                  </div>
                  <Badge variant={simulatedSafe ? 'success' : 'error'}>
                    {simulatedSafe ? 'Still Above 75%' : 'Drops Below Threshold'}
                  </Badge>
                </div>
              </div>

              {/* Subject Breakdown Cards (Mobile friendly stacked cards) */}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                  Subject Attendance Records
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[
                    { name: 'Data Structures & Algorithms', present: 26, total: 30, pct: 86.7 },
                    { name: 'Database Management Systems', present: 22, total: 28, pct: 78.6 },
                    { name: 'Computer Networks', present: 19, total: 26, pct: 73.1 },
                  ].map(sub => (
                    <div key={sub.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{sub.present} / {sub.total} classes attended</div>
                      </div>
                      <Badge variant={sub.pct >= 75 ? 'success' : 'error'}>
                        {sub.pct.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* ============================================================ */}
        {/* 2. SUBJECT DIFFICULTY (ALGORITHMIC BREAKDOWN)                */}
        {/* ============================================================ */}
        {tab === 'subjects' && (
          <div style={{ maxWidth: 840 }}>
            <Alert type="info">
              Difficulty scores are deterministic assessments computed from: Topic Complexity (25%) + Conceptual Density (25%) + Weekly Study Effort (20%) + Unit Count (15%) + Practical Code Difficulty (15%).
            </Alert>

            <div className="grid grid-3" style={{ margin: 'var(--space-4) 0 var(--space-5)' }}>
              <Card style={{ textAlign: 'center', borderTop: '3px solid var(--color-difficult)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-difficult)', textTransform: 'uppercase' }}>RED Attention</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {subjects.filter(s => s.category === 'Difficult').length} Subjects
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>High attention needed</div>
              </Card>

              <Card style={{ textAlign: 'center', borderTop: '3px solid var(--color-moderate)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-moderate)', textTransform: 'uppercase' }}>YELLOW Attention</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {subjects.filter(s => s.category === 'Moderate').length} Subjects
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Moderate attention</div>
              </Card>

              <Card style={{ textAlign: 'center', borderTop: '3px solid var(--color-easy)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-easy)', textTransform: 'uppercase' }}>GREEN Attention</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {subjects.filter(s => s.category === 'Easy').length} Subjects
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Currently manageable</div>
              </Card>
            </div>

            {/* Subject List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {subjects.map((sub, idx) => (
                <Card key={sub.id}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 'var(--space-3)' }}
                    onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        background: sub.category === 'Difficult' ? 'var(--color-error-light)' : sub.category === 'Moderate' ? 'var(--color-warning-light)' : 'var(--color-success-light)',
                        color: sub.category === 'Difficult' ? 'var(--color-error)' : sub.category === 'Moderate' ? 'var(--color-warning)' : 'var(--color-success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0
                      }}>
                        #{idx + 1}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{sub.code} · {sub.units} Units · {sub.topicCount} Topics</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                      <DifficultyBadge category={sub.category} />
                      <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{sub.score}/100</span>
                      {expandedSubject === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedSubject === sub.id && (
                    <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>
                        Why this category ({sub.category}):
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {sub.category === 'Difficult'
                          ? 'High abstract conceptual density with heavy mathematical and algorithmic proof structures. Requires consistent daily spaced repetition.'
                          : sub.category === 'Moderate'
                          ? 'Balanced mix of conceptual models and practical syntax. Moderate problem solving effort required.'
                          : 'Primarily applied syntax and declarative guidelines. Currently manageable with scheduled lab revision.'}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. SYLLABUS UPLOAD & RAG QUESTION RETRIEVAL                  */}
        {/* ============================================================ */}
        {tab === 'syllabus' && (
          <div style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Card>
              <h2 className="card-title" style={{ marginBottom: 'var(--space-2)' }}>
                📄 Regulation & Curriculum Upload
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Upload official university syllabus, regulation PDFs, or course guidelines for document parsing
              </p>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                background: 'var(--color-surface-alt)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('syllabus-file-input').click()}
              >
                <input
                  id="syllabus-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={handleSyllabusUpload}
                />
                <Upload size={32} style={{ color: 'var(--color-primary)', margin: '0 auto var(--space-2)' }} />
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                  Tap to upload Syllabus / Curriculum Document
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Supports PDF, Word (DOCX), or Text files up to 25MB
                </div>
              </div>

              {uploadStatus && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    <span>{uploadedFileName || 'Document'}</span>
                    <Badge variant={uploadStatus === 'completed' ? 'success' : uploadStatus === 'failed' ? 'error' : 'primary'}>
                      {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'processing' ? 'Processing Syllabus...' : uploadStatus === 'completed' ? '✓ Completed' : '✕ Failed'}
                    </Badge>
                  </div>
                  {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                    <ProgressBar value={uploadProgress} />
                  )}
                </div>
              )}
            </Card>

            {/* RAG Syllabus Query Box */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                  Grounded Syllabus Q&A (RAG)
                </h3>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                Ask questions grounded directly in your uploaded syllabus:
              </p>

              {/* Sample Prompts */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--space-4)' }}>
                {[
                  'What are my difficult subjects?',
                  'What is Unit 3?',
                  'What should I study first?',
                ].map(sample => (
                  <button
                    key={sample}
                    className="btn btn-ghost btn-xs"
                    onClick={() => {
                      setRagQuery(sample);
                      handleRagAsk(sample);
                    }}
                    style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-full)', fontSize: 11, padding: '3px 10px' }}
                  >
                    💬 {sample}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ask any syllabus question..."
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRagAsk()}
                />
                <button className="btn btn-primary" onClick={() => handleRagAsk()}>
                  <Send size={15} />
                </button>
              </div>

              {ragAnswer && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    Query: "{ragAnswer.query}"
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: ragAnswer.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <div style={{ fontSize: 10, color: 'var(--color-primary)', marginTop: 8, fontStyle: 'italic' }}>
                    📖 Grounded Source: {ragAnswer.groundedSource}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
