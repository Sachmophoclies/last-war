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

// Calculate the next Unit Progression time in user's local timezone
function getNextUnitProgressionTime() {
  const now = new Date();

  // Get current UTC time
  const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  // Convert to server time (UTC-2)
  const nowServerTime = new Date(nowUTC.getTime() - 2 * 3600000);

  // Check upcoming times for the next 7 days
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(nowServerTime);
    checkDate.setDate(checkDate.getDate() + daysAhead);
    const dayOfWeek = checkDate.getDay();

    const times = UNIT_PROGRESSION_SCHEDULE[dayOfWeek];
    if (!times) continue;

    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Create the event time in server time (UTC-2)
      const eventDateServer = new Date(checkDate);
      eventDateServer.setHours(hours, minutes, 0, 0);

      // Check if this time is in the future (in server time)
      if (eventDateServer > nowServerTime) {
        // Convert server time to UTC
        const eventDateUTC = new Date(eventDateServer.getTime() + 2 * 3600000);

        // Convert UTC to user's local timezone
        const localDate = new Date(eventDateUTC.getTime() - now.getTimezoneOffset() * 60000);

        // Format as HH:MM in user's local timezone
        const localHours = localDate.getHours().toString().padStart(2, '0');
        const localMinutes = localDate.getMinutes().toString().padStart(2, '0');
        return `${localHours}:${localMinutes}`;
      }
    }
  }

  return ""; // Fallback if no time found
}

