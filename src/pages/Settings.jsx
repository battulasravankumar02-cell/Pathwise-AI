import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, SectionHeader, Alert, ConfirmDialog, Modal } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { testAIConnection } from '../services/aiService.js';
import { reminderService } from '../services/reminderService.js';
import { Moon, Sun, Sparkles, Key, RefreshCw, User, CheckCircle, AlertCircle, Trash2, Globe, Target, MapPin, Briefcase, Bell } from 'lucide-react';

const PROVIDER_MODELS = {
  gemini: [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast & Recommended)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Advanced Reasoning)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cost-Effective)' },
    { id: 'gpt-4o', name: 'GPT-4o (Omni Reasoning)' },
  ],
};

const SUGGESTED_ROLES = [
  'Software Engineer', 'Data Scientist', 'Machine Learning Engineer',
  'Cloud / DevOps Engineer', 'Full Stack Developer', 'Cybersecurity Specialist'
];

const DESTINATIONS = [
  { code: 'Germany', name: '🇩🇪 Germany' },
  { code: 'USA', name: '🇺🇸 USA' },
  { code: 'Canada', name: '🇨🇦 Canada' },
  { code: 'UK', name: '🇬🇧 UK' },
  { code: 'Australia', name: '🇦🇺 Australia' },
  { code: 'Netherlands', name: '🇳🇱 Netherlands' },
  { code: 'India', name: '🇮🇳 India' },
  { code: 'Other', name: '🌍 Other' },
];

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, showToast, refreshProfile, refreshRoadmap, profile, careerGoal } = useApp();

  // Academic Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || profile?.name || 'PathWise Student',
    email: user?.email || 'student@pathwise.ai',
    college: profile?.college || '',
    course: profile?.course || '',
    year: profile?.year || '',
    graduationYear: profile?.graduationYear || '',
  });

  // Dedicated Career & Goals Form (Editable Only Here)
  const [careerForm, setCareerForm] = useState({
    jobRole: careerGoal?.jobRole || 'Software Engineer',
    specialization: careerGoal?.specialization || '',
    country: careerGoal?.country || 'Germany',
    industry: careerGoal?.industry || '',
  });

  // Roadmap Adaptation Confirmation Modal State
  const [adaptationModalOpen, setAdaptationModalOpen] = useState(false);
  const [pendingCareerGoal, setPendingCareerGoal] = useState(null);

  // BYOK AI Configuration State
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(() => reminderService.getBrowserPermission());

  async function handleEnableBrowserNotifications() {
    const perm = await reminderService.requestBrowserPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      showToast('Browser notifications enabled successfully!', 'success');
      reminderService.sendBrowserNotification('Study Pulse AI Reminders Active', {
        body: "You will receive alerts for today's study topics and upcoming assignment deadlines.",
      });
    } else if (perm === 'denied') {
      showToast('Notifications blocked in browser. Please permit them in site settings.', 'warning');
    }
  }

  function handleSendTestNotification() {
    if (browserPermission !== 'granted') {
      showToast('Please enable notifications first.', 'warning');
      return;
    }
    const notif = reminderService.sendBrowserNotification('Study Reminder Test', {
      body: "Your scheduled topic for today is ready.\nSubject: DBMS\nTopic: Normalization & SQL Indexes\nTime: Today",
    });
    if (notif) {
      showToast('Test notification sent to your system!', 'success');
    } else {
      showToast('Notification could not be dispatched. Check browser permission.', 'error');
    }
  }

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [config, goal, prof] = await Promise.all([
        dataService.getAISettings(user.userId),
        dataService.getCareerGoal(user.userId),
        dataService.getStudentProfile(user.userId),
      ]);

      if (config) {
        setAiConfig(config);
        setAiProvider(config.provider || 'gemini');
        setAiModel(config.model || 'gemini-1.5-flash');
        if (config.hasKey) {
          setApiKey(config.maskedKey || '');
        }
      }

      if (goal) {
        setCareerForm({
          jobRole: goal.jobRole || 'Software Engineer',
          specialization: goal.specialization || '',
          country: goal.country || 'Germany',
          industry: goal.industry || '',
        });
      }

      if (prof) {
        setProfileForm({
          name: prof.name || user?.name || 'PathWise Student',
          email: user?.email || 'student@pathwise.ai',
          college: prof.college || '',
          course: prof.course || '',
          year: prof.year || '',
          graduationYear: prof.graduationYear || '',
        });
      }
    }
    loadData();
  }, [user]);

  function handleProviderChange(e) {
    const prov = e.target.value;
    setAiProvider(prov);
    const available = PROVIDER_MODELS[prov] || [];
    if (available.length > 0) {
      setAiModel(available[0].id);
    }
    setTestResult(null);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (user?.userId) {
      await dataService.saveStudentProfile(user.userId, {
        name: profileForm.name,
        college: profileForm.college,
        course: profileForm.course,
        year: profileForm.year,
        graduationYear: profileForm.graduationYear,
      });
      await refreshProfile();
      showToast('Student academic profile updated successfully!', 'success');
    }
  }

  async function handleCareerFormSubmit(e) {
    e.preventDefault();
    if (!user?.userId) return;

    const roleChanged = (careerGoal?.jobRole || '') !== careerForm.jobRole;
    const countryChanged = (careerGoal?.country || '') !== careerForm.country;

    const updated = {
      hasGoal: true,
      jobRole: careerForm.jobRole.trim() || 'Software Engineer',
      specialization: careerForm.specialization.trim(),
      country: careerForm.country || 'Germany',
      industry: careerForm.industry.trim(),
    };

    if (roleChanged || countryChanged) {
      setPendingCareerGoal(updated);
      setAdaptationModalOpen(true);
    } else {
      await dataService.saveCareerGoal(user.userId, updated, { regenerateRoadmap: false });
      await refreshProfile();
      showToast('Career parameters saved successfully!', 'success');
    }
  }

  async function handleApplyRoadmapAdaptation(regenerate) {
    if (!user?.userId || !pendingCareerGoal) return;
    setAdaptationModalOpen(false);

    await dataService.saveCareerGoal(user.userId, pendingCareerGoal, { regenerateRoadmap: regenerate });
    await refreshProfile();
    await refreshRoadmap();

    if (regenerate) {
      showToast('🎯 Career goal updated and new FutureForge roadmap generated!', 'success');
    } else {
      showToast('Career goal updated. Existing roadmap preserved.', 'info');
    }
    setPendingCareerGoal(null);
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    setTestResult(null);

    const actualKey = apiKey.startsWith('••••')
      ? sessionStorage.getItem(`pw_ai_key_${user.userId}`) || apiKey
      : apiKey;

    const res = await testAIConnection(aiProvider, aiModel, actualKey);
    setTestResult(res);
    setTestingConnection(false);

    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  }

  async function handleSaveAISettings(e) {
    e.preventDefault();
    if (!user?.userId) return;

    const actualKey = apiKey.startsWith('••••') ? '' : apiKey;

    const saved = await dataService.saveAISettings(user.userId, {
      provider: aiProvider,
      model: aiModel,
      apiKey: actualKey,
      maskedKey: apiKey.startsWith('••••') ? apiKey : undefined,
    });

    setAiConfig(saved.data);
    showToast('AI configuration saved successfully!', 'success');
  }

  async function handleRemoveApiKey() {
    if (!user?.userId) return;
    await dataService.removeAISettings(user.userId);
    setApiKey('');
    setTestResult(null);
    setAiConfig({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      hasKey: false,
      maskedKey: '',
      status: 'default',
    });
    showToast('Custom API Key removed. Reverted to standard copilot.', 'info');
  }

  async function handleResetData() {
    if (user?.userId) {
      dataService.resetUserData(user.userId);
      await refreshProfile();
      setResetConfirmOpen(false);
      showToast('Personal learning state reset.', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  }

  return (
    <AppLayout pageTitle="Settings">
      <SectionHeader
        title="Settings & System Governance ⚙️"
        subtitle="Authoritative configuration for your career destination, academic profile, and AI copilot"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', maxWidth: 840 }}>
        
        {/* ============================================================ */}
        {/* 1. CAREER & GOALS GOVERNANCE (EXCLUSIVE EDIT LOCATION)         */}
        {/* ============================================================ */}
        <Card id="career" style={{ border: '2px solid rgba(13, 148, 136, 0.35)', background: 'linear-gradient(180deg, var(--color-surface), rgba(13, 148, 136, 0.02))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} />
              </div>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Career & Goal Governance</h2>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                  Primary authoritative source for downstream personalization, roadmap, and AI Mentor
                </p>
              </div>
            </div>
            <Badge variant="primary">Authoritative Source</Badge>
          </div>

          <form onSubmit={handleCareerFormSubmit}>
            {/* Quick role suggestions */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Quick Suggestions:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {SUGGESTED_ROLES.map(role => (
                  <button
                    key={role}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setCareerForm(prev => ({ ...prev, jobRole: role }))}
                    style={{
                      background: careerForm.jobRole === role ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      color: careerForm.jobRole === role ? 'white' : 'var(--color-text-secondary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      padding: '3px 10px',
                      fontWeight: 600,
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cg-jobRole">Target Career Role *</label>
                <input
                  id="cg-jobRole"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Software Engineer, Data Scientist"
                  value={careerForm.jobRole}
                  onChange={e => setCareerForm({ ...careerForm, jobRole: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cg-country">Dream Destination Country *</label>
                <select
                  id="cg-country"
                  className="form-select"
                  value={careerForm.country}
                  onChange={e => setCareerForm({ ...careerForm, country: e.target.value })}
                  required
                >
                  {DESTINATIONS.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="cg-specialization">Track / Specialization (optional)</label>
                <input
                  id="cg-specialization"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Backend, Cloud, Distributed Systems"
                  value={careerForm.specialization}
                  onChange={e => setCareerForm({ ...careerForm, specialization: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cg-industry">Target Industry (optional)</label>
                <input
                  id="cg-industry"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Tech/Product, FinTech, AI Labs"
                  value={careerForm.industry}
                  onChange={e => setCareerForm({ ...careerForm, industry: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" id="save-career-btn" style={{ marginTop: 'var(--space-2)' }}>
              Save Career & Destination Changes
            </button>
          </form>
        </Card>

        {/* ============================================================ */}
        {/* 2. STUDENT ACADEMIC PROFILE                                  */}
        {/* ============================================================ */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <User size={20} className="text-primary" />
            <h2 className="card-title">Academic & Student Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={profileForm.email}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="course">Degree / Field of Study</label>
                <input
                  id="course"
                  type="text"
                  className="form-input"
                  placeholder="e.g., B.Tech / Computer Science"
                  value={profileForm.course}
                  onChange={e => setProfileForm({ ...profileForm, course: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="college">College / University</label>
                <input
                  id="college"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Institute of Technology"
                  value={profileForm.college}
                  onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="year">Current Academic Year</label>
                <input
                  id="year"
                  type="text"
                  className="form-input"
                  placeholder="e.g., 3rd Year"
                  value={profileForm.year}
                  onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="grad-year">Expected Graduation Year</label>
                <input
                  id="grad-year"
                  type="text"
                  className="form-input"
                  placeholder="e.g., 2026"
                  value={profileForm.graduationYear}
                  onChange={e => setProfileForm({ ...profileForm, graduationYear: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary" id="save-profile-btn" style={{ marginTop: 'var(--space-2)' }}>
              Save Academic Profile Changes
            </button>
          </form>
        </Card>

        {/* ============================================================ */}
        {/* 3. APPEARANCE & THEME                                        */}
        {/* ============================================================ */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
            <h2 className="card-title">Appearance & Theme</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Color Mode</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Current UI theme: <strong>{theme === 'dark' ? 'Obsidian Dark Mode 🌙' : 'Warm Ivory Light Mode ☀️'}</strong>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme} id="toggle-theme-settings-btn">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* NOTIFICATIONS & STUDY REMINDERS                              */}
        {/* ============================================================ */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Bell size={20} className="text-primary" />
              <h2 className="card-title">Notifications & Study Reminders</h2>
            </div>
            <span style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: browserPermission === 'granted' ? 'rgba(34, 197, 94, 0.15)' : browserPermission === 'denied' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: browserPermission === 'granted' ? 'var(--color-success)' : browserPermission === 'denied' ? 'var(--color-error)' : '#eab308',
            }}>
              {browserPermission === 'granted' ? '✓ Browser Notifications Active' : browserPermission === 'denied' ? '✕ Blocked in Browser' : '○ In-App Reminders Active'}
            </span>
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            Study Pulse AI automatically monitors today&apos;s study schedule and your coursework deadlines. In-app notifications are always enabled. Enable browser alerts to receive reminders while your browser is open.
          </p>

          <div className="grid grid-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 3 }}>📖 Today&apos;s Study Topic Reminders</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Alerts you to your daily syllabus topic and core practice modules generated from your career roadmap.
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 3 }}>⏰ Assignment & Deadline Alerts</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Warns you 48 hours before assignments are due and flags overdue submissions directly on your dashboard.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {browserPermission !== 'granted' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEnableBrowserNotifications}
                id="enable-notifications-btn"
              >
                <Bell size={15} /> Enable Browser Notifications
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSendTestNotification}
              id="test-notification-btn"
            >
              Send Test Reminder
            </button>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* 4. BYOK AI COPILOT ENGINE CONFIGURATION                      */}
        {/* ============================================================ */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <Key size={20} className="text-primary" />
            <h2 className="card-title">Bring-Your-Own-Key (BYOK) AI Intelligence</h2>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
            Configure your own private API key for Google Gemini or OpenAI. When no custom key is added, PathWise AI uses deterministic intelligence and standard serverless processing.
          </p>

          <form onSubmit={handleSaveAISettings}>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ai-provider">AI Provider</label>
                <select id="ai-provider" className="form-select" value={aiProvider} onChange={handleProviderChange}>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ai-model">AI Model</label>
                <select id="ai-model" className="form-select" value={aiModel} onChange={e => setAiModel(e.target.value)}>
                  {(PROVIDER_MODELS[aiProvider] || []).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="api-key">
                {aiProvider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  className="form-input"
                  placeholder={aiConfig?.hasKey ? '••••••••••••••••••••' : `Enter your ${aiProvider.toUpperCase()} API key`}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ paddingRight: 70 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowKey(!showKey)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11 }}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center', marginTop: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Save AI Settings
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTestConnection}
                disabled={testingConnection || (!apiKey && !aiConfig?.hasKey)}
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
              {aiConfig?.hasKey && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleRemoveApiKey}
                >
                  <Trash2 size={13} /> Remove Custom Key
                </button>
              )}
            </div>

            {testResult && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: testResult.success ? 'var(--color-success-light)' : 'var(--color-error-light)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: testResult.success ? 'var(--color-success)' : 'var(--color-error)' }}>
                {testResult.message}
              </div>
            )}
          </form>
        </Card>

        {/* ============================================================ */}
        {/* 5. DANGER ZONE / DATA RESET                                  */}
        {/* ============================================================ */}
        <Card style={{ borderColor: 'rgba(220, 38, 38, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                Reset Local Cache & Practice State
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Clears cached sessions and resets learning targets to baseline.
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setResetConfirmOpen(true)}>
              Reset Learning State
            </button>
          </div>
        </Card>

      </div>

      {/* ============================================================ */}
      {/* ROADMAP ADAPTATION CONFIRMATION MODAL                        */}
      {/* ============================================================ */}
      {adaptationModalOpen && pendingCareerGoal && (
        <Modal
          isOpen={adaptationModalOpen}
          onClose={() => setAdaptationModalOpen(false)}
          title="Career Destination Changed"
          size="md"
        >
          <div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
              You updated your target career to <strong>{pendingCareerGoal.jobRole}</strong> targeting <strong>{pendingCareerGoal.country}</strong>.
            </p>
            <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 2 }}>
                💡 Recommendation:
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', margin: 0 }}>
                PathWise recommends regenerating your personalized FutureForge roadmap and daily targets to align with {pendingCareerGoal.jobRole} requirements in {pendingCareerGoal.country}.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleApplyRoadmapAdaptation(false)}
              >
                Keep Current Roadmap
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleApplyRoadmapAdaptation(true)}
              >
                Update Roadmap 🚀
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Learning State"
        message="Are you sure you want to reset your local session data? Your account credentials and core profile will be retained."
        confirmLabel="Reset State"
        danger
      />
    </AppLayout>
  );
}
