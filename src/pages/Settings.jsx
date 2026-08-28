import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Card, Badge, SectionHeader, Alert, ConfirmDialog } from '../components/ui/index.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { dataService } from '../services/dataService.js';
import { testAIConnection } from '../services/aiService.js';
import { Moon, Sun, Sparkles, Key, RefreshCw, User, CheckCircle, AlertCircle, Trash2, Globe } from 'lucide-react';

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

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, showToast, refreshProfile, profile, careerGoal } = useApp();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || profile?.name || 'Alex Chen',
    email: user?.email || 'student@pathwise.ai',
    college: profile?.college || 'Institute of Technology',
    course: profile?.course || 'B.Tech / Computer Science',
    year: profile?.year || '3rd Year',
    jobRole: careerGoal?.jobRole || 'Software Engineer',
    country: careerGoal?.country || 'Germany',
  });

  // BYOK AI Configuration State
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadAI() {
      const config = await dataService.getAISettings(user.userId);
      if (config) {
        setAiConfig(config);
        setAiProvider(config.provider || 'gemini');
        setAiModel(config.model || 'gemini-1.5-flash');
        if (config.hasKey) {
          setApiKey(config.maskedKey || '');
        }
      }
    }
    loadAI();
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
      await dataService.saveProfile(user.userId, {
        name: profileForm.name,
        college: profileForm.college,
        course: profileForm.course,
        year: profileForm.year,
      });
      await dataService.saveCareerGoal(user.userId, {
        jobRole: profileForm.jobRole,
        country: profileForm.country,
      });
      await refreshProfile();
    }
    showToast('Profile & Career parameters updated successfully!', 'success');
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
        title="Settings & Preferences ⚙️"
        subtitle="Manage your profile, appearances, and Bring-Your-Own-Key (BYOK) AI intelligence settings"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', maxWidth: 840 }}>
        {/* Student Profile Settings */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <User size={20} className="text-primary" />
            <h2 className="card-title">Student Profile & Career Target</h2>
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
                  value={profileForm.course}
                  onChange={e => setProfileForm({ ...profileForm, course: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="year">Academic Stage / Year</label>
                <input
                  id="year"
                  type="text"
                  className="form-input"
                  value={profileForm.year}
                  onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="job-role">Target Career Role</label>
                <input
                  id="job-role"
                  type="text"
                  className="form-input"
                  value={profileForm.jobRole}
                  onChange={e => setProfileForm({ ...profileForm, jobRole: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="country">Target Country</label>
                <input
                  id="country"
                  type="text"
                  className="form-input"
                  value={profileForm.country}
                  onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" id="save-profile-btn" style={{ marginTop: 'var(--space-2)' }}>
              Save Profile Changes
            </button>
          </form>
        </Card>

        {/* Appearance & Theme */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
            <h2 className="card-title">Appearance & Theme</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Color Mode</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Current UI theme: <strong>{theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</strong>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme} id="toggle-theme-settings-btn">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </Card>

        {/* BYOK AI / LLM Configuration */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Sparkles size={20} className="text-primary" />
              <h2 className="card-title">AI / LLM Configuration (BYOK)</h2>
            </div>
            {aiConfig?.hasKey && <Badge variant="success">Custom Key Active</Badge>}
          </div>

          <Alert type="info">
            PathWise AI comes configured with intelligent learning copilot capabilities out-of-the-box. You can optionally plug in your own API key (Bring Your Own Key) for custom provider model reasoning. (Note: Web Search uses developer-managed Groq environment configuration).
          </Alert>

          <form onSubmit={handleSaveAISettings} style={{ marginTop: 'var(--space-5)' }}>
            <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              {/* Provider Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="ai-provider">AI Provider</label>
                <select
                  id="ai-provider"
                  className="form-select"
                  value={aiProvider}
                  onChange={handleProviderChange}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              {/* Model Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="ai-model">Model</label>
                <select
                  id="ai-model"
                  className="form-select"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                >
                  {(PROVIDER_MODELS[aiProvider] || []).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Masked API Key Input with Toggle */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="ai-api-key">
                Provider API Key ({aiProvider.toUpperCase()})
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  id="ai-api-key"
                  type={showKey ? 'text' : 'password'}
                  className="form-input"
                  placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                  style={{ fontFamily: showKey ? 'inherit' : 'monospace' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowKey(!showKey)}
                  style={{ minWidth: 64 }}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <span className="form-help">
                Keys are stored securely in browser memory and are never exposed in client bundles.
              </span>
            </div>

            {/* Test Connection Result Feedback */}
            {testResult && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <Alert type={testResult.success ? 'success' : 'error'}>
                  {testResult.message}
                </Alert>
              </div>
            )}

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestConnection}
                disabled={testingConnection || !apiKey}
                id="test-ai-connection-btn"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                id="save-ai-settings-btn"
              >
                Save AI Settings
              </button>

              {(aiConfig?.hasKey || apiKey) && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleRemoveApiKey}
                  style={{ color: 'var(--color-error)' }}
                  id="remove-api-key-btn"
                >
                  <Trash2 size={14} /> Remove API Key
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Data Reset */}
        <Card style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <RefreshCw size={20} color="var(--color-error)" />
            <h2 className="card-title" style={{ color: 'var(--color-error)' }}>Data & Workspace Reset</h2>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Reset your personal student workspace records back to fresh state (clears custom study sessions, targets, and quiz logs).
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setResetConfirmOpen(true)}
            id="reset-demo-data-btn"
          >
            Reset Workspace Data
          </button>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Personal Workspace"
        message="Are you sure you want to reset your learning workspace records? This action cannot be undone."
        confirmLabel="Reset Data"
        danger
      />
    </AppLayout>
  );
}

