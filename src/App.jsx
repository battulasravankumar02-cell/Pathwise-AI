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
import Exams from './pages/Exams.jsx';
import Analytics from './pages/Analytics.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import StudyVault from './pages/StudyVault.jsx';
import Settings from './pages/Settings.jsx';

// Root Router: shows Home if authenticated, or Landing Page if visitor
function RootRoute() {
  const { user } = useAuth();
  return user ? <Home /> : <LandingPage />;
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public-only Route Component (redirect to home if already logged in)
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
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
            
            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

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
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
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
