import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoIcon from "../../../components/InfoIcon.jsx";
import Footer from "../../../components/Footer.jsx";
import FirstViewPopup from "../../../components/FirstViewPopup.jsx";
import content from "../../../data/content.json";
import {
  parseTotalTime,
  calculateTrueTime,
  calculateTrainingStrategy
} from "./UnitProgressionUtils.jsx";

// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Unit Progression schedule in server time (UTC-2) (24-hour format)
// Day of week (0=Sun, 1=Mon, etc.) => array of times in server time
const UNIT_PROGRESSION_SCHEDULE = {
  1: ["08:00"], // Monday
  2: ["00:00"], // Tuesday
  3: ["16:00"], // Wednesday
  4: ["04:00"], // Thursday
  5: ["08:00", "20:00"], // Friday (two events)
  6: ["00:00"], // Saturday
  0: ["16:00"], // Sunday (day 0, not 7)
};

const UNIT_POINTS_PER_LEVEL = {
  1: 5,
  2: 6,
  3: 7,
  4: 13,
  5: 15,
  6: 19,
  7: 22,
  8: 25,
  9: 28,
  10: 31,
  11: 34
}

// Calculate the next Unit Progression time as a full Date object in user's local timezone
function getNextUnitProgressionDate() {
  const now = new Date();

  // Get current time as UTC timestamp
  const nowUTC = Date.now();

  // Convert to server time (UTC-2) by subtracting 2 hours
  const nowServerTime = nowUTC - 2 * 3600000;

  // Check upcoming times for the next 7 days
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(nowServerTime);
    checkDate.setUTCDate(checkDate.getUTCDate() + daysAhead);
    const dayOfWeek = checkDate.getUTCDay();

    const times = UNIT_PROGRESSION_SCHEDULE[dayOfWeek];
    if (!times) continue;

    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Create the event time in UTC (representing server time UTC-2)
      const eventDateServer = new Date(checkDate);
      eventDateServer.setUTCHours(hours, minutes, 0, 0);

      // Check if this time is in the future (comparing timestamps)
      if (eventDateServer.getTime() > nowServerTime) {
        // Convert from UTC-2 representation to actual UTC by adding 2 hours
        const eventDateUTC = new Date(eventDateServer.getTime() + 2 * 3600000);

        // Date objects automatically display in local timezone, so just return it
        return eventDateUTC;
      }
    }
  }

  return null; // Fallback if no time found
}

// Calculate the next Unit Progression time in user's local timezone (HH:MM format)
function getNextUnitProgressionTime() {
  const localDate = getNextUnitProgressionDate();
  if (!localDate) return "";

  const localHours = localDate.getHours().toString().padStart(2, '0');
  const localMinutes = localDate.getMinutes().toString().padStart(2, '0');
  return `${localHours}:${localMinutes}`;
}

