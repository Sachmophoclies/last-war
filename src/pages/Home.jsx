import { useState, useEffect } from "react";
import content from "../data/content.json";

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

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState(() => getCookie("playerLevel") || "");

  useEffect(() => {
    if (selectedLevel) {
      setCookie("playerLevel", selectedLevel);
    }
  }, [selectedLevel]);

  const handleLevelClick = (levelKey) => {
    setSelectedLevel(levelKey);
  };

  return (
    <div className="page">
      <h1>{content.home.header}</h1>

      {!selectedLevel ? (
        <div className="card">
          {Object.entries(content.home.level).map(([key, label]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => handleLevelClick(key)}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '400',
                  background: 'var(--card-bg)',
                  color: 'var(--text)',
                  border: '2px solid var(--card-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p style={{ textAlign: 'center', margin: 0 }}>
            {content.home.response[selectedLevel]}
          </p>
        </div>
      )}
    </div>
  );
}
