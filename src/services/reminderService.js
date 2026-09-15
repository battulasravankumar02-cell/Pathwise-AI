// ============================================================
// REMINDER SERVICE — REAL INTELLIGENT NOTIFICATION & REMINDER ENGINE
// Connects 100% to real Supabase / local user targets & assignments.
// No fake static data. No unfulfilled timer promises.
// ============================================================

const READ_STORAGE_KEY = 'studypulse_read_reminders';
const SHOWN_STORAGE_KEY = 'studypulse_shown_browser_reminders';

function getReadIds(userId) {
  try {
    const raw = localStorage.getItem(`${READ_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReadIds(userId, ids) {
  try {
    localStorage.setItem(`${READ_STORAGE_KEY}_${userId}`, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to save read reminder ids:', err);
  }
}

function getShownSessionIds() {
  try {
    const raw = sessionStorage.getItem(SHOWN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markShownInSession(id) {
  try {
    const ids = getShownSessionIds();
    if (!ids.includes(id)) {
      ids.push(id);
      sessionStorage.setItem(SHOWN_STORAGE_KEY, JSON.stringify(ids));
    }
  } catch {}
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((d.getTime() - now.getTime()) / (1000 * 3600));
    if (diffHours < 0) {
      const absHours = Math.abs(diffHours);
      if (absHours < 24) return `${absHours}h ago`;
      return `${Math.floor(absHours / 24)}d ago`;
    }
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${Math.floor(diffHours / 24)}d`;
  } catch {
    return 'Upcoming';
  }
}

function formatDeadlineText(dateStr) {
  if (!dateStr) return 'Soon';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today at ${timePart}`;
    if (isTomorrow) return `Tomorrow at ${timePart}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timePart}`;
  } catch {
    return dateStr;
  }
}

export const reminderService = {
  /**
   * Evaluates today's targets and assignments directly from dataService
   * to construct real, non-duplicate in-app and browser notifications.
   */
  async computeReminders(userId, { targets = [], assignments = [] } = {}) {
    if (!userId) return [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const readIds = getReadIds(userId);
    const reminders = [];

    // ------------------------------------------------------------
    // 1. TODAY'S STUDY TOPIC & TARGET REMINDERS
    // ------------------------------------------------------------
    const todayTargets = targets.filter(t => t.date === todayStr);
    const pendingTodayTargets = todayTargets.filter(t => t.status !== 'completed');

    if (pendingTodayTargets.length > 0) {
      // Primary study topic reminder
      const primaryTarget = pendingTodayTargets[0];
      const topicReminderId = `rem_topic_${primaryTarget.id}_${todayStr}`;
      
      reminders.push({
        id: topicReminderId,
        entityId: primaryTarget.id,
        type: 'study_topic',
        title: "Study Reminder",
        subtitle: "Today's Scheduled Topic Ready",
        subject: primaryTarget.course || 'Core Skills',
        topic: primaryTarget.title,
        message: `Your scheduled topic for today is ready.\nSubject: ${primaryTarget.course || 'Core Track'}\nTopic: ${primaryTarget.title}`,
        time: 'Today',
        timestamp: new Date().toISOString(),
        urgency: 'high',
        read: readIds.includes(topicReminderId),
        link: '/targets',
        actionLabel: 'Study Topic Now',
      });

      // Today's target completion reminder
      const targetReminderId = `rem_target_${todayStr}_pending`;
      reminders.push({
        id: targetReminderId,
        type: 'target',
        title: "Today's Target Reminder",
        subtitle: `${pendingTodayTargets.length} Remaining`,
        message: `You have ${pendingTodayTargets.length} target${pendingTodayTargets.length > 1 ? 's' : ''} not yet completed today. Complete them to preserve your streak!`,
        time: 'Today',
        timestamp: new Date().toISOString(),
        urgency: 'medium',
        read: readIds.includes(targetReminderId),
        link: '/targets',
        actionLabel: 'View Targets',
      });
    }

    // ------------------------------------------------------------
    // 2. ASSIGNMENT & DEADLINE REMINDERS
    // ------------------------------------------------------------
    const pendingAssignments = assignments.filter(a => a.status !== 'completed' && a.deadline);

    for (const asg of pendingAssignments) {
      const deadlineDate = new Date(asg.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 3600);

      if (diffHours < 0) {
        // OVERDUE ASSIGNMENT REMINDER
        const overdueId = `rem_asg_overdue_${asg.id}`;
        reminders.push({
          id: overdueId,
          entityId: asg.id,
          type: 'assignment_overdue',
          title: "Overdue Assignment",
          subtitle: asg.subject || 'Assignment',
          subject: asg.subject || 'Coursework',
          message: `Your assignment "${asg.title}" was due on ${formatDeadlineText(asg.deadline)}. Submit or complete it soon.`,
          time: 'Overdue',
          timestamp: asg.deadline,
          urgency: 'urgent',
          read: readIds.includes(overdueId),
          link: '/assignments',
          actionLabel: 'Open Assignment',
        });
      } else if (diffHours <= 48) {
        // DUE SOON (Within 48 hours)
        const dueSoonId = `rem_asg_due_${asg.id}`;
        reminders.push({
          id: dueSoonId,
          entityId: asg.id,
          type: 'assignment_due',
          title: "Assignment Reminder",
          subtitle: `Due ${formatDeadlineText(asg.deadline)}`,
          subject: asg.subject || 'Assignment',
          message: `Your ${asg.subject ? asg.subject + ' ' : ''}assignment "${asg.title}" is due soon.\nDue: ${formatDeadlineText(asg.deadline)}`,
          time: diffHours <= 24 ? 'Due Tomorrow' : 'Due in 2 days',
          timestamp: asg.deadline,
          urgency: 'high',
          read: readIds.includes(dueSoonId),
          link: '/assignments',
          actionLabel: 'Review Assignment',
        });
      } else if (diffHours <= 168) {
        // UPCOMING DEADLINE (Within 7 days)
        const upcomingId = `rem_asg_upcoming_${asg.id}`;
        reminders.push({
          id: upcomingId,
          entityId: asg.id,
          type: 'deadline',
          title: "Upcoming Deadline",
          subtitle: asg.subject || 'Coursework',
          subject: asg.subject || 'Coursework',
          message: `Upcoming deadline for "${asg.title}". Due on ${formatDeadlineText(asg.deadline)}.`,
          time: formatRelativeTime(asg.deadline),
          timestamp: asg.deadline,
          urgency: 'normal',
          read: readIds.includes(upcomingId),
          link: '/assignments',
          actionLabel: 'Plan Ahead',
        });
      }
    }

    // Sort by urgency: urgent -> high -> medium -> normal
    const urgencyOrder = { urgent: 0, high: 1, medium: 2, normal: 3 };
    reminders.sort((a, b) => (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4));

    return reminders;
  },

  /**
   * Mark a single reminder as read.
   */
  markAsRead(userId, reminderId) {
    if (!userId || !reminderId) return;
    const current = getReadIds(userId);
    if (!current.includes(reminderId)) {
      current.push(reminderId);
      saveReadIds(userId, current);
    }
  },

  /**
   * Mark all active reminders as read.
   */
  markAllAsRead(userId, reminderIds = []) {
    if (!userId) return;
    const current = getReadIds(userId);
    const combined = Array.from(new Set([...current, ...reminderIds]));
    saveReadIds(userId, combined);
  },

  // ------------------------------------------------------------
  // BROWSER NOTIFICATION API WRAPPER
  // Safe, compliant with modern browser security policies
  // ------------------------------------------------------------
  isBrowserNotificationSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getBrowserPermission() {
    if (!this.isBrowserNotificationSupported()) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  },

  async requestBrowserPermission() {
    if (!this.isBrowserNotificationSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  },

  sendBrowserNotification(title, options = {}) {
    if (!this.isBrowserNotificationSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return notif;
    } catch (err) {
      console.warn('Browser notification display error:', err);
      return null;
    }
  },

  /**
   * Dispatches eligible high-priority reminders as browser notifications
   * if permission is granted, avoiding duplicate alerts within a session.
   */
  dispatchEligibleBrowserAlerts(reminders = []) {
    if (!this.isBrowserNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;

    const shownIds = getShownSessionIds();
    const urgentItems = reminders.filter(r => (r.urgency === 'urgent' || r.urgency === 'high') && !r.read);

    for (const item of urgentItems) {
      if (!shownIds.includes(item.id)) {
        markShownInSession(item.id);
        this.sendBrowserNotification(item.title, {
          body: item.message.replace(/\n/g, ' — '),
          tag: item.id,
        });
        // Limit to 1 notification popup per cycle to avoid spamming the user
        break;
      }
    }
  },
};
