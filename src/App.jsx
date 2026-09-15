import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import Onboarding from './pages/onboarding/Onboarding.jsx';
import Academic from './pages/Academic.jsx';
import GoalCareer from './pages/GoalCareer.jsx';
import Roadmap from './pages/Roadmap.jsx';
import SkillQuiz from './pages/SkillQuiz.jsx';
import Targets from './pages/Targets.jsx';
import StudyTimer from './pages/StudyTimer.jsx';
import Habits from './pages/Habits.jsx';
import CalendarPage from './pages/Calendar.jsx';
import Assignments from './pages/Assignments.jsx';
import Learn from './pages/Learn.jsx';
import Analytics from './pages/Analytics.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import StudyVault from './pages/StudyVault.jsx';
import Settings from './pages/Settings.jsx';

// Root Router: shows Home if onboarded, Onboarding if not, or Landing Page if visitor
function RootRoute() {
  const { user } = useAuth();
  const { profile, profileLoading } = useApp();

  if (!user) {
    return <LandingPage />;
  }

  if (profileLoading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p className="loading-state-text">Loading NexGuide AI workspace...</p>
      </div>
    );
  }

  if (!profile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Home />;
}

// Protected Route Component: requires auth AND completed onboarding
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const { profile, profileLoading } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p className="loading-state-text">Loading NexGuide AI...</p>
      </div>
    );
  }

  if (!profile?.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// Dedicated Onboarding Route: requires auth, accessible before onboarding completes
function OnboardingRoute() {
  const { user } = useAuth();
  const { profileLoading } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p className="loading-state-text">Preparing Onboarding...</p>
      </div>
    );
  }

  return <Onboarding />;
}

// Public-only Route Component (redirect to home/onboarding if already logged in)
function PublicRoute({ children }) {
  const { user } = useAuth();
  const { profile, profileLoading } = useApp();

  if (user) {
    if (profileLoading) {
      return (
        <div className="loading-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
          <div className="loading-spinner"></div>
          <p className="loading-state-text">Loading NexGuide AI...</p>
        </div>
      );
    }
    if (!profile?.onboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Onboarding Flow */}
            <Route path="/onboarding" element={<OnboardingRoute />} />

            {/* Main Application Protected Routes */}
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/futureforge" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/skill-quiz" element={<ProtectedRoute><SkillQuiz /></ProtectedRoute>} />
            <Route path="/goal-career" element={<ProtectedRoute><GoalCareer /></ProtectedRoute>} />
            <Route path="/targets" element={<ProtectedRoute><Targets /></ProtectedRoute>} />
            <Route path="/timer" element={<ProtectedRoute><StudyTimer /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/academic" element={<ProtectedRoute><Academic /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/study-vault" element={<ProtectedRoute><StudyVault /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
