/**
 * Difficulty Engine — Transparent subject difficulty scoring
 * Score = weighted combination of topic complexity, unit count,
 *         study effort, conceptual density, practical difficulty
 * Normalized to 0–100. Deterministic.
 */

const WEIGHTS = {
  topicComplexity: 0.25,
  unitCount: 0.15,
  studyEffort: 0.20,
  conceptualDensity: 0.25,
  practicalDifficulty: 0.15,
};

const UNIT_SCORE_MAP = {
  1: 15,
  2: 30,
  3: 50,
  4: 70,
  5: 85,
  6: 95,
};

/**
 * Calculate difficulty score for a subject
 * @param {Object} subject
 * @returns {{ score: number, category: string, breakdown: Object }}
 */
export function calculateDifficultyScore(subject) {
  const unitScore = UNIT_SCORE_MAP[Math.min(subject.units || 4, 6)] || 70;

  const rawScore =
    (subject.complexityScore || 70) * WEIGHTS.topicComplexity +
    unitScore * WEIGHTS.unitCount +
    (subject.effortScore || 65) * WEIGHTS.studyEffort +
    (subject.conceptualDensity || 70) * WEIGHTS.conceptualDensity +
    (subject.practicalDifficulty || 60) * WEIGHTS.practicalDifficulty;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  let category, color;
  if (score >= 70) {
    category = 'Difficult';
    color = 'error';
  } else if (score >= 40) {
    category = 'Moderate';
    color = 'warning';
  } else {
    category = 'Easy';
    color = 'success';
  }

  return {
    score,
    category,
    color,
    breakdown: {
      topicComplexity: subject.complexityScore || 70,
      unitCount: unitScore,
      studyEffort: subject.effortScore || 65,
      conceptualDensity: subject.conceptualDensity || 70,
      practicalDifficulty: subject.practicalDifficulty || 60,
    },
  };
}

/**
 * Rank subjects by difficulty
 * @param {Array} subjects
 * @returns {Array} sorted subjects with scores
 */
export function rankSubjectsByDifficulty(subjects) {
  return subjects
    .map(s => ({
      ...s,
      ...calculateDifficultyScore(s),
    }))
    .sort((a, b) => b.score - a.score);
}
