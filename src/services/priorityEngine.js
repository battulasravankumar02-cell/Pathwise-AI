/**
 * Priority Engine — Assignment priority scoring
 * Score = deadline urgency + difficulty + workload + importance
 * Normalized to 0–100. Deterministic. Transparent.
 */

const WEIGHTS = {
  deadlineUrgency: 0.40,
  difficulty: 0.25,
  workload: 0.15,
  importance: 0.20,
};

/**
 * Calculate priority score for an assignment
 * @param {Object} assignment
 * @returns {{ score: number, category: string, urgencyDays: number }}
 */
export function calculatePriorityScore(assignment) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(assignment.deadline);
  deadline.setHours(0, 0, 0, 0);

  const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  // Deadline urgency: overdue=100, 1 day=95, 2 days=85, 3 days=75...
  let deadlineScore;
  if (daysUntilDeadline < 0) {
    deadlineScore = 100; // Overdue — maximum urgency
  } else if (daysUntilDeadline === 0) {
    deadlineScore = 98;
  } else if (daysUntilDeadline === 1) {
    deadlineScore = 92;
  } else if (daysUntilDeadline <= 3) {
    deadlineScore = 80;
  } else if (daysUntilDeadline <= 7) {
    deadlineScore = 60;
  } else if (daysUntilDeadline <= 14) {
    deadlineScore = 35;
  } else {
    deadlineScore = 15;
  }

  // Difficulty: 1-5 scale → 0-100
  const difficultyScore = ((assignment.difficulty || 3) / 5) * 100;

  // Workload: hours → score (1hr=20, 2=35, 3=50, 5=70, 8+=90)
  const hours = assignment.estimatedHours || 2;
  let workloadScore;
  if (hours <= 1) workloadScore = 20;
  else if (hours <= 2) workloadScore = 35;
  else if (hours <= 3) workloadScore = 50;
  else if (hours <= 5) workloadScore = 70;
  else if (hours <= 8) workloadScore = 85;
  else workloadScore = 95;

  // Importance: 1-5 scale → 0-100
  const importanceScore = ((assignment.importance || 3) / 5) * 100;

  const rawScore =
    deadlineScore * WEIGHTS.deadlineUrgency +
    difficultyScore * WEIGHTS.difficulty +
    workloadScore * WEIGHTS.workload +
    importanceScore * WEIGHTS.importance;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  let category;
  if (score >= 70 || daysUntilDeadline < 0) {
    category = 'HIGH';
  } else if (score >= 40) {
    category = 'MEDIUM';
  } else {
    category = 'LOW';
  }

  return {
    score,
    category,
    urgencyDays: daysUntilDeadline,
    breakdown: {
      deadlineUrgency: Math.round(deadlineScore),
      difficulty: Math.round(difficultyScore),
      workload: Math.round(workloadScore),
      importance: Math.round(importanceScore),
    },
  };
}

/**
 * Sort assignments by priority (highest first)
 */
export function sortByPriority(assignments) {
  return assignments
    .filter(a => a.status !== 'completed')
    .map(a => {
      const priority = calculatePriorityScore(a);
      return { ...a, priorityScore: priority.score, priorityCategory: priority.category };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
