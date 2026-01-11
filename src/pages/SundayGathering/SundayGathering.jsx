import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoIcon from "../../components/InfoIcon.jsx";
import Footer from "../../components/Footer.jsx";
import FirstViewPopup from "../../components/FirstViewPopup.jsx";
import content from "../../data/content.json";

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

// Gathering times in seconds by level and resource type
const GATHERING_TIMES = {
  12: { gold: 388800, foodOrIron: 606666 },
  11: { gold: 345599, foodOrIron: 576000 },
  10: { gold: 302399, foodOrIron: 504000 },
  9: { gold: 259200, foodOrIron: 432000 },
  8: { gold: 216000, foodOrIron: 360000 },
  7: { gold: 172800, foodOrIron: 288000 },
  6: { gold: 129600, foodOrIron: 216000 },
  5: { gold: 108000, foodOrIron: 180000 },
  4: { gold: 86400, foodOrIron: 144000 },
  3: { gold: 64800, foodOrIron: 108000 },
  2: { gold: 43200, foodOrIron: 72000 },
  1: { gold: 21600, foodOrIron: 36000 }
};

// Parse time string (HH:MM:SS) to seconds
function parseTimeToSeconds(timeStr) {
  if (!timeStr || !timeStr.trim()) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 3) return null;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  if (hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return null;

  return hours * 3600 + minutes * 60 + seconds;
}

// Calculate time until next Monday 00:00 server time (UTC-2)
function getSecondsUntilMondayReset() {
  const nowUTC = Date.now();
  const nowServerTime = nowUTC - 2 * 3600000; // Server is UTC-2
  const serverDate = new Date(nowServerTime);

  // Calculate next Monday 00:00 server time
  const dayOfWeek = serverDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  let daysUntilMonday;

  if (dayOfWeek === 0) {
    // Sunday - check if it's already past 00:00
    const currentHour = serverDate.getUTCHours();
    const currentMinute = serverDate.getUTCMinutes();
    const currentSecond = serverDate.getUTCSeconds();

    if (currentHour === 0 && currentMinute === 0 && currentSecond === 0) {
      daysUntilMonday = 1; // Exactly at midnight Sunday, next reset is tomorrow (Monday)
    } else {
      daysUntilMonday = 1; // Sunday, reset is tomorrow
    }
  } else if (dayOfWeek === 1) {
    // Monday - check if before or after midnight
    const currentHour = serverDate.getUTCHours();
    const currentMinute = serverDate.getUTCMinutes();
    const currentSecond = serverDate.getUTCSeconds();

    if (currentHour === 0 && currentMinute === 0 && currentSecond === 0) {
      return 0; // Exactly at reset
    } else {
      daysUntilMonday = 7; // Already past Monday reset, next one is in 7 days
    }
  } else {
    // Tuesday (2) through Saturday (6)
    daysUntilMonday = (8 - dayOfWeek) % 7; // Days until next Monday
  }

  // Calculate the exact timestamp of next Monday 00:00 server time
  const nextMondayServer = new Date(nowServerTime);
  nextMondayServer.setUTCDate(nextMondayServer.getUTCDate() + daysUntilMonday);
  nextMondayServer.setUTCHours(0, 0, 0, 0);

  const secondsUntilReset = (nextMondayServer.getTime() - nowServerTime) / 1000;
  return secondsUntilReset;
}

// Calculate optimal gathering spot and departure time for a squad
function calculateSquadGathering(timeStr, level, type) {
  const timeSeconds = parseTimeToSeconds(timeStr);
  if (timeSeconds === null || timeSeconds === 0) {
    return {}; // Return empty object if no time entered
  }

  const resourceType = type === "Gold" ? "gold" : "foodOrIron";
  const inputGatherTime = GATHERING_TIMES[level][resourceType];

  if (!inputGatherTime) {
    return { error: "Invalid level or type" };
  }

  // Calculate gathering rate (RSS per second)
  const gatheringRate = inputGatherTime / timeSeconds;

  // Get time until reset
  const secondsUntilReset = getSecondsUntilMondayReset();

  if (secondsUntilReset <= 0) {
    return { error: "Reset has already occurred" };
  }

  // Find the highest level where gathering time <= time until reset
  let bestLevel = null;
  let bestGatherTime = null;

  for (let checkLevel = 1; checkLevel <= 12; checkLevel++) {
    const gatherTime = GATHERING_TIMES[checkLevel][resourceType] / gatheringRate;

    if (gatherTime <= secondsUntilReset) {
      bestLevel = checkLevel;
      bestGatherTime = gatherTime;
      // Continue to find higher levels that also fit
    } else {
      break; // Stop when we find a level that doesn't fit
    }
  }

  if (bestLevel === null) {
    return { error: "No suitable gathering spot found" };
  }

  // Calculate departure time: reset time - gathering time
  const departureDelay = secondsUntilReset - bestGatherTime;
  const departureTimeUTC = Date.now() + departureDelay * 1000;
  const departureDate = new Date(departureTimeUTC);

  // Format as HH:MM (local time)
  const hours = departureDate.getHours().toString().padStart(2, '0');
  const minutes = departureDate.getMinutes().toString().padStart(2, '0');
  const departureTimeStr = `${hours}:${minutes}`;

  return {
    level: bestLevel,
    departureTime: departureTimeStr
  };
}

