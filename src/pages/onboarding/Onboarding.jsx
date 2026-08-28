import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, Check, Compass, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { dataService } from '../../services/dataService.js';

const COURSES = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'MCA', 'MBA', 'B.Com', 'Other'];
const STREAMS = [
  'Computer Science & Engineering', 'Artificial Intelligence & Data Science',
  'Information Technology', 'Electronics & Communication Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Data Science', 'Cybersecurity', 'Other',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const SEMESTERS = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'What should we call you?' },
  { id: 2, title: 'Academic Profile', description: 'Your current academic stage' },
  { id: 3, title: 'Career Direction', description: 'Define your FutureForge target' },
  { id: 4, title: 'All Set!', description: 'Your personalized platform is ready' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { refreshProfile, showToast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    course: '',
    stream: '',
    college: '',
    year: '',
    semester: '',
    graduationYear: '',
    hasGoal: null,
    jobRole: 'Software Engineer',
    specialization: '',
    country: 'Germany',
    interests: [],
    skills: [],
  });

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function canProceed() {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.course && form.stream && form.college && form.year;
    if (step === 3) return form.hasGoal !== null;
    return true;
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    const profile = {
      name: form.name,
      course: form.course,
      stream: form.stream,
      college: form.college,
      year: form.year,
      semester: form.semester,
      graduationYear: form.graduationYear,
      interests: form.interests,
      skills: form.skills,
      onboardingComplete: true,
    };

    const careerGoal = form.hasGoal === 'yes'
      ? { hasGoal: true, jobRole: form.jobRole || 'Software Engineer', specialization: form.specialization, country: form.country || 'Germany', industry: '' }
      : { hasGoal: false, jobRole: 'Software Engineer', country: 'Germany', interests: form.interests, skills: form.skills };

    await dataService.saveStudentProfile(user.userId, profile);
    await dataService.saveCareerGoal(user.userId, careerGoal);
    await refreshProfile();
    setSaving(false);
    showToast('Welcome to PathWise AI! Your FutureForge journey is live 🚀', 'success');
    navigate('/');
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--color-primary), #0f766e)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 'var(--font-size-xl)', letterSpacing: '-0.02em' }}>PathWise AI</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>"Forge Your Skills. Build Your Future."</div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="onboarding-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`onboarding-step-dot ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`onboarding-step-line ${step > s.id ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step title */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            {STEPS[step - 1].title}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            {STEPS[step - 1].description}
          </p>
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label htmlFor="ob-name" className="form-label">Full Name *</label>
              <input id="ob-name" type="text" className="form-input" placeholder="e.g., Alex Chen" value={form.name} onChange={e => update('name', e.target.value)} autoFocus />
            </div>
          </div>
        )}

        {/* STEP 2: Academic Details */}
        {step === 2 && (
          <div>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="ob-course" className="form-label">Degree / Course *</label>
                <select id="ob-course" className="form-select" value={form.course} onChange={e => update('course', e.target.value)}>
                  <option value="">Select course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ob-year" className="form-label">Current Academic Year *</label>
                <select id="ob-year" className="form-select" value={form.year} onChange={e => update('year', e.target.value)}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="ob-stream" className="form-label">Branch / Specialization *</label>
              <select id="ob-stream" className="form-select" value={form.stream} onChange={e => update('stream', e.target.value)}>
                <option value="">Select branch</option>
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ob-college" className="form-label">College / University Name *</label>
              <input id="ob-college" type="text" className="form-input" placeholder="e.g., Chennai Institute of Technology" value={form.college} onChange={e => update('college', e.target.value)} />
            </div>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="ob-sem" className="form-label">Current Semester</label>
                <select id="ob-sem" className="form-select" value={form.semester} onChange={e => update('semester', e.target.value)}>
                  <option value="">Select semester</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ob-grad" className="form-label">Graduation Year</label>
                <select id="ob-grad" className="form-select" value={form.graduationYear} onChange={e => update('graduationYear', e.target.value)}>
                  <option value="">Select graduation year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Career Goal */}
        {step === 3 && (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              Have you decided on your career goal?
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              {['yes', 'no'].map(opt => (
                <button
                  key={opt}
                  onClick={() => update('hasGoal', opt)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${form.hasGoal === opt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.hasGoal === opt ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 'var(--font-size-base)',
                    color: form.hasGoal === opt ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 200ms ease',
                  }}
                >
                  {opt === 'yes' ? '✅ Yes, I have a target role' : '🤔 Recommend based on my profile'}
                </button>
              ))}
            </div>

            {form.hasGoal === 'yes' && (
              <div>
                <div className="form-group">
                  <label htmlFor="ob-role" className="form-label">Target Dream Role *</label>
                  <select id="ob-role" className="form-select" value={form.jobRole} onChange={e => update('jobRole', e.target.value)}>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="AI / ML Engineer">AI / Machine Learning Engineer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  </select>
                </div>
                <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label htmlFor="ob-spec" className="form-label">Specialization (Optional)</label>
                    <input id="ob-spec" type="text" className="form-input" placeholder="e.g., Backend, Distributed Systems" value={form.specialization} onChange={e => update('specialization', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ob-country" className="form-label">Target Country Pathway</label>
                    <select id="ob-country" className="form-select" value={form.country} onChange={e => update('country', e.target.value)}>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="USA">🇺🇸 USA</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="UK">🇬🇧 UK</option>
                      <option value="India">🇮🇳 India</option>
                      <option value="Other">🌍 Global / Remote</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {form.hasGoal === 'no' && (
              <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                  🤖 PathWise AI will evaluate your skills and configure the Software Engineering FutureForge pathway to begin your career acceleration!
                </p>
                <div className="form-group">
                  <label htmlFor="ob-interests" className="form-label">Your favorite technical subjects or interests</label>
                  <input id="ob-interests" type="text" className="form-input" placeholder="e.g. coding, web apps, databases, problem solving" value={form.interests.join(', ')} onChange={e => update('interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                  <span className="form-help">Separate topics with commas</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Completion */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
            <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🚀</div>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, marginBottom: 'var(--space-3)' }}>
              You're Ready to Build Your Future, {form.name.split(' ')[0]}!
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', maxWidth: 440, margin: '0 auto var(--space-6)', lineHeight: 1.6 }}>
              Your personalized FutureForge roadmap is generated. Daily learning targets and diagnostic quizzes are primed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              {[
                { icon: '🎯', text: `Target Role: ${form.jobRole || 'Software Engineer'} (${form.country || 'Germany'})` },
                { icon: '🗺️', text: 'FutureForge Skill Milestones ready' },
                { icon: '🧠', text: 'Diagnostic Skill Quizzes primed' },
                { icon: '🤖', text: 'AI Copilot + Web Search available' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  <span>{item.icon}</span>
                  <span style={{ fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              id={`onboard-next-step-${step}`}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleFinish}
              disabled={saving}
              id="onboard-finish-btn"
            >
              {saving ? <><span className="loading-spinner" style={{ width: 16, height: 16 }} /> Generating Roadmap...</> : '🚀 Launch My FutureForge Platform'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
