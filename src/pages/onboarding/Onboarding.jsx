import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronRight, ChevronLeft, Check, Compass, Target,
  GraduationCap, Cpu, Layers, Award, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, Plus, X, Star, TrendingUp, BookOpen,
  MapPin, Briefcase, Zap, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { dataService } from '../../services/dataService.js';
import { generatePersonalizedRoadmap } from '../../services/roadmapGenerator.js';
import {
  analyzeProfileAgainstRole,
  recommendSoftwareRoles,
  TECH_ROLE_DEFINITIONS
} from '../../services/aiService.js';

// Academic constants: strictly for tech & engineering education
const EDUCATION_LEVELS = [
  'B.Tech / B.E.',
  'BCA',
  'MCA',
  'Diploma in CS / Engineering',
  'M.Tech / M.E.',
  'B.Sc Computer Science / IT',
  'M.Sc Computer Science / IT',
  'Other Tech Degree',
];

const STREAMS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Software Engineering',
  'Data Science & Analytics',
  'Cyber Security & Forensics',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical / Civil (Transitioning to Tech)',
  'Other Technology Specialization',
];

const YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Post-Graduate / Recent Graduate',
];

const SEMESTERS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'N/A'
];

const POPULAR_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL', 'React', 'Node.js',
  'Git', 'HTML/CSS', 'Docker', 'Linux', 'AWS', 'PostgreSQL', 'FastAPI', 'Pandas',
  'Tailwind', 'Next.js', 'PyTorch', 'MongoDB', 'C#', 'Go', 'Express', 'Spring Boot'
];

const TECH_INTERESTS = [
  'Software Engineering & Architecture',
  'Full Stack Web Development',
  'Artificial Intelligence & Machine Learning',
  'Cloud Infrastructure & DevOps',
  'Cybersecurity & Threat Defense',
  'Data Engineering & Big Data',
  'Mobile Application Development (iOS/Android)',
  'QA Automation & Systems Testing',
];

const SOFTWARE_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Data Engineer',
  'DevOps & Cloud Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer',
  'QA / Test Automation Engineer',
];

const COUNTRIES = [
  { label: '🇩🇪 Germany', value: 'Germany' },
  { label: '🇺🇸 USA', value: 'USA' },
  { label: '🇨🇦 Canada', value: 'Canada' },
  { label: '🇬🇧 UK', value: 'UK' },
  { label: '🇮🇳 India', value: 'India' },
  { label: '🌍 Global / Remote', value: 'Global' },
];

