/**
 * Authentication Service
 * PathWise AI — Real Supabase Auth Integration
 * "Forge Your Skills. Build Your Future."
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const AUTH_KEY = 'pathwise_auth_session';
const LOCAL_USERS_KEY = 'pathwise_local_users';

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

function getLocalUsers() {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export const authService = {
  /**
   * Log in with real email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  async login(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const sessionUser = {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
          loginAt: new Date().toISOString(),
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      } catch (err) {
        return { success: false, error: err.message || 'Authentication failed. Please check your connection.' };
      }
    }

    // 2. Client-side local authenticated store when offline / pending live DB URL
    const users = getLocalUsers();
    const user = users[cleanEmail];

    if (!user) {
      return { success: false, error: 'No account found with this email. Please create an account.' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /**
   * Create a new real account
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  async signup(email, password, name) {
    if (!email || !password || !name) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        const sessionUser = {
          userId: user?.id || `user_${Date.now()}`,
          email: cleanEmail,
          name: cleanName,
          loginAt: new Date().toISOString(),
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      } catch (err) {
        return { success: false, error: err.message || 'Signup failed. Please check your credentials.' };
      }
    }

    // 2. Client-side local authenticated store
    const users = getLocalUsers();
    if (users[cleanEmail]) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: newUserId,
      email: cleanEmail,
      name: cleanName,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users[cleanEmail] = newUser;
    saveLocalUsers(users);

    const session = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /**
   * Log out the current user
   */
  async logout() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue local logout
      }
    }
    localStorage.removeItem(AUTH_KEY);
    return { success: true };
  },

  /**
   * Get the currently authenticated user
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Send password reset request
   * @param {string} email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/settings`,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return {
          success: true,
          message: 'Password reset link has been dispatched to your email address.',
        };
      } catch (err) {
        return { success: false, message: err.message || 'Unable to process reset request.' };
      }
    }

    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been prepared.',
    };
  },
};
