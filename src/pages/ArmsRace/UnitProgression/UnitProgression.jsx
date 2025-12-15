import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoIcon from "../../../components/InfoIcon.jsx";
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

// Unit Progression schedule in EST (24-hour format)
// Day of week (0=Sun, 1=Mon, etc.) => array of times in EST
const UNIT_PROGRESSION_SCHEDULE = {
  1: ["09:00"], // Monday
  2: ["05:00"], // Tuesday
  3: ["01:00"], // Wednesday
  4: ["05:00"], // Thursday
  5: ["01:00", "21:00"], // Friday (two events)
  6: ["17:00"], // Saturday
};

// Calculate the next Unit Progression time in user's local timezone
function getNextUnitProgressionTime() {
  const now = new Date();

  // Get current time in EST
  const nowInEST = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

  // Check upcoming times for the next 7 days
  for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
    const checkDate = new Date(nowInEST);
    checkDate.setDate(checkDate.getDate() + daysAhead);
    const dayOfWeek = checkDate.getDay();

    const times = UNIT_PROGRESSION_SCHEDULE[dayOfWeek];
    if (!times) continue;

    for (const timeStr of times) {
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Create the event time in EST
      const eventDateEST = new Date(checkDate);
      eventDateEST.setHours(hours, minutes, 0, 0);

      // Check if this time is in the future (in EST)
      if (eventDateEST > nowInEST) {
        // Convert EST date string to a proper Date object in user's local timezone
        // Format the EST date as ISO string components
        const year = eventDateEST.getFullYear();
        const month = String(eventDateEST.getMonth() + 1).padStart(2, '0');
        const day = String(eventDateEST.getDate()).padStart(2, '0');
        const hour = String(hours).padStart(2, '0');
        const minute = String(minutes).padStart(2, '0');

        // Create a date string that represents this EST time
        const estDateString = `${year}-${month}-${day}T${hour}:${minute}:00-05:00`;
        const localDate = new Date(estDateString);

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
  const [barracksCapacitySingle, setBarracksCapacitySingle] = useState(() => getCookie("barracksCapacitySingle") || "");
  const [totalTrainingTime, setTotalTrainingTime] = useState(() => getCookie("totalTrainingTime") || "");
  const [pointsPerUnit, setPointsPerUnit] = useState(() => getCookie("pointsPerUnit") || "22");
  const [barracks1, setBarracks1] = useState(() => getCookie("barracks1") || "");
  const [barracks2, setBarracks2] = useState(() => getCookie("barracks2") || "");
  const [barracks3, setBarracks3] = useState(() => getCookie("barracks3") || "");
  const [barracks4, setBarracks4] = useState(() => getCookie("barracks4") || "");

  // Validation error state
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();

  // Save barracksCapacitySingle to cookie when it changes
  useEffect(() => {
    setCookie("barracksCapacitySingle", barracksCapacitySingle);
  }, [barracksCapacitySingle]);

  // Save totalTrainingTime to cookie when it changes
  useEffect(() => {
    setCookie("totalTrainingTime", totalTrainingTime);
  }, [totalTrainingTime]);

  // Save pointsPerUnit to cookie when it changes
  useEffect(() => {
    setCookie("pointsPerUnit", pointsPerUnit);
  }, [pointsPerUnit]);

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
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Create target date (today)
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);

    // If target time is earlier than current time, assume it's tomorrow
    if (targetHour < currentHour || (targetHour === currentHour && targetMinute <= currentMinute)) {
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
    if (!barracksCapacitySingle.trim()) {
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
    const maxUnits = parseInt(barracksCapacitySingle, 10) || 0;
    const maxTimeSeconds = parseTotalTime(totalTrainingTime);

    // Calculate exact time per unit (with sub-second precision)
    const timePerUnitSeconds = maxUnits > 0 ? maxTimeSeconds / maxUnits : 0;

    const ppu = parseInt(pointsPerUnit, 10) || 22;
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
        barracksCapacitySingle,
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
          <input
            type="text"
            placeholder={getNextUnitProgressionTime()}
            value={availableTime}
            onChange={(e) => setAvailableTime(e.target.value)}
            onKeyDown={handleKeyDown}
          />
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
                  Barracks capacity (single)
                  <InfoIcon text="Pick one barracks and see what time it gives you when you move the slider all the way to the right" />
                </span>
                <input
                  type="number"
                  placeholder="729"
                  value={barracksCapacitySingle}
                  onChange={(e) => setBarracksCapacitySingle(e.target.value)}
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
                <span>
                  Points per unit
                  <InfoIcon text="Look in the Unit progression arms race page and see how many points you get per unit trained. This will default to training level 7 troops with maximum 'Incentive - Training' research" />
                </span>
                <input
                  type="text"
                  placeholder="22"
                  value={pointsPerUnit}
                  onChange={(e) => setPointsPerUnit(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
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

      <div className="desktop-actions">
        <button className="desktop-action-btn check" onClick={goToResults} aria-label="View Results">
          ✓
        </button>
        <button className="desktop-action-btn clear" onClick={clearTodaysTime} aria-label="Clear Today's Time">
          ✕
        </button>
      </div>

      <div className="mobile-footer">
        <div className="mobile-footer-check" onClick={goToResults}>
          <span>✓</span>
        </div>
        <div className="mobile-footer-clear" onClick={clearTodaysTime}>
          <span>✕</span>
        </div>
      </div>
    </div>
  );
}