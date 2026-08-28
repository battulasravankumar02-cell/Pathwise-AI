import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award, CheckCircle, AlertCircle, RefreshCw, ChevronRight,
  BookOpen, BarChart2, Sparkles, Sliders, Layers, FileText
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, SectionHeader, Alert, Tabs, EmptyState, LoadingState } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { generateQuizFromResource, generateQuizFromLearnedSkills } from '../services/aiService.js';

export default function SkillQuiz() {
  const { user } = useAuth();
  const { showToast, refreshProfile, roadmap } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Mode Selection: 'learned_skills' (Mode 1) or 'uploaded_resources' (Mode 2)
  const [activeMode, setActiveMode] = useState(
    location.state?.autoMode === 'resource' ? 'uploaded_resources' : 'learned_skills'
  );

  // Configuration
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  // Vault Resources & Learned Skills Data
  const [vaultResources, setVaultResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(location.state?.selectedResource?.id || '');
  const [selectedSkillStep, setSelectedSkillStep] = useState('');

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load vault resources and quiz history
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [vault, attempts] = await Promise.all([
      dataService.getStudyVaultResources(user.userId),
      dataService.getQuizAttempts(user.userId),
    ]);
    setVaultResources(vault);
    setHistory(attempts || []);

    // If passed via navigation
    if (location.state?.selectedResource) {
      setSelectedResourceId(location.state.selectedResource.id);
    } else if (vault.length > 0) {
      setSelectedResourceId(vault[0].id);
    }

    if (roadmap?.steps && roadmap.steps.length > 0) {
      const activeOrDone = roadmap.steps.find(s => s.status === 'completed') || roadmap.steps[0];
      setSelectedSkillStep(activeOrDone.title);
    }

    setLoading(false);
  }, [user, location.state, roadmap]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate / Load Quiz based on current mode & selection
  const initializeQuiz = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);

    if (activeMode === 'uploaded_resources') {
      const res = vaultResources.find(r => r.id === selectedResourceId) || vaultResources[0];
      if (res) {
        const generated = generateQuizFromResource(res, { count: questionCount, difficulty });
        setActiveQuiz(generated);
      } else {
        setActiveQuiz(null);
      }
    } else {
      // Mode 1: Learned Skills
      const completedSteps = (roadmap?.steps || []).filter(s => s.status === 'completed' || s.status === 'active');
      const generated = generateQuizFromLearnedSkills(completedSteps, { count: questionCount, difficulty });
      if (selectedSkillStep) {
        generated.title = `Diagnostic: ${selectedSkillStep}`;
        generated.topic = selectedSkillStep;
      }
      setActiveQuiz(generated);
    }
  }, [activeMode, selectedResourceId, selectedSkillStep, questionCount, difficulty, vaultResources, roadmap]);

  useEffect(() => {
    if (!loading) {
      initializeQuiz();
    }
  }, [initializeQuiz, loading]);

  function handleSelectOption(qId, optionIdx) {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  }

  async function handleSubmitQuiz() {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions || [];
    let correctCount = 0;
    const topicBreakdown = {};

    questions.forEach(q => {
      const isCorrect = answers[q.id] === q.correct;
      if (isCorrect) correctCount++;
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[q.topic].total++;
      if (isCorrect) topicBreakdown[q.topic].correct++;
    });

    const scorePct = Math.round((correctCount / (questions.length || 1)) * 100);
    const strongTopics = Object.entries(topicBreakdown).filter(([, v]) => v.correct === v.total).map(([k]) => k);
    const weakTopics = Object.entries(topicBreakdown).filter(([, v]) => v.correct < v.total).map(([k]) => k);

    let recommendation = '';
    if (scorePct >= 80) {
      recommendation = `🏆 Outstanding mastery (${scorePct}%)! You demonstrate thorough comprehension of ${activeQuiz.topic}. Ready for advanced topics.`;
    } else if (scorePct >= 60) {
      recommendation = `✅ Good baseline grasp (${scorePct}%). Focus on reviewing: ${weakTopics.slice(0, 2).join(', ') || 'key edge cases'}.`;
    } else {
      recommendation = `📝 Dedicated revision recommended (${scorePct}%). Review your study notes for ${activeQuiz.topic} before reattempting.`;
    }

    const quizResult = {
      score: scorePct,
      correct: correctCount,
      total: questions.length,
      recommendation,
      strongTopics,
      weakTopics,
    };

    setResult(quizResult);
    setSubmitted(true);

    // Persist attempt to Supabase / Local storage
    await dataService.saveQuizAttempt(user.userId, {
      quizId: activeQuiz.id,
      topic: activeQuiz.topic || 'Diagnostic Quiz',
      score: scorePct,
      correct: correctCount,
      total: questions.length,
      recommendation,
      sourceType: activeMode,
    });

    // Refresh history and app context
    const updatedHistory = await dataService.getQuizAttempts(user.userId);
    setHistory(updatedHistory);
    refreshProfile();
    showToast(`Quiz completed! Score: ${scorePct}%`, scorePct >= 70 ? 'success' : 'info');
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = activeQuiz && answeredCount === (activeQuiz.questions?.length || 0);

  return (
    <AppLayout pageTitle="Skill Quiz">
      <SectionHeader
        title="Skill Quiz Diagnostic 🧠"
        subtitle="Validate your mastery with grounded dual-mode assessments and personalized recommendations"
      />

      {/* Mode Switcher Tabs */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Tabs
          tabs={[
            { id: 'learned_skills', label: '🧠 Mode 1: Skills I Learned', badge: 'Roadmap' },
            { id: 'uploaded_resources', label: '📚 Mode 2: My Uploaded Resources', badge: `${vaultResources.length} Files` },
          ]}
          activeTab={activeMode}
          onChange={tab => {
            setActiveMode(tab);
          }}
        />
      </div>

      <div className="grid grid-3" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left 2 Cols: Main Quiz Interface */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Controls & Configuration Bar */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  {activeMode === 'learned_skills' ? 'Mode 1: Learned Roadmap Skills' : 'Mode 2: Grounded Vault Documents'}
                </span>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: '2px 0 0' }}>
                  {activeQuiz?.title || 'Diagnostic Assessment'}
                </h3>
              </div>

              {/* Quiz Configuration Dropdowns */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  disabled={submitted}
                  aria-label="Question Count"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>

                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  disabled={submitted}
                  aria-label="Difficulty"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={initializeQuiz}
                  title="Reset / Generate new quiz"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Source Selection depending on Mode */}
            {activeMode === 'uploaded_resources' ? (
              vaultResources.length === 0 ? (
                <Alert type="info">
                  No uploaded resources found in your Study Vault. Upload notes or PDFs in the Study Vault tab to take grounded quizzes!
                </Alert>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <label htmlFor="select-vault-resource" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Select Resource:
                  </label>
                  <select
                    id="select-vault-resource"
                    className="form-select"
                    value={selectedResourceId}
                    onChange={e => setSelectedResourceId(e.target.value)}
                    disabled={submitted}
                  >
                    {vaultResources.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.subject || 'Core'})
                      </option>
                    ))}
                  </select>
                </div>
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <label htmlFor="select-learned-skill" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Target Stage:
                </label>
                <select
                  id="select-learned-skill"
                  className="form-select"
                  value={selectedSkillStep}
                  onChange={e => setSelectedSkillStep(e.target.value)}
                  disabled={submitted}
                >
                  {(roadmap?.steps || [{ title: 'Python Fundamentals' }, { title: 'Data Structures & Algorithms' }]).map(s => (
                    <option key={s.title} value={s.title}>
                      {s.title} ({s.status || 'active'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          {loading ? (
            <LoadingState text="Preparing your quiz assessment..." />
          ) : !activeQuiz || !activeQuiz.questions || activeQuiz.questions.length === 0 ? (
            <EmptyState
              icon="🧠"
              title="No questions available"
              description="Upload a resource or select a valid roadmap stage to generate quiz questions."
              action={activeMode === 'uploaded_resources' ? { label: 'Go to Study Vault', onClick: () => navigate('/study-vault') } : undefined}
            />
          ) : !submitted ? (
            /* Active Quiz Question Flow */
            <Card>
              {/* Progress Header */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  <span>Progress: {answeredCount} of {activeQuiz.questions.length} answered</span>
                  <span>{Math.round((answeredCount / activeQuiz.questions.length) * 100)}% Complete</span>
                </div>
                <ProgressBar value={(answeredCount / activeQuiz.questions.length) * 100} />
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {activeQuiz.questions.map((q, qIdx) => {
                  const selectedOption = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-primary)' }}>
                          Question {qIdx + 1} of {activeQuiz.questions.length}
                        </span>
                        {q.topic && <Badge variant="muted">{q.topic}</Badge>}
                      </div>

                      <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                        {q.question}
                      </p>

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          const letter = ['A', 'B', 'C', 'D'][optIdx];
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                background: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'var(--color-surface)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                                  color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                                  flexShrink: 0,
                                }}
                              >
                                {letter}
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: isSelected ? 700 : 500, color: 'var(--color-text-primary)' }}>
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Action */}
              <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmitQuiz}
                  disabled={!isComplete}
                  id="submit-skill-quiz-btn"
                >
                  <Award size={18} /> Submit Quiz & Analyze ({answeredCount}/{activeQuiz.questions.length})
                </button>
              </div>
            </Card>
          ) : (
            /* Results Panel */
            <Card>
              <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div style={{ fontSize: '3.8rem', fontWeight: 900, color: result.score >= 70 ? 'var(--color-success)' : 'var(--color-warning)', lineHeight: 1 }}>
                  {result.score}%
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginTop: 'var(--space-2)' }}>
                  {result.score >= 80 ? '🏆 Outstanding Mastery!' : result.score >= 70 ? '✅ Passed Benchmark!' : '📝 Revision Recommended'}
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: 500, margin: '8px auto 0' }}>
                  {result.recommendation}
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-5)' }}>
                  <button className="btn btn-secondary" onClick={initializeQuiz}>
                    <RefreshCw size={14} /> Retake Quiz
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('/analytics')}>
                    View Updated Analytics <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Detailed Review & Explanations */}
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-4)' }}>
                  Question Review & Grounded Explanations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {activeQuiz.questions.map((q, idx) => {
                    const userChoice = answers[q.id];
                    const isCorrect = userChoice === q.correct;
                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                          border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                          {isCorrect ? <CheckCircle size={18} color="var(--color-success)" /> : <AlertCircle size={18} color="var(--color-error)" />}
                          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Question {idx + 1}</span>
                          <Badge variant={isCorrect ? 'success' : 'error'}>{isCorrect ? 'Correct' : 'Incorrect'}</Badge>
                          {q.topic && <Badge variant="muted">{q.topic}</Badge>}
                        </div>

                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                          {q.question}
                        </div>

                        <div style={{ fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                          Your choice: <strong>{q.options[userChoice] || 'None'}</strong>
                        </div>

                        {!isCorrect && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 700, marginBottom: 4 }}>
                            Correct answer: {q.options[q.correct]}
                          </div>
                        )}

                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic' }}>
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Col: Diagnostics & Recent Attempts History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={16} className="text-primary" /> Diagnostic History
            </h3>
            {history.length === 0 ? (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
                No past quiz attempts yet. Complete your first diagnostic quiz to track your mastery trajectory.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {history.slice(0, 6).map(att => (
                  <div key={att.id} style={{ padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>
                        {att.topic}
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 'var(--font-size-sm)', color: att.score >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {att.score}%
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {att.attemptedAt ? new Date(att.attemptedAt).toLocaleDateString() : 'Today'} · {att.correct}/{att.total} correct
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-2)' }}>
              🎯 How Skill Quizzes Work
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Scores $\ge 70\%$ validate competence, count toward roadmap milestone progression, and feed into your real-time performance analytics.
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