const STEPS = [
  { id: 1, label: 'Step 1 — Education', sub: 'Academic Details' },
  { id: 2, label: 'Step 2 — Skills', sub: 'Skills & Interests' },
  { id: 3, label: 'Step 3 — Career Goal', sub: 'Role & Intelligence' },
  { id: 4, label: 'Step 4 — Your Path', sub: 'Generated Pathway' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { refreshProfile, refreshRoadmap, showToast } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Main Onboarding Form State
  const [form, setForm] = useState({
    name: user?.name || '',
    course: '',
    stream: '',
    college: '',
    year: '',
    semester: '',
    graduationYear: '',
    skills: ['Python', 'Git'],
    interests: ['Software Engineering & Architecture'],
    experienceLevel: 'Intermediate', // 'Beginner' | 'Intermediate' | 'Advanced'
    hasGoal: null, // 'yes' | 'no' | null
    jobRole: 'Software Engineer',
    specialization: '',
    country: 'Germany',
  });

  // Calculate graduation year automatically
  function update(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value };
      if ((field === 'course' || field === 'year') && next.course && next.year) {
        const currentYear = new Date().getFullYear();
        let totalDuration = 4;
        if (next.course.includes('BCA') || next.course.includes('B.Sc') || next.course.includes('Diploma')) {
          totalDuration = 3;
        } else if (next.course.includes('M.Tech') || next.course.includes('MCA') || next.course.includes('M.Sc')) {
          totalDuration = 2;
        }
        let completedYears = 1;
        if (next.year.includes('2nd')) completedYears = 2;
        else if (next.year.includes('3rd')) completedYears = 3;
        else if (next.year.includes('4th')) completedYears = 4;
        else if (next.year.includes('Post-Graduate')) completedYears = totalDuration;

        next.graduationYear = String(currentYear + Math.max(0, totalDuration - completedYears));
      }
      return next;
    });
  }

  // Add / remove skill
  function toggleSkill(skill) {
    setForm(f => {
      const exists = f.skills.includes(skill);
      const skills = exists ? f.skills.filter(s => s !== skill) : [...f.skills, skill];
      return { ...f, skills };
    });
  }

  function addCustomSkill() {
    const trimmed = customSkillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm(f => ({ ...f, skills: [...f.skills, trimmed] }));
      setCustomSkillInput('');
    }
  }

  // Toggle interest
  function toggleInterest(interest) {
    setForm(f => {
      const exists = f.interests.includes(interest);
      const interests = exists ? f.interests.filter(i => i !== interest) : [...f.interests, interest];
      return { ...f, interests };
    });
  }

  // Step 3 (YES Pathway): Profile analysis against selected role
  const profileAnalysis = useMemo(() => {
    if (form.hasGoal !== 'yes') return null;
    const targetRole = isCustomRole ? (customRoleInput.trim() || 'Software Engineer') : form.jobRole;
    return analyzeProfileAgainstRole(form, targetRole, form.skills, form.experienceLevel);
  }, [form.hasGoal, form.jobRole, form.skills, form.experienceLevel, form.course, form.stream, isCustomRole, customRoleInput]);

  // Step 3 (NO Pathway): AI Role Recommendations with Priority Scores
  const aiRecommendations = useMemo(() => {
    if (form.hasGoal !== 'no') return [];
    return recommendSoftwareRoles(form, form.skills, form.interests, form.experienceLevel);
  }, [form.hasGoal, form.skills, form.interests, form.experienceLevel, form.course, form.stream]);

  // Handle recommendation selection
  function handleSelectRecommendedRole(roleTitle) {
    setForm(f => ({ ...f, jobRole: roleTitle }));
  }

  // Validation
  function canProceed() {
    if (step === 1) {
      return (
        form.name.trim().length > 0 &&
        form.course.length > 0 &&
        form.stream.length > 0 &&
        form.college.trim().length > 0 &&
        form.year.length > 0
      );
    }
    if (step === 2) {
      return form.skills.length > 0 && form.interests.length > 0;
    }
    if (step === 3) {
      if (form.hasGoal === null) return false;
      if (form.hasGoal === 'yes') {
        if (isCustomRole && !customRoleInput.trim()) return false;
        return true;
      }
      if (form.hasGoal === 'no') {
        return Boolean(form.jobRole);
      }
    }
    return true;
  }

  // Final submission and initialization
  async function handleFinish() {
    if (!user) return;
    setSaving(true);

    const activeRole = form.hasGoal === 'yes' && isCustomRole
      ? (customRoleInput.trim() || 'Software Engineer')
      : form.jobRole;

    const studentProfile = {
      name: form.name.trim(),
      course: form.course,
      stream: form.stream,
      college: form.college.trim(),
      year: form.year,
      semester: form.semester || '1st Semester',
      graduationYear: form.graduationYear || String(new Date().getFullYear() + 2),
      skills: form.skills,
      interests: form.interests,
      experienceLevel: form.experienceLevel,
      onboardingComplete: true,
    };

    const careerGoal = {
      hasGoal: form.hasGoal === 'yes',
      jobRole: activeRole,
      specialization: form.specialization || '',
      country: form.country || 'Germany',
      industry: 'Software & Technology',
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save Profile with onboardingComplete: true
      await dataService.saveStudentProfile(user.userId, studentProfile);

      // 2. Save Career Goal & automatically generate personalized roadmap
      await dataService.saveCareerGoal(user.userId, careerGoal, { regenerateRoadmap: true });

      // 3. Refresh App Context
      await Promise.all([refreshProfile(), refreshRoadmap()]);

      showToast(`Welcome to NexGuide AI! Your ${activeRole} pathway is ready 🚀`, 'success');
      setSaving(false);
      navigate('/');
    } catch (err) {
      console.error('Onboarding completion error:', err);
      setSaving(false);
      showToast('Unable to complete onboarding. Please try again.', 'error');
    }
  }

  // Generated preview roadmap for Step 4
  const previewRoadmap = useMemo(() => {
    const activeRole = form.hasGoal === 'yes' && isCustomRole
      ? (customRoleInput.trim() || 'Software Engineer')
      : form.jobRole;
    return generatePersonalizedRoadmap(activeRole, form.country);
  }, [form.jobRole, form.country, form.hasGoal, isCustomRole, customRoleInput]);

  return (
    <div className="onboarding-page" style={{ padding: '24px 16px', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="onboarding-card" style={{ maxWidth: 780, width: '100%', margin: '0 auto' }}>
        
        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, var(--color-primary), #0f766e)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                NexGuide AI
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Software Career & Skill Acceleration Operating System
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--color-surface-alt)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
            Step {step} of 4
          </span>
        </div>

        {/* Step Progress Tracker */}
        <div className="onboarding-steps" style={{ marginBottom: 'var(--space-7)' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  className={`onboarding-step-dot ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}
                  style={{ cursor: step > s.id ? 'pointer' : 'default' }}
                  onClick={() => step > s.id && setStep(s.id)}
                  title={s.label}
                >
                  {step > s.id ? <Check size={15} /> : s.id}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: step === s.id ? 'var(--color-primary)' : 'var(--color-text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {s.sub}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`onboarding-step-line ${step > s.id ? 'completed' : ''}`}
                  style={{ marginBottom: 16 }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ============================================================
            STEP 1 — EDUCATION (ACADEMIC DETAILS)
            ============================================================ */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                <GraduationCap size={14} /> Step 1 — Academic Profile
              </div>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                Let's Build Your Career Path
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                NexGuide AI maps your academic background to international technology standards and curriculum prerequisites.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="ob-name" className="form-label">Full Name *</label>
                <input
                  id="ob-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Rivera"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  autoFocus
                />
              </div>

              {/* Education Level & Academic Year Grid */}
              <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="ob-course" className="form-label">Education Level / Degree *</label>
                  <select
                    id="ob-course"
                    className="form-select"
                    value={form.course}
                    onChange={e => update('course', e.target.value)}
                  >
                    <option value="">Select your education level</option>
                    {EDUCATION_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ob-year" className="form-label">Current Academic Year *</label>
                  <select
                    id="ob-year"
                    className="form-select"
                    value={form.year}
                    onChange={e => update('year', e.target.value)}
                  >
                    <option value="">Select current year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Branch / Stream */}
              <div className="form-group">
                <label htmlFor="ob-stream" className="form-label">Branch / Field of Study *</label>
                <select
                  id="ob-stream"
                  className="form-select"
                  value={form.stream}
                  onChange={e => update('stream', e.target.value)}
                >
                  <option value="">Select branch / stream</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* College / University Name */}
              <div className="form-group">
                <label htmlFor="ob-college" className="form-label">College / University Name *</label>
                <input
                  id="ob-college"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chennai Institute of Technology, IIT, NIT, Delhi University"
                  value={form.college}
                  onChange={e => update('college', e.target.value)}
                />
              </div>

              {/* Semester & Graduation Year */}
              <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="ob-semester" className="form-label">Current Semester</label>
                  <select
                    id="ob-semester"
                    className="form-select"
                    value={form.semester}
                    onChange={e => update('semester', e.target.value)}
                  >
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ob-grad-year" className="form-label">Graduation Year</label>
                  <input
                    id="ob-grad-year"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2027"
                    value={form.graduationYear}
                    onChange={e => update('graduationYear', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 2 — SKILLS & INTERESTS (TECHNICAL SKILLS ONLY)
            ============================================================ */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                <Cpu size={14} /> Step 2 — Technical Capabilities
              </div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                Your Skills & Tech Interests
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Select technologies you know and areas you want to explore. NexGuide AI uses these to identify strengths and skill gaps.
              </p>
            </div>

            {/* Technical Skills Quick Pick */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Technical Skills & Languages ({form.skills.length} selected)
                </label>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Tap to toggle</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-3)' }}>
                {POPULAR_SKILLS.map(skill => {
                  const active = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: active ? 'white' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 180ms ease',
                      }}
                    >
                      {active && '✓ '}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add custom skill (e.g. Kotlin, Rust, GraphQL, Figma)..."
                  value={customSkillInput}
                  onChange={e => setCustomSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  style={{ height: 38, fontSize: 'var(--font-size-xs)' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addCustomSkill}
                  style={{ flexShrink: 0, padding: '0 14px' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Tech Interests */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
                Primary Technology Interests *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {TECH_INTERESTS.map(interest => {
                  const active = form.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 180ms ease',
                      }}
                    >
                      <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-text-muted)'}`, background: active ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        {active && <Check size={10} />}
                      </div>
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
                Current Coding Experience Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'Beginner', title: 'Beginner', desc: 'Syntax & coursework' },
                  { id: 'Intermediate', title: 'Intermediate', desc: 'Built 2+ personal apps' },
                  { id: 'Advanced', title: 'Advanced', desc: 'Full-stack / DSA mastery' },
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => update('experienceLevel', lvl.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${form.experienceLevel === lvl.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: form.experienceLevel === lvl.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 180ms ease',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', color: form.experienceLevel === lvl.id ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                      {lvl.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {lvl.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 3 — CAREER GOAL: DO YOU HAVE A GOAL? (YES vs NO)
            ============================================================ */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                <Target size={14} /> Step 3 — Software Career Direction
              </div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                Do you already have a career goal?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                NexGuide AI strictly supports software, computing, and technology pathways. Choose how you'd like to proceed:
              </p>
            </div>

            {/* YES vs NO Split Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div
                onClick={() => update('hasGoal', 'yes')}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${form.hasGoal === 'yes' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: form.hasGoal === 'yes' ? 'rgba(13, 148, 136, 0.08)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: form.hasGoal === 'yes' ? '0 0 0 3px rgba(13, 148, 136, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={18} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', display: 'block', color: 'var(--color-text-primary)' }}>
                      Yes, I have a target role
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Select or type your tech career goal
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  NexGuide AI will analyze your profile against this specific role to find your strengths and skill gaps.
                </p>
              </div>

              <div
                onClick={() => update('hasGoal', 'no')}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${form.hasGoal === 'no' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: form.hasGoal === 'no' ? 'rgba(13, 148, 136, 0.08)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: form.hasGoal === 'no' ? '0 0 0 3px rgba(13, 148, 136, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(212, 175, 122, 0.15)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', display: 'block', color: 'var(--color-text-primary)' }}>
                      No, recommend based on profile
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      AI role matching & priority scores
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Our recommendation engine analyzes your academic stage and skills to show top matched roles with priority scores.
                </p>
              </div>
            </div>

            {/* ============================================================
                BRANCH A: USER HAS A TARGET ROLE (YES)
                ============================================================ */}
            {form.hasGoal === 'yes' && (
              <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={16} color="var(--color-primary)" /> Select Your Target Software Career
                </div>

                <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Target Role *</label>
                    {!isCustomRole ? (
                      <select
                        className="form-select"
                        value={form.jobRole}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setIsCustomRole(true);
                          } else {
                            update('jobRole', e.target.value);
                          }
                        }}
                      >
                        {SOFTWARE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        <option value="__custom__">✨ Enter Custom Software Role...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Cloud Architect, Blockchain Developer"
                          value={customRoleInput}
                          onChange={e => setCustomRoleInput(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setIsCustomRole(false);
                            setCustomRoleInput('');
                          }}
                          style={{ fontSize: 11, flexShrink: 0 }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Country Pathway</label>
                    <select
                      className="form-select"
                      value={form.country}
                      onChange={e => update('country', e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Optional Specialization Track */}
                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">Specialization Track (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Distributed Systems, MLOps, Next.js Full Stack, Cloud Security"
                    value={form.specialization}
                    onChange={e => update('specialization', e.target.value)}
                  />
                </div>

                {/* ── PROFILE ANALYSIS AGAINST SELECTED ROLE ── */}
                {profileAnalysis && (
                  <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(13, 148, 136, 0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-primary)' }}>
                          Profile Analysis: {profileAnalysis.role}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>Match Readiness:</span>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 900, color: 'var(--color-primary)' }}>
                          {profileAnalysis.matchPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Readiness Level Progress Bar */}
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                      <div style={{ width: `${profileAnalysis.matchPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))', transition: 'width 300ms ease' }} />
                    </div>

                    {/* Identified Strengths vs Skill Gaps */}
                    <div className="grid grid-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div style={{ background: 'rgba(34, 197, 94, 0.08)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-success)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> Validated Strengths ({profileAnalysis.strengths.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {profileAnalysis.strengths.map(s => (
                            <span key={s} style={{ fontSize: 10, fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: 4 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(234, 179, 8, 0.08)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-warning)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TrendingUp size={12} /> Roadmap Skill Gaps to Bridge
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {profileAnalysis.gaps.map(g => (
                            <span key={g} style={{ fontSize: 10, fontWeight: 700, background: 'rgba(234, 179, 8, 0.15)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 4 }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      💡 <strong>AI Strategy:</strong> {profileAnalysis.aiTakeaway}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================
                BRANCH B: USER WANTS AI ROLE RECOMMENDATIONS (NO)
                ============================================================ */}
            {form.hasGoal === 'no' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                    <Sparkles size={16} color="var(--color-accent)" />
                    AI Recommended Software Roles for You
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Ranked by Priority Score
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  {aiRecommendations.map(rec => {
                    const isSelected = form.jobRole === rec.role;
                    return (
                      <div
                        key={rec.role}
                        onClick={() => handleSelectRecommendedRole(rec.role)}
                        style={{
                          background: isSelected ? 'rgba(13, 148, 136, 0.06)' : 'var(--color-surface)',
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-4)',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>
                                {rec.role}
                              </h3>
                              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                                {rec.priorityCategory}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              {rec.demandLabel} • {rec.typicalSalary}
                            </div>
                          </div>

                          {/* Priority Score Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15), rgba(212, 175, 122, 0.15))', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                            <Star size={13} color="var(--color-accent)" />
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 900, color: 'var(--color-primary)' }}>
                              {rec.priorityScore}% Priority
                            </span>
                          </div>
                        </div>

                        {/* Why it fits rationale */}
                        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 10px', lineHeight: 1.45 }}>
                          🎯 <strong>Fit Rationale:</strong> {rec.reason}
                        </p>

                        {/* Skills breakdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)' }}>Core Skills:</span>
                            {rec.skillsToAcquire.slice(0, 3).map(sk => (
                              <span key={sk} style={{ fontSize: 10, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: 4 }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                            {isSelected ? '✓ Selected Track' : 'Tap to Choose'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Country pathway selection for recommended role */}
                <div className="form-group" style={{ background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                  <label className="form-label">Target Destination / Country Pathway</label>
                  <select
                    className="form-select"
                    value={form.country}
                    onChange={e => update('country', e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            STEP 4 — YOUR PATH IS READY (BLUEPRINT & LAUNCH)
            ============================================================ */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.2), rgba(212, 175, 122, 0.2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', fontSize: 32 }}>
              🚀
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              <Sparkles size={14} /> Step 4 — Personalized Blueprint
            </div>

            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              Your Path Is Ready, {form.name.split(' ')[0]}!
            </h2>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', maxWidth: 520, margin: '0 auto var(--space-6)', lineHeight: 1.6 }}>
              NexGuide AI has synthesized your academic profile ({form.course} in {form.stream}) into a personalized software engineering roadmap with immediate daily learning targets.
            </p>

            {/* Path Blueprint Summary Card */}
            <div style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', maxWidth: 600, margin: '0 auto var(--space-6)', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Assigned Destination
                  </span>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: 2 }}>
                    {form.hasGoal === 'yes' && isCustomRole ? customRoleInput : form.jobRole}
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-surface)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>
                  <MapPin size={12} /> {form.country} Pathway
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ background: 'var(--color-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block' }}>Roadmap Stages</span>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                    {previewRoadmap.totalSteps} Production Stages
                  </span>
                </div>
                <div style={{ background: 'var(--color-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block' }}>Initial Learning Targets</span>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 900, color: 'var(--color-primary)' }}>
                    7 Daily Targets Primed
                  </span>
                </div>
              </div>

              {/* Stage 1 Preview */}
              {previewRoadmap.steps?.[0] && (
                <div style={{ background: 'rgba(13, 148, 136, 0.06)', border: '1px solid rgba(13, 148, 136, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-primary)', marginBottom: 2 }}>
                    Stage 1 Milestone Starting Today:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                    {previewRoadmap.steps[0].title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    Focus Skills: {previewRoadmap.steps[0].skills?.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER NAVIGATION ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1 || saving}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              id={`onboard-next-step-${step}`}
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleFinish}
              disabled={saving}
              id="onboard-finish-btn"
              style={{ minWidth: 220, justifyContent: 'center', fontWeight: 800 }}
            >
              {saving ? (
                <>
                  <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                  Synthesizing Roadmap...
                </>
              ) : (
                <>
                  Launch My Workspace <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
