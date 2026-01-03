/**
 * Parse total available time from HH:MM or HH:MM:SS format
 * @param {string} timeStr - Time string in HH:MM or HH:MM:SS format
 * @returns {number} Total seconds
 */
export function parseTotalTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;

  const parts = timeStr.trim().split(':').map(p => parseInt(p, 10));

  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    // HH:MM format
    const [hours, minutes] = parts;
    return hours * 3600 + minutes * 60;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Parse time per unit from MM:SS format or number of seconds
 * @param {string|number} timeStr - Time string in MM:SS format or number
 * @returns {number} Total seconds
 */
export function parseTimePerUnit(timeStr) {
  if (typeof timeStr === 'number') return timeStr;
  if (!timeStr || typeof timeStr !== 'string') return 0;

  const parts = timeStr.trim().split(':').map(p => parseInt(p, 10));

  if (parts.some(isNaN)) return 0;

  if (parts.length === 1) {
    // Just seconds
    return parts[0];
  } else if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

/**
 * Calculate the true time based on total time and time per unit
 * True time is the next time step >= total time
 * @param {number} totalTimeSeconds - Total available time in seconds
 * @param {number} timePerUnitSeconds - Time per unit in seconds
 * @returns {number} True time in seconds
 */
export function calculateTrueTime(totalTimeSeconds, timePerUnitSeconds) {
  if (timePerUnitSeconds <= 0) return totalTimeSeconds;

  const numberOfUnits = Math.ceil(totalTimeSeconds / timePerUnitSeconds);
  return numberOfUnits * timePerUnitSeconds;
}

// Constants
export const GOAL = 75000; // Target points to reach
export const PPSU = 10; // Points per minute of speed up

/**
 * Calculate the optimal training strategy to reach the goal efficiently
 * Each barracks trains to its full capacity
 * @param {number} trueTimeSeconds - The true time in seconds (rounded up to nearest unit time)
 * @param {number} timePerUnitSeconds - Time to train one unit in seconds
 * @param {number} pointsPerUnit - Points earned per unit trained
 * @param {number[]} barracksCapacities - Array of max capacities for each barracks (optional)
 * @returns {Object} Training strategy with units to train normally and units to speed up
 */
export function calculateTrainingStrategy(trueTimeSeconds, timePerUnitSeconds, pointsPerUnit, barracksCapacities = []) {
  if (timePerUnitSeconds <= 0 || pointsPerUnit <= 0) {
    return {
      totalUnits: 0,
      barracks: [0, 0, 0, 0],
      speedUpUnits: 0,
      totalPoints: 0,
      deficit: 0,
      exceedsCapacity: false
    };
  }

  // Parse barracks capacities (barracks 1, 2, 3, 4)
  const capacities = barracksCapacities.map(cap => {
    const parsed = parseInt(cap, 10);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  });

  // If capacities are provided, train each barracks to its full capacity
  // Otherwise, calculate based on available time
  const barracks = capacities.every(c => c > 0)
    ? [...capacities] // Train to full capacity
    : [
        Math.floor(trueTimeSeconds / timePerUnitSeconds),
        Math.floor(trueTimeSeconds / timePerUnitSeconds),
        Math.floor(trueTimeSeconds / timePerUnitSeconds),
        Math.floor(trueTimeSeconds / timePerUnitSeconds)
      ];

  // Calculate points from barracks 2-4 normal training
  const pointsFromBarracks234 = (barracks[1] + barracks[2] + barracks[3]) * pointsPerUnit;

  // Calculate points from barracks 1 normal training
  const pointsFromBarracks1Normal = barracks[0] * pointsPerUnit;

  // Total points from normal training
  const totalNormalPoints = pointsFromBarracks1Normal + pointsFromBarracks234;

  // Calculate deficit
  const deficit = GOAL - totalNormalPoints;

  if (deficit <= 0) {
    // Already at or above goal with normal training
    return {
      totalUnits: barracks.reduce((sum, b) => sum + b, 0),
      barracks,
      speedUpUnits: 0,
      pointsFromBarracks234,
      pointsFromBarracks1Normal,
      pointsFromSpeedUp: 0,
      totalPoints: totalNormalPoints,
      deficit: 0,
      exceedsCapacity: false
    };
  }

  // Need to use speed-ups in barracks 1 to make up the deficit
  // When we speed up training, we get:
  // - Points from training the unit (pointsPerUnit)
  // - Points from the speed up (PPSU * minutes)
  const timePerUnitMinutes = timePerUnitSeconds / 60;
  const pointsPerSpeedUpUnit = pointsPerUnit + (PPSU * timePerUnitMinutes);

  // Calculate how many units need to be sped up to cover the deficit
  const speedUpUnitsNeeded = Math.ceil(deficit / pointsPerSpeedUpUnit);

  const pointsFromSpeedUp = speedUpUnitsNeeded * pointsPerSpeedUpUnit;
  const totalPoints = totalNormalPoints + pointsFromSpeedUp;

  return {
    totalUnits: barracks.reduce((sum, b) => sum + b, 0) + speedUpUnitsNeeded,
    barracks,
    speedUpUnits: speedUpUnitsNeeded,
    pointsFromBarracks234,
    pointsFromBarracks1Normal,
    pointsFromSpeedUp,
    totalPoints,
    deficit: Math.max(0, GOAL - totalPoints),
    exceedsCapacity: false,
    speedUpTimeMinutes: speedUpUnitsNeeded * timePerUnitMinutes
  };
}