export default function UnitProgression() {
  // Helper function to check if next event is >24hrs away
  const checkIsBeyond24Hours = () => {
    const now = new Date();
    const nextEventDate = getNextUnitProgressionDate();

    if (!nextEventDate) return false;

    const diffMs = nextEventDate - now;
    const hoursUntil = diffMs / (1000 * 60 * 60);

    return hoursUntil > 24;
  };

  // Today's Time - initialize with +24hr time if next event is >24hrs away
  const [availableTime, setAvailableTime] = useState(() => {
    const isBeyond24 = checkIsBeyond24Hours();

    if (!isBeyond24) return "";

    const nextEventDate = getNextUnitProgressionDate();
    if (!nextEventDate) return "";

    const targetPlus24 = new Date(nextEventDate.getTime() + 24 * 60 * 60 * 1000);
    const newHours = targetPlus24.getHours().toString().padStart(2, '0');
    const newMinutes = targetPlus24.getMinutes().toString().padStart(2, '0');
    return `${newHours}:${newMinutes}`;
  });

  // Buffed mode toggle - load from cookie
  const [isBuffed, setIsBuffed] = useState(() => getCookie("isBuffed") === "true");

  // Track if we're showing placeholder buffed values (first time toggling to buffed mode)
  const [showingPlaceholderBuffed, setShowingPlaceholderBuffed] = useState(false);

  // Settings - load from cookies based on buffed mode
  const [barracksCapacityStrongest, setBarracksCapacityStrongest] = useState(() => {
    const key = isBuffed ? "barracksCapacityStrongest_buffed" : "barracksCapacityStrongest";
    return getCookie(key) || "";
  });
  const [totalTrainingTime, setTotalTrainingTime] = useState(() => {
    const key = isBuffed ? "totalTrainingTime_buffed" : "totalTrainingTime";
    return getCookie(key) || "";
  });
  const [barracks1, setBarracks1] = useState(() => {
    const key = isBuffed ? "barracks1_buffed" : "barracks1";
    return getCookie(key) || "";
  });
  const [barracks2, setBarracks2] = useState(() => {
    const key = isBuffed ? "barracks2_buffed" : "barracks2";
    return getCookie(key) || "";
  });
  const [barracks3, setBarracks3] = useState(() => {
    const key = isBuffed ? "barracks3_buffed" : "barracks3";
    return getCookie(key) || "";
  });
  const [barracks4, setBarracks4] = useState(() => {
    const key = isBuffed ? "barracks4_buffed" : "barracks4";
    return getCookie(key) || "";
  });

  // These don't change based on buffed mode
  const [unitLevel, setUnitLevel] = useState(() => getCookie("unitLevel") || "7");

  // Starting Points - session storage only (resets when page is closed)
  const [startingPoints, setStartingPoints] = useState(() => {
    return sessionStorage.getItem("startingPoints") || "";
  });

  // +24hr button toggle state - initialize based on whether next event is >24hrs away
  const [is24HrAdded, setIs24HrAdded] = useState(() => checkIsBeyond24Hours());

  // Validation error state
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  // Save buffed mode to cookie when it changes
  useEffect(() => {
    setCookie("isBuffed", isBuffed.toString());
  }, [isBuffed]);

  // Save barracksCapacityStrongest to appropriate cookie based on buffed mode
  useEffect(() => {
    const key = isBuffed ? "barracksCapacityStrongest_buffed" : "barracksCapacityStrongest";
    setCookie(key, barracksCapacityStrongest);
  }, [barracksCapacityStrongest, isBuffed]);

  // Save totalTrainingTime to appropriate cookie based on buffed mode
  useEffect(() => {
    const key = isBuffed ? "totalTrainingTime_buffed" : "totalTrainingTime";
    setCookie(key, totalTrainingTime);
  }, [totalTrainingTime, isBuffed]);

  // Save unitLevel to cookie when it changes
  useEffect(() => {
    setCookie("unitLevel", unitLevel);
  }, [unitLevel]);

  // Save barracks values to appropriate cookies based on buffed mode
  useEffect(() => {
    const key = isBuffed ? "barracks1_buffed" : "barracks1";
    setCookie(key, barracks1);
  }, [barracks1, isBuffed]);
  useEffect(() => {
    const key = isBuffed ? "barracks2_buffed" : "barracks2";
    setCookie(key, barracks2);
  }, [barracks2, isBuffed]);
  useEffect(() => {
    const key = isBuffed ? "barracks3_buffed" : "barracks3";
    setCookie(key, barracks3);
  }, [barracks3, isBuffed]);
  useEffect(() => {
    const key = isBuffed ? "barracks4_buffed" : "barracks4";
    setCookie(key, barracks4);
  }, [barracks4, isBuffed]);

  // Save starting points to session storage when it changes
  useEffect(() => {
    if (startingPoints) {
      sessionStorage.setItem("startingPoints", startingPoints);
    } else {
      sessionStorage.removeItem("startingPoints");
    }
  }, [startingPoints]);

  // Calculate time until target time
  const calculateTimeUntil = (targetTime) => {
    if (!targetTime) return 0;

    const trimmed = targetTime.trim();
    let daysToAdd = 0;
    let timeString = trimmed;

    // Check for "1d HH:MM" format
    const dayMatch = trimmed.match(/^(\d+)d\s+(.+)$/);
    if (dayMatch) {
      daysToAdd = parseInt(dayMatch[1], 10);
      timeString = dayMatch[2];
    }

    // Parse target time (HH:MM format)
    const parts = timeString.split(':');
    if (parts.length !== 2) return 0;

    const targetHour = parseInt(parts[0], 10);
    const targetMinute = parseInt(parts[1], 10);

    if (isNaN(targetHour) || isNaN(targetMinute)) return 0;

    // Get current time
    const now = new Date();

    // Create target date (today + specified days)
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);
    target.setDate(target.getDate() + daysToAdd);

    // If target time is in the past, keep adding days until we find a future time
    while (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    // Calculate difference in seconds
    const diffMs = target - now;
    return Math.floor(diffMs / 1000);
  };

  // Check if next event is more than 24 hours away
  const isNextEventBeyond24Hours = () => {
    const nextTime = getNextUnitProgressionTime();
    if (!nextTime) return false;

    const secondsUntil = calculateTimeUntil(nextTime);
    const hoursUntil = secondsUntil / 3600;

    return hoursUntil > 24;
  };

  // Navigate to Results page
  const goToResults = () => {
    // Determine the time to use and calculate seconds until target
    let timeToUse;
    let totalTimeSeconds;
    const nextEventDate = getNextUnitProgressionDate();

    if (!nextEventDate) {
      setValidationError("Unable to determine next Unit Progression time");
      return;
    }

    if (availableTime.trim() && is24HrAdded) {
      // Toggle is ON - use next event + 24 hours
      const targetPlus24 = new Date(nextEventDate.getTime() + 24 * 60 * 60 * 1000);
      timeToUse = availableTime.trim();

      // Calculate seconds until the exact event + 24hr date
      const now = new Date();
      const diffMs = targetPlus24 - now;
      totalTimeSeconds = Math.floor(diffMs / 1000);
    } else if (availableTime.trim() && !is24HrAdded) {
      // User manually entered a custom time (not from toggle)
      timeToUse = availableTime.trim();
      totalTimeSeconds = calculateTimeUntil(timeToUse);
    } else {
      // Toggle is OFF and no manual input - use next event date directly
      timeToUse = getNextUnitProgressionTime();

      // Calculate seconds until the exact event date
      const now = new Date();
      const diffMs = nextEventDate - now;
      totalTimeSeconds = Math.floor(diffMs / 1000);
    }

    // Validate required fields
    if (!timeToUse) {
      setValidationError("Unable to determine next Unit Progression time");
      return;
    }
    if (!barracksCapacityStrongest.trim()) {
      setValidationError("Barracks capacity is required");
      return;
    }
    if (!totalTrainingTime.trim()) {
      setValidationError("Total training time is required");
      return;
    }

    // Parse and validate numeric fields
    const maxUnits = parseInt(barracksCapacityStrongest, 10);
    if (isNaN(maxUnits)) {
      setValidationError("Barracks capacity must be a number");
      return;
    }
    if (maxUnits <= 0) {
      setValidationError("Barracks capacity must be greater than 0");
      return;
    }

    const maxTimeSeconds = parseTotalTime(totalTrainingTime);
    if (maxTimeSeconds <= 0) {
      setValidationError("Total training time is invalid (use format HH:MM:SS or HH:MM)");
      return;
    }

    // Validate optional barracks capacities
    const barracksCapacities = [barracks1, barracks2, barracks3, barracks4];
    for (let i = 0; i < barracksCapacities.length; i++) {
      if (barracksCapacities[i].trim()) {
        const capacity = parseInt(barracksCapacities[i], 10);
        if (isNaN(capacity)) {
          setValidationError(`Barracks ${i + 1} capacity must be a number`);
          return;
        }
        if (capacity < 0) {
          setValidationError(`Barracks ${i + 1} capacity cannot be negative`);
          return;
        }
      }
    }

    // Parse and validate starting points
    const startingPointsValue = parseInt(startingPoints, 10) || 0;
    if (startingPoints.trim()) {
      if (isNaN(startingPointsValue)) {
        setValidationError("Starting points must be a number");
        return;
      }
      if (startingPointsValue < 0) {
        setValidationError("Starting points cannot be negative");
        return;
      }
    }

    // Clear any previous errors
    setValidationError("");

    // Calculate exact time per unit (with sub-second precision)
    const timePerUnitSeconds = maxUnits > 0 ? maxTimeSeconds / maxUnits : 0;

    // Look up points per unit based on unit level
    const ppu = UNIT_POINTS_PER_LEVEL[parseInt(unitLevel, 10)] || UNIT_POINTS_PER_LEVEL[7];

    // Calculate true time and strategy
    const trueTimeSeconds = calculateTrueTime(totalTimeSeconds, timePerUnitSeconds);
    const strategy = calculateTrainingStrategy(
      trueTimeSeconds,
      timePerUnitSeconds,
      ppu,
      barracksCapacities,
      startingPointsValue
    );

    // Navigate with calculation results
    navigate("/results", {
      state: {
        availableTime,
        barracksCapacityStrongest,
        totalTrainingTime,
        pointsPerUnit: ppu,
        barracksCapacities,
        totalTimeSeconds,
        timePerUnitSeconds,
        trueTimeSeconds,
        strategy,
        startingPoints: startingPointsValue
      }
    });
  };

  // Toggle 24 hours to the auto-calculated time
  const toggle24Hours = () => {
    const nextEventDate = getNextUnitProgressionDate();
    if (!nextEventDate) return;

    if (is24HrAdded) {
      // Remove 24 hours - reset to auto-calculated time
      setAvailableTime("");
      setIs24HrAdded(false);
    } else {
      // Add 24 hours to the next event date
      const targetPlus24 = new Date(nextEventDate.getTime() + 24 * 60 * 60 * 1000);

      // Format as HH:MM
      const newHours = targetPlus24.getHours().toString().padStart(2, '0');
      const newMinutes = targetPlus24.getMinutes().toString().padStart(2, '0');
      const newTime = `${newHours}:${newMinutes}`;
      setAvailableTime(newTime);
      setIs24HrAdded(true);
    }
  };

  // Toggle buffed mode - loads values from appropriate cookies
  const toggleBuffedMode = () => {
    const newBuffedState = !isBuffed;

    // Load values from the appropriate cookie set
    if (newBuffedState) {
      // Switching to buffed mode
      const buffedCapacity = getCookie("barracksCapacityStrongest_buffed");
      const buffedTime = getCookie("totalTrainingTime_buffed");
      const buffedB1 = getCookie("barracks1_buffed");
      const buffedB2 = getCookie("barracks2_buffed");
      const buffedB3 = getCookie("barracks3_buffed");
      const buffedB4 = getCookie("barracks4_buffed");

      // If buffed cookies are empty, pre-populate with current (unbuffed) values
      if (!buffedCapacity && !buffedTime && !buffedB1 && !buffedB2 && !buffedB3 && !buffedB4) {
        setBarracksCapacityStrongest(barracksCapacityStrongest);
        setTotalTrainingTime(totalTrainingTime);
        setBarracks1(barracks1);
        setBarracks2(barracks2);
        setBarracks3(barracks3);
        setBarracks4(barracks4);
        setShowingPlaceholderBuffed(true); // Mark as showing placeholder values
      } else {
        // Load from buffed cookies
        setBarracksCapacityStrongest(buffedCapacity || "");
        setTotalTrainingTime(buffedTime || "");
        setBarracks1(buffedB1 || "");
        setBarracks2(buffedB2 || "");
        setBarracks3(buffedB3 || "");
        setBarracks4(buffedB4 || "");
        setShowingPlaceholderBuffed(false);
      }
    } else {
      // Switching to unbuffed mode
      setBarracksCapacityStrongest(getCookie("barracksCapacityStrongest") || "");
      setTotalTrainingTime(getCookie("totalTrainingTime") || "");
      setBarracks1(getCookie("barracks1") || "");
      setBarracks2(getCookie("barracks2") || "");
      setBarracks3(getCookie("barracks3") || "");
      setBarracks4(getCookie("barracks4") || "");
      setShowingPlaceholderBuffed(false);
    }

    setIsBuffed(newBuffedState);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToResults();
    }
  };

  // TODO: parse availableTime into total seconds
  // const availableSeconds = ...

  // TODO: parse unitTime into seconds per unit
  // const unitSeconds = ...

  return (
    <>
      <FirstViewPopup
        pageKey="armsRace"
        content={content.satchsGuides.armsRace}
      />

      <div className="page">
        <h1>
          Arms Race - Unit Progression
          <InfoIcon text="Use this tool to most efficiently max out your Arms Race - Unit Progression and open all boxes while using the least number of speedups." />
        </h1>

      <div className="card">
        <h2>
          Time of Next Unit Progression
          <InfoIcon text="The next Unit Progression time is automatically calculated based on the game schedule (converted to your local timezone). Leave empty to use auto-calculated time, or enter a custom time to override." />
        </h2>

        <label className="field">
          <span>Time of next Unit Progression (HH:MM or 1d HH:MM) - Local Time</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={getNextUnitProgressionTime()}
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1 }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '25%',
              minWidth: 'fit-content'
            }}>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '46px',
                height: '24px',
                flexShrink: 0
              }}>
                <input
                  type="checkbox"
                  checked={is24HrAdded}
                  onChange={toggle24Hours}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: is24HrAdded ? '#22c55e' : '#ccc',
                  transition: '0.3s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: is24HrAdded ? '25px' : '3px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'white',
                    border: '1px solid #000',
                    boxShadow: 'inset 0 0 0 1px #ccc',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }}></span>
                </span>
              </label>
              <span style={{
                fontSize: '0.85em',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                color: 'var(--text)',
                userSelect: 'none'
              }}>
                +24hr
              </span>
            </div>
          </div>
        </label>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={isBuffed}
            onChange={toggleBuffedMode}
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              accentColor: 'var(--primary-color)',
              flexShrink: 0
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }} onClick={toggleBuffedMode}>
            <span>
              Secretary Bonus{' '}
              <InfoIcon text="Check this if you're using the Secretary bonus. You'll need to put in the new values below." />
            </span>
          </label>
        </div>
      </div>

      {validationError && (
        <div className="card" style={{ background: 'var(--card-border)', border: '2px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#ef4444', fontWeight: 600 }}>
            {validationError}
          </p>
        </div>
      )}

      <div className="card">
        <h2>Settings</h2>

        <div>
          <h3>Required</h3>
          <ul className="list">
            <li>
              <label className="field">
                <span>
                  Barracks capacity (strongest)
                  <InfoIcon text="Pick one barracks and see what time it gives you when you move the slider all the way to the right" />
                </span>
                <input
                  type="number"
                  placeholder="729"
                  value={barracksCapacityStrongest}
                  onChange={(e) => {
                    setBarracksCapacityStrongest(e.target.value);
                    // Autofill barracks1 with the same value
                    setBarracks1(e.target.value);
                    if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                  }}
                  onKeyDown={handleKeyDown}
                  style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                />
              </label>
            </li>
            <li>
              <label className="field">
                <span>
                  Total training time
                  <InfoIcon text="The time shown for training the maximum capacity (e.g., 25:12:51)" />
                </span>
                <input
                  type="text"
                  placeholder="25:12:51"
                  value={totalTrainingTime}
                  onChange={(e) => {
                    setTotalTrainingTime(e.target.value);
                    if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                  }}
                  onKeyDown={handleKeyDown}
                  style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                />
              </label>
            </li>
          </ul>
        </div>

        <div className="divider"></div>

        <div>
          <h3>Optional</h3>
          <ul className="list">
            <li>
              <label className="field">
                <span>Unit Level</span>
                <select
                  value={unitLevel}
                  onChange={(e) => setUnitLevel(e.target.value)}
                >
                  <option value="1">Level 1 (5 points)</option>
                  <option value="2">Level 2 (6 points)</option>
                  <option value="3">Level 3 (7 points)</option>
                  <option value="4">Level 4 (13 points)</option>
                  <option value="5">Level 5 (15 points)</option>
                  <option value="6">Level 6 (19 points)</option>
                  <option value="7">Level 7 (22 points)</option>
                  <option value="8">Level 8 (25 points)</option>
                  <option value="9">Level 9 (28 points)</option>
                  <option value="10">Level 10 (31 points)</option>
                </select>
              </label>
            </li>

            <li>
              <label className="field">
                <span>
                  Maximum troops per barracks
                  <InfoIcon text="Enter the maximum capacity for each of your 4 barracks. This helps calculate when barracks will be full during training" />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Barracks 1 (strongest)"
                    value={barracks1}
                    onChange={(e) => {
                      setBarracks1(e.target.value);
                      if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                    }}
                    onKeyDown={handleKeyDown}
                    style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 2"
                    value={barracks2}
                    onChange={(e) => {
                      setBarracks2(e.target.value);
                      if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                    }}
                    onKeyDown={handleKeyDown}
                    style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 3"
                    value={barracks3}
                    onChange={(e) => {
                      setBarracks3(e.target.value);
                      if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                    }}
                    onKeyDown={handleKeyDown}
                    style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 4"
                    value={barracks4}
                    onChange={(e) => {
                      setBarracks4(e.target.value);
                      if (showingPlaceholderBuffed) setShowingPlaceholderBuffed(false);
                    }}
                    onKeyDown={handleKeyDown}
                    style={showingPlaceholderBuffed ? { color: 'var(--text-muted)' } : {}}
                  />
                </div>
              </label>
            </li>

            <li>
              <label className="field">
                <span>
                  Starting Points
                  <InfoIcon text="If you already have points, enter them here. The tool will calculate how many additional points you need to reach 75,000." />
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={startingPoints}
                  onChange={(e) => setStartingPoints(e.target.value)}
                  onKeyDown={handleKeyDown}
                  min="0"
                />
              </label>
            </li>
          </ul>
        </div>
      </div>

      <Footer
        onBack={() => navigate(-1)}
        onCheck={goToResults}
      />
      </div>
    </>
  );
}