import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Target, Globe, TrendingUp, CheckCircle, Sparkles, MapPin, Briefcase, Settings, ShieldCheck, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, ProgressBar, Tabs, EmptyState, LoadingState, DemoBanner, SectionHeader, Alert } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { CAREER_RECOMMENDATIONS, COUNTRY_PATHWAYS, JOB_MARKET_DATA } from '../data/demoData.js';

export default function GoalCareer() {
  const { user } = useAuth();
  const { profile } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('destination');
  const [careerGoal, setCareerGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('Germany');

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [goal, road] = await Promise.all([
        dataService.getCareerGoal(user.userId),
        dataService.getRoadmap(user.userId),
      ]);
      setCareerGoal(goal);
      setRoadmap(road);
      if (goal?.country) {
        setSelectedCountry(goal.country);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const activeRole = careerGoal?.jobRole || 'Software Engineer';
  const activeCountry = careerGoal?.country || 'Germany';
  const pathways = COUNTRY_PATHWAYS[selectedCountry] || COUNTRY_PATHWAYS['Germany'];
  const market = JOB_MARKET_DATA[activeRole] || JOB_MARKET_DATA['Software Engineer'];

  const TABS = [
    { id: 'destination', label: '🎯 Career Destination' },
    { id: 'pathways', label: '🗺️ Country Pathways' },
    { id: 'recommendations', label: '🤖 AI Recommendations' },
    { id: 'market', label: '📈 Job Market Analysis' },
  ];

  return (
    <AppLayout pageTitle="Career Discover">
      {user?.isDemo && <DemoBanner />}
      <SectionHeader
        title="Career Discover & Pathways"
        subtitle="View your target role, destination requirements, and global market insights"
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      
      <div style={{ marginTop: 'var(--space-6)' }}>
        {loading ? (
          <LoadingState text="Loading career insights..." />
        ) : (
          <>
            {/* ===== TAB 1: DESTINATION OVERVIEW (VIEW ONLY) ===== */}
            {tab === 'destination' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 880 }}>
                {/* Hero Destination Banner */}
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(212, 175, 122, 0.08))',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(13, 148, 136, 0.12)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        <Sparkles size={12} /> Active Personal Destination
                      </div>
                      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                        {activeRole}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} color="var(--color-primary)" /> Target Country: <strong>{activeCountry}</strong>
                        </span>
                        {careerGoal?.specialization && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Briefcase size={14} color="var(--color-accent)" /> Track: <strong>{careerGoal.specialization}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                        FutureForge Readiness
                      </span>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                        {roadmap?.totalSteps ? Math.round(((roadmap.completedSteps || 0) / roadmap.totalSteps) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Governance Notice: View Only */}
                  <div style={{
                    marginTop: 'var(--space-5)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={15} color="var(--color-success)" />
                      <span>Career governance active. To modify your career goal or destination, update your parameters in <strong>Settings</strong>.</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate('/settings')}
                      style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, padding: '2px 8px' }}
                    >
                      <Settings size={12} /> Go to Settings →
                    </button>
                  </div>
                </Card>

                {/* Simplified Destination Pathway (Vertical Stepper for Mobile) */}
                <Card>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    🗺️ Destination Milestone Sequence
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
                    Standard international hiring sequence for {activeRole} candidates targeting {activeCountry}
                  </p>

                  <div className="vertical-pathway-timeline">
                    {[
                      { step: 1, title: 'Core Programming & Algorithms', desc: 'Master foundational syntax, time complexity, and data structures.', status: 'current' },
                      { step: 2, title: 'Data Structures & Problem Solving', desc: 'LeetCode Medium array, tree, and graph problem solving benchmarks.', status: 'upcoming' },
                      { step: 3, title: 'Relational Databases & SQL', desc: 'Schema design, indexing, joins, and ACID transactional guarantees.', status: 'upcoming' },
                      { step: 4, title: 'Version Control & Git Workflow', desc: 'Branching models, interactive rebase, pull requests, and CI/CD basics.', status: 'upcoming' },
                      { step: 5, title: 'Full-Stack Capstone Projects', desc: 'Production-ready web application with automated tests and cloud hosting.', status: 'upcoming' },
                      { step: 6, title: 'Communication & Technical Demos', desc: 'Documenting architectural trade-offs and presenting technical solutions.', status: 'upcoming' },
                      { step: 7, title: 'Internship / Work Experience', desc: 'Applied software engineering in cross-functional product sprints.', status: 'upcoming' },
                      { step: 8, title: 'Portfolio & Public GitHub', desc: 'Curated technical case studies demonstrating end-to-end craftsmanship.', status: 'upcoming' },
                      { step: 9, title: 'Technical Rounds & Visa Sponsorship', desc: 'System design, live coding rounds, and target country visa requirements.', status: 'upcoming' },
                    ].map(item => (
                      <div key={item.step} className={`vertical-step-item ${item.status}`}>
                        <div className="vertical-step-badge">
                          {item.step}
                        </div>
                        <div className="vertical-step-body">
                          <div className="vertical-step-title">{item.title}</div>
                          <div className="vertical-step-desc">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Required Skills Pill Cloud */}
                <Card>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                    ⚡ Key Competencies for {activeRole}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(market.topSkills || ['Python', 'Data Structures', 'SQL', 'Git', 'REST APIs', 'Docker', 'System Design']).map(skill => (
                      <span key={skill} style={{
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        border: '1px solid rgba(13, 148, 136, 0.2)',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ===== TAB 2: COUNTRY PATHWAYS ===== */}
            {tab === 'pathways' && (
              <div style={{ maxWidth: 880 }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
                  {['Germany', 'USA', 'Canada', 'UK', 'Australia', 'Netherlands'].map(c => (
                    <button
                      key={c}
                      className={`btn btn-sm ${selectedCountry === c ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedCountry(c)}
                    >
                      {c === 'Germany' ? '🇩🇪' : c === 'USA' ? '🇺🇸' : c === 'Canada' ? '🇨🇦' : c === 'UK' ? '🇬🇧' : c === 'Australia' ? '🇦🇺' : '🇳🇱'} {c}
                    </button>
                  ))}
                </div>

                <Alert type="info">
                  {pathways?.disclaimer || 'Requirements are compiled from verified immigration and tech hiring benchmarks.'}
                </Alert>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 'var(--space-4) 0' }}>
                  {pathways?.overview || `Immigration, visa and career preparation requirements for candidates targeting ${selectedCountry}.`}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {(pathways?.pathways || []).map((path, idx) => (
                    <Card key={path.id || idx}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', margin: 0 }}>{path.title}</h3>
                      </div>

                      <div className="grid grid-3" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                        <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-success)', marginBottom: 4 }}>
                            ✅ Advantages
                          </div>
                          {(path.advantages || []).map(a => (
                            <div key={a} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {a}</div>
                          ))}
                        </div>

                        <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-warning)', marginBottom: 4 }}>
                            ⚠️ Challenges
                          </div>
                          {(path.challenges || []).map(c => (
                            <div key={c} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {c}</div>
                          ))}
                        </div>

                        <div style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 4 }}>
                            📌 Prep Steps
                          </div>
                          {(path.prepSteps || []).map(s => (
                            <div key={s} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 3 }}>• {s}</div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ===== TAB 3: AI RECOMMENDATIONS ===== */}
            {tab === 'recommendations' && (
              <div style={{ maxWidth: 880 }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
                  Based on your degree, coursework, and technical capabilities, PathWise AI suggests these alternative specializations:
                </p>

                <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                  {CAREER_RECOMMENDATIONS.map(rec => (
                    <Card key={rec.role} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', margin: 0 }}>{rec.role}</h3>
                          <Badge variant="success">{rec.matchScore}% Match</Badge>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                          {rec.whyRecommended}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'var(--space-4)' }}>
                          {rec.keySkills?.map(sk => (
                            <span key={sk} style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-primary)', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        To switch to this role, update your career selection in <strong>Settings</strong>.
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ===== TAB 4: JOB MARKET ANALYSIS ===== */}
            {tab === 'market' && (
              <div style={{ maxWidth: 880 }}>
                <Alert type="warning">
                  {market.disclaimer}
                </Alert>

                <div style={{ marginTop: 'var(--space-5)' }}>
                  <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
                    <Card style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                        Verified Current Demand
                      </div>
                      <Badge variant={market.currentDemand === 'HIGH' ? 'success' : 'warning'}>
                        {market.currentDemand}
                      </Badge>
                    </Card>
                    <Card style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                        5-Year Growth Trend
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)', color: 'var(--color-primary)' }}>
                        {market.trend}
                      </div>
                    </Card>
                    <Card style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                        AI Forecast Demand
                      </div>
                      <Badge variant={market.projectedDemand === 'HIGH' ? 'success' : 'warning'}>
                        {market.projectedDemand} (Forecast)
                      </Badge>
                    </Card>
                  </div>

                  <Card style={{ marginBottom: 'var(--space-5)' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                      Top In-Demand Technical Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {market.topSkills?.map(s => (
                        <span key={s} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                      Top Hiring Countries for this Profile
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {market.topCountries?.map(c => (
                        <Badge key={c} variant="info">{c}</Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