export default function UnitProgression() {
  // Today's Time - not stored in cookies, starts empty so placeholder shows
  const [availableTime, setAvailableTime] = useState("");

  // Settings - load from cookies or default to empty string
  const [barracksCapacityStrongest, setBarracksCapacityStrongest] = useState(() => getCookie("barracksCapacityStrongest") || "");
  const [totalTrainingTime, setTotalTrainingTime] = useState(() => getCookie("totalTrainingTime") || "");
  const [unitLevel, setUnitLevel] = useState(() => getCookie("unitLevel") || "7");
  const [barracks1, setBarracks1] = useState(() => getCookie("barracks1") || "");
  const [barracks2, setBarracks2] = useState(() => getCookie("barracks2") || "");
  const [barracks3, setBarracks3] = useState(() => getCookie("barracks3") || "");
  const [barracks4, setBarracks4] = useState(() => getCookie("barracks4") || "");

  // +24hr button toggle state
  const [is24HrAdded, setIs24HrAdded] = useState(false);

  // Validation error state
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  // Save barracksCapacityStrongest to cookie when it changes
  useEffect(() => {
    setCookie("barracksCapacityStrongest", barracksCapacityStrongest);
  }, [barracksCapacityStrongest]);

  // Save totalTrainingTime to cookie when it changes
  useEffect(() => {
    setCookie("totalTrainingTime", totalTrainingTime);
  }, [totalTrainingTime]);

  // Save unitLevel to cookie when it changes
  useEffect(() => {
    setCookie("unitLevel", unitLevel);
  }, [unitLevel]);

  // Save barracks values to cookies when they change
  useEffect(() => {
    setCookie("barracks1", barracks1);
  }, [barracks1]);
  useEffect(() => {
    setCookie("barracks2", barracks2);
  }, [barracks2]);
  useEffect(() => {
    setCookie("barracks3", barracks3);
  }, [barracks3]);
  useEffect(() => {
    setCookie("barracks4", barracks4);
  }, [barracks4]);

  // Calculate time until target time
  const calculateTimeUntil = (targetTime) => {
    if (!targetTime) return 0;

    // Parse target time (HH:MM format)
    const parts = targetTime.trim().split(':');
    if (parts.length !== 2) return 0;

    const targetHour = parseInt(parts[0], 10);
    const targetMinute = parseInt(parts[1], 10);

    if (isNaN(targetHour) || isNaN(targetMinute)) return 0;

    // Get current time
    const now = new Date();

    // Create target date (today)
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);

    // If target time is in the past, it could be tomorrow or later
    // Keep adding days until we find a future time
    while (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    // Calculate difference in seconds
    const diffMs = target - now;
    return Math.floor(diffMs / 1000);
  };

  // Navigate to Results page
  const goToResults = () => {
    // Use auto-calculated time if input is empty
    const timeToUse = availableTime.trim() || getNextUnitProgressionTime();

    // Validate required fields
    if (!timeToUse) {
      setValidationError("Unable to determine next Unit Progression time");
      return;
    }
    if (!barracksCapacityStrongest.trim()) {
      setValidationError("Please enter barracks capacity");
      return;
    }
    if (!totalTrainingTime.trim()) {
      setValidationError("Please enter total training time");
      return;
    }

    // Clear any previous errors
    setValidationError("");

    // Calculate time until target
    const totalTimeSeconds = calculateTimeUntil(timeToUse);
    const maxUnits = parseInt(barracksCapacityStrongest, 10) || 0;
    const maxTimeSeconds = parseTotalTime(totalTrainingTime);

    // Calculate exact time per unit (with sub-second precision)
    const timePerUnitSeconds = maxUnits > 0 ? maxTimeSeconds / maxUnits : 0;

    // Look up points per unit based on unit level
    const ppu = UNIT_POINTS_PER_LEVEL[parseInt(unitLevel, 10)] || UNIT_POINTS_PER_LEVEL[7];
    const barracksCapacities = [barracks1, barracks2, barracks3, barracks4];

    // Calculate true time and strategy
    const trueTimeSeconds = calculateTrueTime(totalTimeSeconds, timePerUnitSeconds);
    const strategy = calculateTrainingStrategy(
      trueTimeSeconds,
      timePerUnitSeconds,
      ppu,
      barracksCapacities
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
        strategy
      }
    });
  };

  // Clear today's time
  const clearTodaysTime = () => {
    setAvailableTime("");
    setIs24HrAdded(false);
  };

  // Toggle 24 hours to the auto-calculated time
  const toggle24Hours = () => {
    const autoTime = getNextUnitProgressionTime();
    if (!autoTime) return;

    if (is24HrAdded) {
      // Remove 24 hours - reset to auto-calculated time
      setAvailableTime("");
      setIs24HrAdded(false);
    } else {
      // Add 24 hours
      const [hours, minutes] = autoTime.split(':').map(Number);
      const now = new Date();

      // Create a date for the auto-calculated time
      let targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);

      // If the time is earlier than now, it's tomorrow
      if (targetDate < now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Add 24 hours (86400000 milliseconds = 24 hours)
      targetDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

      // Format as HH:MM
      const newHours = targetDate.getHours().toString().padStart(2, '0');
      const newMinutes = targetDate.getMinutes().toString().padStart(2, '0');
      setAvailableTime(`${newHours}:${newMinutes}`);
      setIs24HrAdded(true);
    }
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
          <span>Time of next Unit Progression (HH:MM) - Auto-calculated in your timezone</span>
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
                  onChange={(e) => setBarracksCapacityStrongest(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                  onChange={(e) => setTotalTrainingTime(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                <div className="grid2">
                  <input
                    type="number"
                    placeholder="Barracks 1 (strongest)"
                    value={barracks1}
                    onChange={(e) => setBarracks1(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 2"
                    value={barracks2}
                    onChange={(e) => setBarracks2(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 3"
                    value={barracks3}
                    onChange={(e) => setBarracks3(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <input
                    type="number"
                    placeholder="Barracks 4"
                    value={barracks4}
                    onChange={(e) => setBarracks4(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </label>
            </li>
          </ul>
        </div>
      </div>

      <Footer
        onBack={() => navigate(-1)}
        onCheck={goToResults}
        onClear={clearTodaysTime}
      />
      </div>
    </>
  );
}