export default function SundayGathering() {
  const navigate = useNavigate();

  // Squad 1 state
  const [squad1Time, setSquad1Time] = useState(() => getCookie("squad1Time") || "");
  const [squad1Level, setSquad1Level] = useState(() => getCookie("squad1Level") || "12");
  const [squad1Type, setSquad1Type] = useState(() => getCookie("squad1Type") || "Gold");

  // Squad 2 state
  const [squad2Time, setSquad2Time] = useState(() => getCookie("squad2Time") || "");
  const [squad2Level, setSquad2Level] = useState(() => getCookie("squad2Level") || "12");
  const [squad2Type, setSquad2Type] = useState(() => getCookie("squad2Type") || "Gold");

  // Squad 3 state
  const [squad3Time, setSquad3Time] = useState(() => getCookie("squad3Time") || "");
  const [squad3Level, setSquad3Level] = useState(() => getCookie("squad3Level") || "12");
  const [squad3Type, setSquad3Type] = useState(() => getCookie("squad3Type") || "Gold");

  // Squad 4 state
  const [squad4Time, setSquad4Time] = useState(() => getCookie("squad4Time") || "");
  const [squad4Level, setSquad4Level] = useState(() => getCookie("squad4Level") || "12");
  const [squad4Type, setSquad4Type] = useState(() => getCookie("squad4Type") || "Gold");

  // Validation error states
  const [squad1TimeError, setSquad1TimeError] = useState("");
  const [squad2TimeError, setSquad2TimeError] = useState("");
  const [squad3TimeError, setSquad3TimeError] = useState("");
  const [squad4TimeError, setSquad4TimeError] = useState("");

  // Validation with 5-second delay for errors, immediate validation for clearing errors
  useEffect(() => {
    if (squad1Time && squad1Time.trim()) {
      const parsed = parseTimeToSeconds(squad1Time);
      if (parsed !== null) {
        // Valid input - clear error immediately
        setSquad1TimeError("");
      } else {
        // Invalid input - show error after 5 seconds
        const timer = setTimeout(() => {
          setSquad1TimeError("Invalid format. Use HH:MM:SS");
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      // Empty input - clear error immediately
      setSquad1TimeError("");
    }
  }, [squad1Time]);

  useEffect(() => {
    if (squad2Time && squad2Time.trim()) {
      const parsed = parseTimeToSeconds(squad2Time);
      if (parsed !== null) {
        setSquad2TimeError("");
      } else {
        const timer = setTimeout(() => {
          setSquad2TimeError("Invalid format. Use HH:MM:SS");
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setSquad2TimeError("");
    }
  }, [squad2Time]);

  useEffect(() => {
    if (squad3Time && squad3Time.trim()) {
      const parsed = parseTimeToSeconds(squad3Time);
      if (parsed !== null) {
        setSquad3TimeError("");
      } else {
        const timer = setTimeout(() => {
          setSquad3TimeError("Invalid format. Use HH:MM:SS");
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setSquad3TimeError("");
    }
  }, [squad3Time]);

  useEffect(() => {
    if (squad4Time && squad4Time.trim()) {
      const parsed = parseTimeToSeconds(squad4Time);
      if (parsed !== null) {
        setSquad4TimeError("");
      } else {
        const timer = setTimeout(() => {
          setSquad4TimeError("Invalid format. Use HH:MM:SS");
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setSquad4TimeError("");
    }
  }, [squad4Time]);

  // Validation on blur (tab out)
  const handleSquad1TimeBlur = () => {
    if (squad1Time && squad1Time.trim()) {
      const parsed = parseTimeToSeconds(squad1Time);
      if (parsed === null) {
        setSquad1TimeError("Invalid format. Use HH:MM:SS");
      }
    }
  };

  const handleSquad2TimeBlur = () => {
    if (squad2Time && squad2Time.trim()) {
      const parsed = parseTimeToSeconds(squad2Time);
      if (parsed === null) {
        setSquad2TimeError("Invalid format. Use HH:MM:SS");
      }
    }
  };

  const handleSquad3TimeBlur = () => {
    if (squad3Time && squad3Time.trim()) {
      const parsed = parseTimeToSeconds(squad3Time);
      if (parsed === null) {
        setSquad3TimeError("Invalid format. Use HH:MM:SS");
      }
    }
  };

  const handleSquad4TimeBlur = () => {
    if (squad4Time && squad4Time.trim()) {
      const parsed = parseTimeToSeconds(squad4Time);
      if (parsed === null) {
        setSquad4TimeError("Invalid format. Use HH:MM:SS");
      }
    }
  };

  // Save to cookies when values change
  const handleSquad1TimeChange = (e) => {
    setSquad1Time(e.target.value);
    setCookie("squad1Time", e.target.value);
  };

  const handleSquad1LevelChange = (e) => {
    setSquad1Level(e.target.value);
    setCookie("squad1Level", e.target.value);
  };

  const handleSquad1TypeChange = (e) => {
    setSquad1Type(e.target.value);
    setCookie("squad1Type", e.target.value);
  };

  const handleSquad2TimeChange = (e) => {
    setSquad2Time(e.target.value);
    setCookie("squad2Time", e.target.value);
  };

  const handleSquad2LevelChange = (e) => {
    setSquad2Level(e.target.value);
    setCookie("squad2Level", e.target.value);
  };

  const handleSquad2TypeChange = (e) => {
    setSquad2Type(e.target.value);
    setCookie("squad2Type", e.target.value);
  };

  const handleSquad3TimeChange = (e) => {
    setSquad3Time(e.target.value);
    setCookie("squad3Time", e.target.value);
  };

  const handleSquad3LevelChange = (e) => {
    setSquad3Level(e.target.value);
    setCookie("squad3Level", e.target.value);
  };

  const handleSquad3TypeChange = (e) => {
    setSquad3Type(e.target.value);
    setCookie("squad3Type", e.target.value);
  };

  const handleSquad4TimeChange = (e) => {
    setSquad4Time(e.target.value);
    setCookie("squad4Time", e.target.value);
  };

  const handleSquad4LevelChange = (e) => {
    setSquad4Level(e.target.value);
    setCookie("squad4Level", e.target.value);
  };

  const handleSquad4TypeChange = (e) => {
    setSquad4Type(e.target.value);
    setCookie("squad4Type", e.target.value);
  };

  // Calculate results for all squads
  const squadResults = useMemo(() => {
    return [
      { name: "Squad 1", ...calculateSquadGathering(squad1Time, squad1Level, squad1Type) },
      { name: "Squad 2", ...calculateSquadGathering(squad2Time, squad2Level, squad2Type) },
      { name: "Squad 3", ...calculateSquadGathering(squad3Time, squad3Level, squad3Type) },
      { name: "Squad 4", ...calculateSquadGathering(squad4Time, squad4Level, squad4Type) }
    ];
  }, [squad1Time, squad1Level, squad1Type, squad2Time, squad2Level, squad2Type, squad3Time, squad3Level, squad3Type, squad4Time, squad4Level, squad4Type]);

  return (
    <div className="page">
      <FirstViewPopup
        cookieName="sundayGatheringFirstView"
        sessionName="sundayGatheringFirstView"
        content={content.satchsGuides.sundayGathering}
      />

      <h1>Sunday Gathering</h1>

      {/* Card 1: About This Tool */}
      <div className="card">
        <h2>About This Tool</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          This is a placeholder description for the Sunday Gathering tool. We will update this with detailed information about how to use this tool to optimize your gathering times for VS events.
        </p>
      </div>

      {/* Card 2: Squad Times */}
      <div className="card">
        <h2>Squad Times</h2>

        {/* Squad 1 */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Squad 1</h3>
          <div className="squad-inputs">
            <input
              type="text"
              value={squad1Time}
              onChange={handleSquad1TimeChange}
              onBlur={handleSquad1TimeBlur}
              placeholder="Time (HH:MM:SS)"
              style={{ border: `1px solid ${squad1TimeError ? '#ef4444' : 'var(--input-border)'}`, borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <select
              value={squad1Level}
              onChange={handleSquad1LevelChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
            <select
              value={squad1Type}
              onChange={handleSquad1TypeChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              <option value="Gold">Gold</option>
              <option value="Food or Iron">Food or Iron</option>
            </select>
          </div>
          {squad1TimeError && (
            <div style={{ marginTop: '4px', fontSize: '0.875rem', color: '#ef4444' }}>
              {squad1TimeError}
            </div>
          )}
        </div>

        {/* Squad 2 */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Squad 2</h3>
          <div className="squad-inputs">
            <input
              type="text"
              value={squad2Time}
              onChange={handleSquad2TimeChange}
              onBlur={handleSquad2TimeBlur}
              placeholder="Time (HH:MM:SS)"
              style={{ border: `1px solid ${squad2TimeError ? '#ef4444' : 'var(--input-border)'}`, borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <select
              value={squad2Level}
              onChange={handleSquad2LevelChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
            <select
              value={squad2Type}
              onChange={handleSquad2TypeChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              <option value="Gold">Gold</option>
              <option value="Food or Iron">Food or Iron</option>
            </select>
          </div>
          {squad2TimeError && (
            <div style={{ marginTop: '4px', fontSize: '0.875rem', color: '#ef4444' }}>
              {squad2TimeError}
            </div>
          )}
        </div>

        {/* Squad 3 */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Squad 3</h3>
          <div className="squad-inputs">
            <input
              type="text"
              value={squad3Time}
              onChange={handleSquad3TimeChange}
              onBlur={handleSquad3TimeBlur}
              placeholder="Time (HH:MM:SS)"
              style={{ border: `1px solid ${squad3TimeError ? '#ef4444' : 'var(--input-border)'}`, borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <select
              value={squad3Level}
              onChange={handleSquad3LevelChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
            <select
              value={squad3Type}
              onChange={handleSquad3TypeChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              <option value="Gold">Gold</option>
              <option value="Food or Iron">Food or Iron</option>
            </select>
          </div>
          {squad3TimeError && (
            <div style={{ marginTop: '4px', fontSize: '0.875rem', color: '#ef4444' }}>
              {squad3TimeError}
            </div>
          )}
        </div>

        {/* Squad 4 */}
        <div style={{ marginBottom: '0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Squad 4</h3>
          <div className="squad-inputs">
            <input
              type="text"
              value={squad4Time}
              onChange={handleSquad4TimeChange}
              onBlur={handleSquad4TimeBlur}
              placeholder="Time (HH:MM:SS)"
              style={{ border: `1px solid ${squad4TimeError ? '#ef4444' : 'var(--input-border)'}`, borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
            <select
              value={squad4Level}
              onChange={handleSquad4LevelChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
            <select
              value={squad4Type}
              onChange={handleSquad4TypeChange}
              style={{ border: '1px solid var(--input-border)', borderRadius: '10px', padding: '10px', fontSize: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
            >
              <option value="Gold">Gold</option>
              <option value="Food or Iron">Food or Iron</option>
            </select>
          </div>
          {squad4TimeError && (
            <div style={{ marginTop: '4px', fontSize: '0.875rem', color: '#ef4444' }}>
              {squad4TimeError}
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Time to Gather */}
      <div className="card">
        <h2>Time to Gather</h2>
        {squadResults.filter(result => result.level || result.error).length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-muted)', textAlign: 'center' }}>
            Enter squad information above to calculate gathering times
          </p>
        ) : (
          squadResults.map((result, index) => (
            result.level || result.error ? (
              <div key={index} style={{ marginBottom: index < 3 ? '8px' : '0' }}>
                {result.error ? (
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                    {result.name}: {result.error}
                  </p>
                ) : (
                  <p style={{ margin: 0 }}>
                    {result.name}: Send to Level {result.level} at {result.departureTime}
                  </p>
                )}
              </div>
            ) : null
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
