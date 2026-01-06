/**
 * Parse total available time from various formats:
 * - HH:MM or HH:MM:SS
 * - Xd HH:MM:SS (e.g., "2d 14:30:25")
 * - X HH:MM:SS (e.g., "2 14:30:25")
 * @param {string} timeStr - Time string in supported formats
 * @returns {number} Total seconds
 */
export function parseTotalTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;

  let workingStr = timeStr.trim();
  let days = 0;

  // Check for days format: "Xd HH:MM:SS" or "X HH:MM:SS"
  const daysMatch = workingStr.match(/^(\d+)d?\s+(.+)$/);
  if (daysMatch) {
    days = parseInt(daysMatch[1], 10);
    workingStr = daysMatch[2];

    if (isNaN(days)) return 0;
  }

  // Parse the time portion (HH:MM:SS or HH:MM)
  const parts = workingStr.split(':').map(p => parseInt(p, 10));

  if (parts.some(isNaN)) return 0;

  let totalSeconds = 0;

  if (parts.length === 2) {
    // HH:MM format
    const [hours, minutes] = parts;
    totalSeconds = hours * 3600 + minutes * 60;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  } else {
    return 0;
  }

  // Add days if present
  totalSeconds += days * 86400; // 86400 seconds in a day

  return totalSeconds;
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
 * @param {number} startingPoints - Points already earned (default 0)
 * @returns {Object} Training strategy with units to train normally and units to speed up
 */
export function calculateTrainingStrategy(trueTimeSeconds, timePerUnitSeconds, pointsPerUnit, barracksCapacities = [], startingPoints = 0) {
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

  // Adjust goal based on starting points
  const adjustedGoal = Math.max(0, GOAL - startingPoints);

  // Parse barracks capacities (barracks 1, 2, 3, 4)
  // null means no value provided (use time-based), 0 means explicitly set to 0
  const capacities = barracksCapacities.map(cap => {
    if (cap === '' || cap === null || cap === undefined) {
      return null; // No value provided
    }
    const parsed = parseInt(cap, 10);
    if (isNaN(parsed) || parsed < 0) {
      return null; // Invalid value, treat as not provided
    }
    return parsed; // Valid value (including 0)
  });

  // Calculate units based on available time
  const unitsBasedOnTime = Math.floor(trueTimeSeconds / timePerUnitSeconds);

  // Cap each barracks at its capacity (if provided), otherwise use time-based calculation
  const barracks = capacities.map((capacity, index) => {
    if (capacity !== null) {
      // Capacity was explicitly provided (including 0)
      return Math.min(unitsBasedOnTime, capacity);
    }
    // No capacity limit specified, use time-based calculation
    return unitsBasedOnTime;
  });

  // Calculate points from barracks 2-4 normal training
  const pointsFromBarracks234 = (barracks[1] + barracks[2] + barracks[3]) * pointsPerUnit;

  // Calculate points from barracks 1 normal training
  const pointsFromBarracks1Normal = barracks[0] * pointsPerUnit;

  // Total points from normal training
  const totalNormalPoints = pointsFromBarracks1Normal + pointsFromBarracks234;

  // Calculate deficit based on adjusted goal
  const deficit = adjustedGoal - totalNormalPoints;

  if (deficit <= 0) {
    // Already at or above goal with normal training
    // Continue training until the event time even if we exceed the goal
    return {
      totalUnits: barracks.reduce((sum, b) => sum + b, 0),
      barracks,
      speedUpUnits: 0,
      pointsFromBarracks234,
      pointsFromBarracks1Normal,
      pointsFromSpeedUp: 0,
      totalPoints: totalNormalPoints + startingPoints,
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
  const totalPoints = totalNormalPoints + pointsFromSpeedUp + startingPoints;

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
