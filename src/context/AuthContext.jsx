import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { dataService } from '../services/dataService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      dataService.init(currentUser.userId, currentUser.isDemo);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      dataService.init(result.user.userId, result.user.isDemo);
    }
    return result;
  }, []);

  const signup = useCallback(async (email, password, name) => {
    const result = await authService.signup(email, password, name);
    if (result.success) {
      setUser(result.user);
      dataService.init(result.user.userId, false);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const loginAsDemo = useCallback(async () => {
    const result = await authService.loginAsDemo();
    if (result.success) {
      setUser(result.user);
      dataService.init(result.user.userId, true);
    }
    return result;
  }, []);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p className="loading-state-text">Loading PathWise AI...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginAsDemo, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
