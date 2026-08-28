/**
 * Data Service Abstraction
 * PathWise AI — Real Data Management with Supabase & Unified Calendar Synchronization
 * "Forge Your Skills. Build Your Future."
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { generatePersonalizedRoadmap } from './roadmapGenerator.js';
import { calculatePriorityScore } from './priorityEngine.js';

const PREFIX = 'pathwise_';

function getKey(userId, key) {
  return `${PREFIX}${userId}_${key}`;
}

function getItem(userId, key, defaultValue = null) {
  try {
    const stored = localStorage.getItem(getKey(userId, key));
    if (stored === null) return defaultValue;
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setItem(userId, key, value) {
  try {
    localStorage.setItem(getKey(userId, key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function delay(ms = 100) {
  return new Promise(r => setTimeout(r, ms));
}

export const dataService = {
  // ============================================================
  // INITIALIZATION
  // ============================================================
  init(userId) {
    if (!userId) return;
    const initializedKey = getKey(userId, 'initialized');
    if (!localStorage.getItem(initializedKey)) {
      // Setup default baseline for new user
      const defaultStreak = {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        activityDates: [],
        lastActiveDate: null,
      };
      setItem(userId, 'streak', defaultStreak);
      setItem(userId, 'assignments', []);
      setItem(userId, 'exams', []);
      setItem(userId, 'calendar_events', []);
      setItem(userId, 'study_sessions', []);
      setItem(userId, 'quiz_attempts', []);
      setItem(userId, 'study_vault', []);
      localStorage.setItem(initializedKey, 'true');
    }
  },

  // ============================================================
  // STUDENT PROFILE
  // ============================================================
  async getStudentProfile(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (data && !error) return data;
      } catch {
        // Fallback to local
      }
    }
    return getItem(userId, 'profile', null);
  },

  async saveStudentProfile(userId, profile) {
    if (!userId) return { success: false, error: 'User ID required' };
    const existing = getItem(userId, 'profile', {});
    const updated = {
      ...existing,
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
    };
    setItem(userId, 'profile', updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('student_profiles').upsert({
          user_id: userId,
          name: updated.name,
          email: updated.email || '',
          course: updated.course,
          stream: updated.stream,
          college: updated.college,
          year: updated.year,
          semester: updated.semester,
          graduation_year: updated.graduationYear,
          interests: updated.interests || [],
          skills: updated.skills || [],
          onboarding_complete: updated.onboardingComplete || false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase profile upsert error:', err);
      }
    }

    return { success: true, data: updated };
  },

  // ============================================================
  // CAREER GOAL & FUTUREFORGE INITIALIZATION
  // ============================================================
  async getCareerGoal(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('career_goals')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (data && !error) return data;
      } catch {}
    }
    return getItem(userId, 'career_goal', null);
  },

  async saveCareerGoal(userId, goal) {
    if (!userId) return { success: false };
    const cleanGoal = {
      ...goal,
      userId,
      updatedAt: new Date().toISOString(),
    };
    setItem(userId, 'career_goal', cleanGoal);

    // Automatically generate or update personalized FutureForge Roadmap & Targets
    if (cleanGoal.hasGoal && cleanGoal.jobRole) {
      const generatedRoadmap = generatePersonalizedRoadmap(cleanGoal.jobRole, cleanGoal.country || 'Germany');
      await this.saveRoadmap(userId, generatedRoadmap);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('career_goals').upsert({
          user_id: userId,
          has_goal: cleanGoal.hasGoal,
          job_role: cleanGoal.jobRole,
          specialization: cleanGoal.specialization,
          country: cleanGoal.country,
          industry: cleanGoal.industry,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase career goal upsert error:', err);
      }
    }

    return { success: true, data: cleanGoal };
  },

  // ============================================================
  // FUTUREFORGE ROADMAP
  // ============================================================
  async getRoadmap(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: roadmapData, error } = await supabase
          .from('roadmaps')
          .select('*, roadmap_steps(*)')
          .eq('user_id', userId)
          .single();
        if (roadmapData && !error) return roadmapData;
      } catch {}
    }

    let roadmap = getItem(userId, 'roadmap', null);
    if (!roadmap) {
      // If not yet set, generate default Software Engineer roadmap
      const goal = getItem(userId, 'career_goal', { jobRole: 'Software Engineer', country: 'Germany' });
      roadmap = generatePersonalizedRoadmap(goal.jobRole || 'Software Engineer', goal.country || 'Germany');
      setItem(userId, 'roadmap', roadmap);
      // Also generate daily targets for first stage
      this._seedInitialStageTargets(userId, roadmap);
    }
    return roadmap;
  },

  async saveRoadmap(userId, roadmap) {
    if (!userId) return { success: false };
    setItem(userId, 'roadmap', roadmap);
    this._seedInitialStageTargets(userId, roadmap);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('roadmaps').upsert({
          user_id: userId,
          goal: roadmap.goal,
          country: roadmap.country,
          total_steps: roadmap.totalSteps,
          completed_steps: roadmap.completedSteps,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase roadmap error:', err);
      }
    }

    return { success: true, data: roadmap };
  },

  _seedInitialStageTargets(userId, roadmap) {
    if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) return;
    const activeStep = roadmap.steps.find(s => s.status === 'active') || roadmap.steps[0];
    if (!activeStep || !activeStep.dailyTargets) return;

    const existingTargets = getItem(userId, 'targets', []);
    const today = new Date();
    
    // Check if targets for active step already exist
    const hasActiveStepTargets = existingTargets.some(t => t.stageId === activeStep.id);
    if (!hasActiveStepTargets) {
      const newTargets = activeStep.dailyTargets.map((dt, idx) => {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + idx);
        return {
          id: `tgt-${activeStep.id}-${idx + 1}`,
          stageId: activeStep.id,
          course: activeStep.title,
          title: dt.title,
          description: `Day ${dt.day} practical learning target for ${activeStep.title}.`,
          difficulty: dt.difficulty,
          estimatedDuration: dt.duration,
          status: idx === 0 ? 'in_progress' : 'not_started',
          date: targetDate.toISOString().split('T')[0],
          week: Math.floor(idx / 7) + 1,
        };
      });

      const merged = [...existingTargets, ...newTargets];
      setItem(userId, 'targets', merged);
      // Sync to calendar
      newTargets.forEach(t => {
        this._syncCalendarEvent(userId, 'target', t.id, t.title, t.date, `${t.course} (${t.estimatedDuration}m)`);
      });
    }
  },

  async updateRoadmapStep(userId, stepId, updates) {
    if (!userId) return { success: false };
    const roadmap = await this.getRoadmap(userId);
    if (!roadmap) return { success: false };

    const stepIndex = roadmap.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return { success: false };

    roadmap.steps[stepIndex] = { ...roadmap.steps[stepIndex], ...updates };

    // If step marked completed, auto-unlock next step
    if (updates.status === 'completed') {
      roadmap.steps[stepIndex].progress = 100;
      roadmap.completedSteps = roadmap.steps.filter(s => s.status === 'completed').length;
      
      const nextStep = roadmap.steps[stepIndex + 1];
      if (nextStep) {
        nextStep.status = 'active';
        roadmap.currentStepIndex = stepIndex + 1;
        // Generate targets for next step
        this._seedInitialStageTargets(userId, roadmap);
      }
    }

    setItem(userId, 'roadmap', roadmap);
    return { success: true, data: roadmap };
  },

  // ============================================================
  // LEARNING TARGETS (DAILY, WEEKLY, MONTHLY, YEARLY)
  // ============================================================
  async getTargets(userId, filters = {}) {
    if (!userId) return [];
    let targets = getItem(userId, 'targets', []);
    if (targets.length === 0) {
      const roadmap = await this.getRoadmap(userId);
      this._seedInitialStageTargets(userId, roadmap);
      targets = getItem(userId, 'targets', []);
    }

    let filtered = [...targets];
    if (filters.date) {
      filtered = filtered.filter(t => t.date === filters.date);
    }
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    return filtered;
  },

  async completeTarget(userId, targetId) {
    if (!userId || !targetId) return { success: false };
    const targets = getItem(userId, 'targets', []);
    const target = targets.find(t => t.id === targetId);
    if (!target) return { success: false, error: 'Target not found' };

    target.status = 'completed';
    target.completedAt = new Date().toISOString();
    setItem(userId, 'targets', targets);

    // 1. Record activity date for Habit & Streak
    await this.recordActivityDate(userId, new Date().toISOString().split('T')[0]);

    // 2. Update roadmap progress proportionally
    const roadmap = await this.getRoadmap(userId);
    if (roadmap) {
      const activeStep = roadmap.steps.find(s => s.id === target.stageId) || roadmap.steps.find(s => s.status === 'active');
      if (activeStep) {
        const stepTargets = targets.filter(t => t.stageId === activeStep.id);
        const completedCount = stepTargets.filter(t => t.status === 'completed').length;
        const newProgress = Math.min(100, Math.round((completedCount / (stepTargets.length || 1)) * 100));
        await this.updateRoadmapStep(userId, activeStep.id, { progress: newProgress });
      }
    }

    return { success: true, data: target };
  },

  async updateTargetStatus(userId, targetId, status) {
    if (!userId || !targetId) return { success: false };
    const targets = getItem(userId, 'targets', []);
    const target = targets.find(t => t.id === targetId);
    if (!target) return { success: false };

    target.status = status;
    setItem(userId, 'targets', targets);
    return { success: true, data: target };
  },

  // ============================================================
  // SMART ASSIGNMENT TRACKER
  // ============================================================
  async getAssignments(userId) {
    if (!userId) return [];
    return getItem(userId, 'assignments', []);
  },

  async saveAssignment(userId, assignment) {
    if (!userId) return { success: false };
    const assignments = getItem(userId, 'assignments', []);
    const priority = calculatePriorityScore(assignment);

    const newAssignment = {
      ...assignment,
      id: assignment.id || `asg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      priorityScore: priority.score,
      priorityCategory: priority.category,
      status: assignment.status || 'pending',
      createdAt: assignment.createdAt || new Date().toISOString(),
    };

    const existingIndex = assignments.findIndex(a => a.id === newAssignment.id);
    if (existingIndex >= 0) {
      assignments[existingIndex] = newAssignment;
    } else {
      assignments.push(newAssignment);
    }
    setItem(userId, 'assignments', assignments);

    // UNIFIED CALENDAR SYNC: Automatically synchronize deadline into calendar
    this._syncCalendarEvent(
      userId,
      'assignment',
      newAssignment.id,
      `📝 ${newAssignment.title} Due`,
      newAssignment.deadline,
      `${newAssignment.subject || 'Assignment'} — Priority: ${newAssignment.priorityCategory}`
    );

    return { success: true, data: newAssignment };
  },

  async completeAssignment(userId, assignmentId) {
    if (!userId || !assignmentId) return { success: false };
    const assignments = getItem(userId, 'assignments', []);
    const item = assignments.find(a => a.id === assignmentId);
    if (item) {
      item.status = 'completed';
      item.completedAt = new Date().toISOString();
      setItem(userId, 'assignments', assignments);
      await this.recordActivityDate(userId, new Date().toISOString().split('T')[0]);
    }
    return { success: true };
  },

  async deleteAssignment(userId, assignmentId) {
    if (!userId || !assignmentId) return { success: false };
    let assignments = getItem(userId, 'assignments', []);
    assignments = assignments.filter(a => a.id !== assignmentId);
    setItem(userId, 'assignments', assignments);

    // Remove from calendar
    this._removeCalendarEvent(userId, assignmentId);
    return { success: true };
  },

  // ============================================================
  // EXAM PLANNER
  // ============================================================
  async getExams(userId) {
    if (!userId) return [];
    return getItem(userId, 'exams', []);
  },

  async saveExam(userId, exam) {
    if (!userId) return { success: false };
    const exams = getItem(userId, 'exams', []);
    const newExam = {
      ...exam,
      id: exam.id || `exm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      createdAt: exam.createdAt || new Date().toISOString(),
    };

    const existingIndex = exams.findIndex(e => e.id === newExam.id);
    if (existingIndex >= 0) {
      exams[existingIndex] = newExam;
    } else {
      exams.push(newExam);
    }
    setItem(userId, 'exams', exams);

    // UNIFIED CALENDAR SYNC: Automatically synchronize exam date into calendar
    this._syncCalendarEvent(
      userId,
      'exam',
      newExam.id,
      `📚 ${newExam.name}`,
      newExam.date,
      `${newExam.type || 'Exam'} (${newExam.syllabus || 'Syllabus scheduled'})`
    );

    return { success: true, data: newExam };
  },

  async deleteExam(userId, examId) {
    if (!userId || !examId) return { success: false };
    let exams = getItem(userId, 'exams', []);
    exams = exams.filter(e => e.id !== examId);
    setItem(userId, 'exams', exams);

    // Remove from calendar
    this._removeCalendarEvent(userId, examId);
    return { success: true };
  },

  // ============================================================
  // UNIFIED CALENDAR EVENT SYSTEM
  // ============================================================
  async getCalendarEvents(userId) {
    if (!userId) return [];
    const stored = getItem(userId, 'calendar_events', []);
    return stored;
  },

  _syncCalendarEvent(userId, eventType, referenceId, title, eventDate, detail) {
    if (!userId || !eventDate) return;
    const events = getItem(userId, 'calendar_events', []);
    const existingIdx = events.findIndex(e => e.referenceId === referenceId);

    const eventObj = {
      id: existingIdx >= 0 ? events[existingIdx].id : `cal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      type: eventType,
      referenceId,
      title,
      date: eventDate,
      detail: detail || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      events[existingIdx] = eventObj;
    } else {
      events.push(eventObj);
    }
    setItem(userId, 'calendar_events', events);
  },

  _removeCalendarEvent(userId, referenceId) {
    if (!userId || !referenceId) return;
    let events = getItem(userId, 'calendar_events', []);
    events = events.filter(e => e.referenceId !== referenceId);
    setItem(userId, 'calendar_events', events);
  },

  // ============================================================
  // HABITS, STREAKS & ACTIVITY LOGS
  // ============================================================
  async getStreak(userId) {
    if (!userId) return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, activityDates: [] };
    return getItem(userId, 'streak', {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      activityDates: [],
      lastActiveDate: null,
    });
  },

  async recordActivityDate(userId, dateStr) {
    if (!userId || !dateStr) return;
    const streak = await this.getStreak(userId);
    const dateSet = new Set(streak.activityDates || []);

    if (!dateSet.has(dateStr)) {
      dateSet.add(dateStr);
      const sortedDates = Array.from(dateSet).sort();
      
      // Calculate current consecutive streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check consecutive days backward from today or yesterday
      let checkDate = new Date(today);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const hasToday = dateSet.has(today.toISOString().split('T')[0]);
      const hasYesterday = dateSet.has(yesterday.toISOString().split('T')[0]);

      if (hasToday || hasYesterday) {
        let cursor = hasToday ? today : yesterday;
        while (true) {
          const cStr = cursor.toISOString().split('T')[0];
          if (dateSet.has(cStr)) {
            currentStreak++;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
      }

      const longestStreak = Math.max(streak.longestStreak || 0, currentStreak);

      const updated = {
        currentStreak,
        longestStreak,
        totalActiveDays: dateSet.size,
        activityDates: sortedDates,
        lastActiveDate: dateStr,
      };

      setItem(userId, 'streak', updated);
    }
  },

  // ============================================================
  // STOPWATCH / STUDY SESSIONS
  // ============================================================
  async getStudySessions(userId) {
    if (!userId) return [];
    return getItem(userId, 'study_sessions', []);
  },

  async saveStudySession(userId, session) {
    if (!userId || !session) return { success: false };
    const sessions = getItem(userId, 'study_sessions', []);
    const newSession = {
      ...session,
      id: `ses_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    sessions.unshift(newSession);
    setItem(userId, 'study_sessions', sessions);

    // Record activity date
    if (session.date) {
      await this.recordActivityDate(userId, session.date);
    }

    return { success: true, data: newSession };
  },

  // ============================================================
  // SKILL QUIZ ATTEMPTS & SCORES
  // ============================================================
  async getQuizAttempts(userId) {
    if (!userId) return [];
    return getItem(userId, 'quiz_attempts', []);
  },

  async saveQuizAttempt(userId, attempt) {
    if (!userId || !attempt) return { success: false };
    const attempts = getItem(userId, 'quiz_attempts', []);
    const newAttempt = {
      ...attempt,
      id: `qza_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      attemptedAt: new Date().toISOString(),
    };
    attempts.unshift(newAttempt);
    setItem(userId, 'quiz_attempts', attempts);

    // Record activity
    await this.recordActivityDate(userId, new Date().toISOString().split('T')[0]);

    return { success: true, data: newAttempt };
  },

  async getLatestQuizScore(userId) {
    const attempts = await this.getQuizAttempts(userId);
    if (attempts.length === 0) return null;
    return attempts[0];
  },

  // ============================================================
  // STUDY VAULT & RESOURCE MANAGEMENT
  // ============================================================
  async getStudyVaultResources(userId) {
    if (!userId) return [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('study_vault_resources')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data;
      } catch (err) {
        console.error('Supabase getStudyVaultResources error:', err);
      }
    }
    return getItem(userId, 'study_vault', []);
  },

  async saveStudyVaultResource(userId, resource) {
    if (!userId || !resource) return { success: false };
    const vault = getItem(userId, 'study_vault', []);
    const newResource = {
      ...resource,
      id: resource.id || `vlt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      savedAt: resource.savedAt || new Date().toISOString().split('T')[0],
      createdAt: resource.createdAt || new Date().toISOString(),
    };
    
    const existingIndex = vault.findIndex(r => r.id === newResource.id);
    if (existingIndex >= 0) {
      vault[existingIndex] = newResource;
    } else {
      vault.unshift(newResource);
    }
    setItem(userId, 'study_vault', vault);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_vault_resources').upsert({
          user_id: userId,
          title: newResource.title,
          url: newResource.url || null,
          resource_type: newResource.type || 'Notes',
          subject: newResource.subject || null,
          skill: newResource.skill || null,
          notes: newResource.notes || null,
          storage_path: newResource.storagePath || null,
        });
      } catch (err) {
        console.error('Supabase saveStudyVaultResource error:', err);
      }
    }

    return { success: true, data: newResource };
  },

  async deleteStudyVaultResource(userId, resourceId) {
    if (!userId || !resourceId) return { success: false };
    let vault = getItem(userId, 'study_vault', []);
    const target = vault.find(r => r.id === resourceId);
    
    // 1. Delete from Supabase Storage if storage_path is present
    if (isSupabaseConfigured && supabase && target?.storagePath) {
      try {
        await supabase.storage.from('resources').remove([target.storagePath]);
      } catch (storageErr) {
        console.warn('Storage deletion error (non-fatal):', storageErr);
      }
    }

    // 2. Delete from Supabase Database
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('study_vault_resources')
          .delete()
          .eq('user_id', userId)
          .eq('id', resourceId);
      } catch (dbErr) {
        console.error('Database resource deletion error:', dbErr);
      }
    }

    // 3. Remove from local store
    vault = vault.filter(r => r.id !== resourceId);
    setItem(userId, 'study_vault', vault);
    return { success: true };
  },

  // ============================================================
  // AI / LLM CONFIGURATION (BYOK)
  // ============================================================
  async getAISettings(userId) {
    if (!userId) return null;
    return getItem(userId, 'ai_settings', {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      hasKey: false,
      maskedKey: '',
      status: 'default',
    });
  },

  async saveAISettings(userId, settings) {
    if (!userId) return { success: false };
    const masked = settings.apiKey 
      ? `••••••••${settings.apiKey.slice(-4)}`
      : settings.maskedKey || '';

    const safeConfig = {
      provider: settings.provider || 'gemini',
      model: settings.model || 'gemini-1.5-flash',
      hasKey: Boolean(settings.apiKey || settings.hasKey),
      maskedKey: masked,
      status: 'connected',
      updatedAt: new Date().toISOString(),
    };

    if (settings.apiKey) {
      try {
        sessionStorage.setItem(`pw_ai_key_${userId}`, settings.apiKey);
      } catch {}
    }

    setItem(userId, 'ai_settings', safeConfig);
    return { success: true, data: safeConfig };
  },

  async removeAISettings(userId) {
    if (!userId) return { success: false };
    try {
      sessionStorage.removeItem(`pw_ai_key_${userId}`);
    } catch {}
    setItem(userId, 'ai_settings', {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      hasKey: false,
      maskedKey: '',
      status: 'default',
    });
    return { success: true };
  },

  // ============================================================
  // ACADEMIC SUBJECTS & ATTENDANCE
  // ============================================================
  async getSubjects(userId) {
    if (!userId) return [];
    return getItem(userId, 'subjects', [
      { id: 'sub-1', name: 'Data Structures & Algorithms', code: 'CS301', units: 5, topicCount: 28, complexityScore: 85, effortScore: 80, conceptualDensity: 90, practicalDifficulty: 85, progress: 45, reason: 'High conceptual depth in recursive algorithms and dynamic programming.' },
      { id: 'sub-2', name: 'Database Management Systems', code: 'CS302', units: 4, topicCount: 22, complexityScore: 65, effortScore: 60, conceptualDensity: 70, practicalDifficulty: 65, progress: 60, reason: 'Moderate complexity focusing on relational normalization and SQL transaction isolation.' },
      { id: 'sub-3', name: 'Computer Networks', code: 'CS303', units: 4, topicCount: 24, complexityScore: 70, effortScore: 65, conceptualDensity: 75, practicalDifficulty: 60, progress: 30, reason: 'Protocol stack and TCP flow control involve detailed architectural memorization.' },
    ]);
  },

  async getAttendance(userId) {
    if (!userId) return null;
    return getItem(userId, 'attendance', {
      totalWorkingDays: 78,
      presentDays: 61,
      requiredPercentage: 75,
      currentPercentage: 78.2,
      subjects: [
        { name: 'Data Structures & Algorithms', present: 22, total: 26, percentage: 84.6 },
        { name: 'Database Management Systems', present: 18, total: 24, percentage: 75.0 },
        { name: 'Computer Networks', present: 21, total: 28, percentage: 75.0 },
      ],
    });
  },

  async saveAttendance(userId, attendanceData) {
    if (!userId || !attendanceData) return { success: false };
    setItem(userId, 'attendance', attendanceData);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attendance_records').upsert({
          user_id: userId,
          total_working_days: attendanceData.totalWorkingDays,
          present_days: attendanceData.presentDays,
          required_percentage: attendanceData.requiredPercentage,
          subject_data: attendanceData.subjects || [],
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase attendance error:', err);
      }
    }
    return { success: true, data: attendanceData };
  },

  // ============================================================
  // ACHIEVEMENTS SYSTEM (100% REAL ACTIVITY DRIVEN)
  // ============================================================
  async getAchievements(userId) {
    if (!userId) return [];
    const [streak, targets, quizAttempts, sessions, vault] = await Promise.all([
      this.getStreak(userId),
      this.getTargets(userId),
      this.getQuizAttempts(userId),
      this.getStudySessions(userId),
      this.getStudyVaultResources(userId),
    ]);

    const completedTargetsCount = targets.filter(t => t.status === 'completed').length;
    const currentStreak = streak?.currentStreak || 0;
    const longestStreak = streak?.longestStreak || 0;
    const bestStreak = Math.max(currentStreak, longestStreak);
    const highQuizScore = quizAttempts.some(q => (q.score || 0) >= 80);
    const hasStudySession = sessions.length > 0;
    const hasVaultItem = vault.length > 0;

    return [
      {
        id: 'ach-1',
        title: 'First Target Achieved',
        description: 'Complete your first learning target in FutureForge.',
        emoji: '🎯',
        unlocked: completedTargetsCount >= 1,
        unlockedAt: completedTargetsCount >= 1 ? (targets.find(t => t.status === 'completed')?.completedAt || new Date().toISOString()) : null,
      },
      {
        id: 'ach-2',
        title: '3-Day Consistency',
        description: 'Maintain an active learning streak for 3 consecutive days.',
        emoji: '🔥',
        unlocked: bestStreak >= 3,
        unlockedAt: bestStreak >= 3 ? new Date().toISOString() : null,
      },
      {
        id: 'ach-3',
        title: 'Quiz Scholar',
        description: 'Score 80% or higher on a diagnostic skill quiz.',
        emoji: '🧠',
        unlocked: highQuizScore,
        unlockedAt: highQuizScore ? (quizAttempts.find(q => q.score >= 80)?.attemptedAt || new Date().toISOString()) : null,
      },
      {
        id: 'ach-4',
        title: 'Vault Architect',
        description: 'Save notes or reference resources in your Study Vault.',
        emoji: '📁',
        unlocked: hasVaultItem,
        unlockedAt: hasVaultItem ? new Date().toISOString() : null,
      },
      {
        id: 'ach-5',
        title: 'Deep Focus Master',
        description: 'Log a focused deep-work study session using the Study Timer.',
        emoji: '⏱️',
        unlocked: hasStudySession,
        unlockedAt: hasStudySession ? (sessions[0]?.createdAt || new Date().toISOString()) : null,
      },
      {
        id: 'ach-6',
        title: '7-Day Flame Legend',
        description: 'Maintain a 7-day unbroken study streak.',
        emoji: '🏆',
        unlocked: bestStreak >= 7,
        unlockedAt: bestStreak >= 7 ? new Date().toISOString() : null,
      },
    ];
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  async getNotifications(userId) {
    if (!userId) return [];
    return getItem(userId, 'notifications', [
      { id: 'notif-1', title: 'Daily Learning Target Active', message: 'Your daily target is ready in FutureForge.', time: '10m ago', read: false, type: 'target' },
      { id: 'notif-2', title: 'Streak Active 🔥', message: 'Complete a study target today to maintain your consistency streak.', time: '1h ago', read: false, type: 'streak' },
    ]);
  },

  // ============================================================
  // ANALYTICS COMPILATION (100% REAL USER ACTIVITY DATA)
  // ============================================================
  async getAnalytics(userId) {
    if (!userId) return null;
    const [targets, sessions, quizAttempts, assignments, streak, roadmap, vault] = await Promise.all([
      this.getTargets(userId),
      this.getStudySessions(userId),
      this.getQuizAttempts(userId),
      this.getAssignments(userId),
      this.getStreak(userId),
      this.getRoadmap(userId),
      this.getStudyVaultResources(userId),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTargets = targets.filter(t => t.date === todayStr);
    const todayCompleted = todayTargets.filter(t => t.status === 'completed').length;

    // Study time calculations
    const todaySeconds = sessions.filter(s => s.date === todayStr || s.sessionDate === todayStr).reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Compute past 7 days study hours
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const studyByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      const daySecs = sessions
        .filter(s => (s.date === dStr || s.sessionDate === dStr))
        .reduce((sum, s) => sum + (s.duration || 0), 0);
      studyByDay.push({
        day: dayName,
        date: dStr,
        hours: parseFloat((daySecs / 3600).toFixed(1)),
        seconds: daySecs,
      });
    }

    // Compute weekly targets completion rate from real targets
    const weeklyTargetsData = [];
    const totalTargetsCount = targets.length;
    if (totalTargetsCount > 0) {
      const weekGroups = {};
      targets.forEach(t => {
        const w = t.week || 1;
        if (!weekGroups[w]) weekGroups[w] = { total: 0, completed: 0 };
        weekGroups[w].total++;
        if (t.status === 'completed') weekGroups[w].completed++;
      });
      Object.keys(weekGroups).sort((a, b) => Number(a) - Number(b)).forEach(w => {
        const g = weekGroups[w];
        weeklyTargetsData.push({
          week: `Week ${w}`,
          completed: g.completed,
          total: g.total,
          completionRate: Math.round((g.completed / (g.total || 1)) * 100),
        });
      });
    }

    // Real skill progress mapped from roadmap steps
    const skillProgress = (roadmap?.steps || []).map(step => ({
      skill: step.title,
      progress: step.progress || 0,
      status: step.status,
    }));

    // Real quiz scores history
    const quizScores = quizAttempts.slice(0, 7).reverse().map(qa => ({
      topic: qa.topic?.length > 18 ? `${qa.topic.slice(0, 16)}...` : qa.topic,
      score: qa.score,
      date: (qa.attemptedAt || '').split('T')[0],
    }));

    const weekSeconds = studyByDay.reduce((sum, d) => sum + d.seconds, 0);

    return {
      streak,
      rawTargets: targets,
      rawSessions: sessions,
      rawAssignments: assignments,
      targets: {
        todayCompleted,
        todayTotal: todayTargets.length,
        totalCompleted: targets.filter(t => t.status === 'completed').length,
        total: targets.length,
      },
      studyTime: {
        today: todaySeconds,
        week: weekSeconds,
        total: totalSeconds,
      },
      studyTimeByDay: studyByDay,
      weeklyTargetsProgress: weeklyTargetsData,
      skillProgress,
      quizScores,
      assignments: {
        completed: assignments.filter(a => a.status === 'completed').length,
        pending: assignments.filter(a => a.status === 'pending').length,
        overdue: assignments.filter(a => a.status !== 'completed' && a.deadline < todayStr).length,
        total: assignments.length,
      },
      vaultCount: vault.length,
      quizAttempts,
      roadmap,
    };
  },

  // ============================================================
  // DATA RESET FOR AUTHENTICATED USER
  // ============================================================
  resetUserData(userId) {
    if (!userId) return;
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(`${PREFIX}${userId}_`)) {
        localStorage.removeItem(k);
      }
    });
    this.init(userId);
  },
};
