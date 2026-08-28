import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { dataService } from '../services/dataService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('studypulse_theme') || 'light');
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [streak, setStreak] = useState(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studypulse_theme', theme);
  }, [theme]);

  // Load core data on user change
  useEffect(() => {
    if (!user) return;

    async function loadCoreData() {
      const [p, r, s, n] = await Promise.all([
        dataService.getStudentProfile(user.userId),
        dataService.getRoadmap(user.userId),
        dataService.getStreak(user.userId),
        dataService.getNotifications(user.userId),
      ]);
      setProfile(p);
      setRoadmap(r);
      setStreak(s);
      setNotifications(n || []);
    }

    loadCoreData();
  }, [user]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshStreak = useCallback(async () => {
    if (!user) return;
    const s = await dataService.getStreak(user.userId);
    setStreak(s);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await dataService.getStudentProfile(user.userId);
    setProfile(p);
  }, [user]);

  const refreshRoadmap = useCallback(async () => {
    if (!user) return;
    const r = await dataService.getRoadmap(user.userId);
    setRoadmap(r);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      toasts, showToast, dismissToast,
      sidebarOpen, setSidebarOpen,
      notifications, setNotifications, unreadCount,
      profile, setProfile, refreshProfile,
      roadmap, setRoadmap, refreshRoadmap,
      streak, setStreak, refreshStreak,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
