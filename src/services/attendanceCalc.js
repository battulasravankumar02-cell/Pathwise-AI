/**
 * Attendance Calculator — Mathematical formulas, no AI
 */

/**
 * Calculate current attendance percentage
 */
export function calculateAttendancePercentage(present, total) {
  if (total === 0) return 0;
  return parseFloat(((present / total) * 100).toFixed(2));
}

/**
 * If below target: minimum future days needed to reach target
 * Formula: Let x = days to attend
 *   (present + x) / (total + x) >= target/100
 *   present + x >= (target/100) * (total + x)
 *   present + x >= (target/100)*total + (target/100)*x
 *   x - (target/100)*x >= (target/100)*total - present
 *   x * (1 - target/100) >= (target/100)*total - present
 *   x >= [(target/100)*total - present] / (1 - target/100)
 */
export function daysNeededToReachTarget(present, total, targetPct) {
  const t = targetPct / 100;
  const numerator = t * total - present;
  const denominator = 1 - t;

  if (denominator <= 0) return Infinity; // impossible (100% target)
  if (numerator <= 0) return 0; // already above target

  return Math.ceil(numerator / denominator);
}

/**
 * If above target: max days can miss while staying at or above target
 * Formula: Let x = days to miss
 *   present / (total + x) >= target/100
 *   present >= (target/100) * (total + x)
 *   present >= (target/100)*total + (target/100)*x
 *   present - (target/100)*total >= (target/100)*x
 *   x <= [present - (target/100)*total] / (target/100)
 */
export function maxDaysCanSkip(present, total, targetPct) {
  const t = targetPct / 100;
  const numerator = present - t * total;
  if (numerator <= 0) return 0;
  return Math.floor(numerator / t);
}

/**
 * Full attendance analysis
 */
export function analyzeAttendance(present, total, targetPct) {
  const current = calculateAttendancePercentage(present, total);
  const isAboveTarget = current >= targetPct;

  let message, daysInfo;

  if (isAboveTarget) {
    const canSkip = maxDaysCanSkip(present, total, targetPct);
    daysInfo = canSkip;
    message = canSkip === 0
      ? `You're right at the ${targetPct}% threshold. Don't miss any more classes.`
      : `You can afford to miss up to ${canSkip} more class day(s) while staying at ${targetPct}%.`;
  } else {
    const needed = daysNeededToReachTarget(present, total, targetPct);
    daysInfo = needed;
    if (needed === Infinity) {
      message = `It is mathematically impossible to reach ${targetPct}% with future attendance alone.`;
    } else {
      message = `You need to attend the next ${needed} consecutive class day(s) to reach ${targetPct}%.`;
    }
  }

  return {
    current,
    targetPct,
    isAboveTarget,
    daysInfo,
    message,
    present,
    total,
    status: current >= targetPct ? 'safe' : current >= targetPct - 5 ? 'warning' : 'danger',
  };
}
