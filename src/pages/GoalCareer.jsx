import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Target, Globe, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, Tabs, EmptyState, LoadingState, DemoBanner, SectionHeader, Alert } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { CAREER_RECOMMENDATIONS, COUNTRY_PATHWAYS, JOB_MARKET_DATA } from '../data/demoData.js';

export default function GoalCareer() {
  const { user } = useAuth();
  const { showToast, refreshRoadmap } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('goal');
  const [careerGoal, setCareerGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Form state
  const [form, setForm] = useState({ hasGoal: null, jobRole: '', specialization: '', country: '', industry: '' });

  useEffect(() => {
    if (!user) return;
    dataService.getCareerGoal(user.userId).then(goal => {
      setCareerGoal(goal);
      if (goal) setForm({ hasGoal: goal.hasGoal ? 'yes' : 'no', jobRole: goal.jobRole || '', specialization: goal.specialization || '', country: goal.country || '', industry: goal.industry || '' });
      setLoading(false);
    });
  }, [user]);

  async function handleSaveGoal() {
    if (!form.jobRole && form.hasGoal === 'yes') { showToast('Please enter your dream job role.', 'error'); return; }
    setSaving(true);
    const goal = form.hasGoal === 'yes'
      ? { hasGoal: true, jobRole: form.jobRole, specialization: form.specialization, country: form.country, industry: form.industry }
      : { hasGoal: false };
    await dataService.saveCareerGoal(user.userId, goal);
    setCareerGoal(goal);
    setSaving(false);
    showToast('Career goal saved! Generating your roadmap...', 'success');
    setTimeout(() => navigate('/roadmap'), 1200);
  }

  const pathways = COUNTRY_PATHWAYS[form.country || 'Germany'];
  const market = JOB_MARKET_DATA[form.jobRole] || JOB_MARKET_DATA['Software Engineer'];

  const TABS = [
    { id: 'goal', label: '🎯 Career Goal' },
    { id: 'recommendations', label: '🤖 AI Recommendations' },
    { id: 'pathways', label: '🗺️ Country Pathways' },
    { id: 'market', label: '📈 Job Market' },
  ];

  return (
    <AppLayout pageTitle="Goal & Career">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader title="Goal & Career" subtitle="Set your career goal and explore personalized pathways" />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 'var(--space-6)' }}>

        {/* ===== GOAL TAB ===== */}
        {tab === 'goal' && (
          loading ? <LoadingState text="Loading career goal..." /> : (
            <div style={{ maxWidth: 640 }}>
              <Card>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Have you decided your career goal?</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
                  Your answer shapes your personalized roadmap, daily targets, and AI assistant responses.
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  {['yes', 'no'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => setForm(f => ({ ...f, hasGoal: opt }))}
                      style={{
                        flex: 1, padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${form.hasGoal === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: form.hasGoal === opt ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        cursor: 'pointer', textAlign: 'center', fontWeight: 700,
                        color: form.hasGoal === opt ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        transition: 'all 200ms ease',
                      }}
                    >
                      {opt === 'yes' ? '✅ Yes, I have a goal' : '🤔 Not sure yet — recommend me'}
                    </button>
                  ))}
                </div>

                {form.hasGoal === 'yes' && (
                  <div>
                    <div className="form-group">
                      <label htmlFor="cg-role" className="form-label">Dream Job Role *</label>
                      <input id="cg-role" type="text" className="form-input" placeholder="e.g., Software Engineer, Data Analyst, ML Engineer" value={form.jobRole} onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))} />
                    </div>
                    <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                      <div className="form-group">
                        <label htmlFor="cg-spec" className="form-label">Specialization (optional)</label>
                        <input id="cg-spec" type="text" className="form-input" placeholder="e.g., Backend, Cloud, ML" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cg-country" className="form-label">Dream Country</label>
                        <select id="cg-country" className="form-select" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                          <option value="">Select country</option>
                          <option value="Germany">🇩🇪 Germany</option>
                          <option value="USA">🇺🇸 USA</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="UK">🇬🇧 UK</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="Netherlands">🇳🇱 Netherlands</option>
                          <option value="India">🇮🇳 India</option>
                          <option value="Other">🌍 Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="cg-industry" className="form-label">Preferred Industry (optional)</label>
                      <input id="cg-industry" type="text" className="form-input" placeholder="e.g., Tech/Product, Finance, Healthcare, E-commerce" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                    </div>
                  </div>
                )}

                {form.hasGoal === 'no' && (
                  <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                      🤖 No problem! Check the AI Recommendations tab to see career options matched to your profile.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <button className="btn btn-primary" onClick={handleSaveGoal} disabled={!form.hasGoal || saving} id="save-career-goal-btn">
                    {saving ? 'Saving...' : '💾 Save Goal & Generate Roadmap'}
                  </button>
                  {form.hasGoal === 'no' && (
                    <button className="btn btn-secondary" onClick={() => setTab('recommendations')}>
                      View Recommendations →
                    </button>
                  )}
                </div>
              </Card>

              {careerGoal?.hasGoal && (
                <Card style={{ marginTop: 'var(--space-5)', borderColor: 'var(--color-success)', background: 'linear-gradient(135deg, var(--color-surface), rgba(16,185,129,0.04))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontWeight: 700 }}>Current Career Goal</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>{careerGoal.jobRole}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {careerGoal.country && <span>🌍 {careerGoal.country}</span>}
                    {careerGoal.specialization && <span>⚡ {careerGoal.specialization}</span>}
                  </div>
                </Card>
              )}
            </div>
          )
        )}

        {/* ===== AI RECOMMENDATIONS TAB ===== */}
        {tab === 'recommendations' && (
          <div style={{ maxWidth: 720 }}>
            <Alert type="info">These are AI-generated recommendations based on your B.Tech AI & Data Science profile. They are suggestions to help you explore options, not guaranteed career outcomes.</Alert>
            <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {CAREER_RECOMMENDATIONS.map(rec => (
                <Card key={rec.role} className="card-hover">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{rec.role}</h3>
                        <Badge variant={rec.demand === 'HIGH' ? 'success' : rec.demand === 'MEDIUM' ? 'warning' : 'muted'}>{rec.demand} Demand</Badge>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{rec.reason}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--space-3)' }}>
                        {rec.requiredSkills.map(s => <span key={s} style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{s}</span>)}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Path: {rec.prepPath}</div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: rec.matchPercentage >= 85 ? 'var(--color-success)' : rec.matchPercentage >= 70 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{rec.matchPercentage}%</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 8 }}>match</div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { setForm(f => ({ ...f, hasGoal: 'yes', jobRole: rec.role })); setTab('goal'); showToast(`Selected: ${rec.role}`, 'success'); }}
                        id={`select-career-${rec.role.replace(/\s/g, '-')}`}
                      >Select</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <ProgressBar value={rec.matchPercentage} variant={rec.matchPercentage >= 85 ? 'success' : 'primary'} size="sm" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ===== COUNTRY PATHWAYS TAB ===== */}
        {tab === 'pathways' && (
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
              {['Germany', 'USA', 'Canada', 'UK'].map(c => (
                <button key={c} className={`btn ${form.country === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForm(f => ({ ...f, country: c }))}>{c}</button>
              ))}
            </div>

            {pathways ? (
              <>
                <Alert type="warning">
                  {pathways.disclaimer}
                </Alert>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0' }}>{pathways.overview}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  {pathways.pathways.map((path, idx) => (
                    <Card key={path.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                        <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{path.title}</h3>
                      </div>

                      {/* Steps timeline */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 'var(--space-5)' }}>
                        {path.steps.map((step, i) => (
                          <React.Fragment key={step}>
                            <span style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)', padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{step}</span>
                            {i < path.steps.length - 1 && <span style={{ color: 'var(--color-text-muted)' }}>→</span>}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: 6 }}>✅ Advantages</div>
                          {path.advantages.map(a => <div key={a} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {a}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: 6 }}>⚠️ Challenges</div>
                          {path.challenges.map(c => <div key={c} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {c}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 6 }}>📌 Prep Steps</div>
                          {path.prepSteps.map(s => <div key={s} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {s}</div>)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="🌍" title="Select a country to view pathways" description="Choose a country above to see available career pathways" />
            )}
          </div>
        )}

        {/* ===== JOB MARKET TAB ===== */}
        {tab === 'market' && (
          <div style={{ maxWidth: 720 }}>
            <Alert type="warning">{market.disclaimer}</Alert>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                  { label: 'Current Demand', value: market.currentDemand, color: market.currentDemand === 'HIGH' ? 'success' : 'warning' },
                  { label: 'Trend', value: market.trend },
                  { label: 'Projected', value: market.projectedDemand, color: market.projectedDemand === 'HIGH' ? 'success' : 'warning' },
                ].map(m => (
                  <Card key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>{m.label}</div>
                    <Badge variant={m.color || 'muted'}>{m.value}</Badge>
                  </Card>
                ))}
              </div>

              <Card style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Top In-Demand Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {market.topSkills.map(s => (
                    <span key={s} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </Card>

              <Card style={{ marginBottom: 'var(--space-5)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Top Countries</h3>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  {market.topCountries?.map(c => <Badge key={c} variant="info">{c}</Badge>)}
                </div>
              </Card>

              <Card>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Example Companies (Germany)</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Note: Always research current job listings for up-to-date hiring information.</p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  {market.topCompanies?.map(c => <Badge key={c} variant="muted">{c}</Badge>)}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
