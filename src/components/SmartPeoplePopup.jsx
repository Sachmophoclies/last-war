import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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

// List of utility page paths that should show the popup
const UTILITY_PAGES = [
  "/unit-progression",
  "/results",
  // Add more utility pages here as they are created
  // Example: "/secret-tasks"
];

export default function SmartPeoplePopup({ onAccept, onDecline }) {
  const [show, setShow] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on utility pages
    const isUtilityPage = UTILITY_PAGES.includes(location.pathname);
    if (!isUtilityPage) {
      return;
    }

    // Check if user has previously accepted or declined
    const hasAccepted = getCookie("smartPeopleAccepted") === "true";
    const hasDismissed = getCookie("smartPeopleDismissed") === "true";

    if (!hasAccepted && !hasDismissed) {
      setShow(true);
    } else if (hasAccepted && onAccept) {
      // Auto-accept if they've accepted before
      onAccept();
    }
  }, [location.pathname, onAccept]);

  const handleAccept = () => {
    if (dontShowAgain) {
      setCookie("smartPeopleAccepted", "true");
    }
    setShow(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    if (dontShowAgain) {
      setCookie("smartPeopleDismissed", "true");
    }
    // Redirect to Disney.com
    window.location.href = "https://disney.com";
    if (onDecline) onDecline();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="smart-people-backdrop" onClick={handleDecline} />

      {/* Popup */}
      <div className="smart-people-popup">
        {/* Big X */}
        <div className="smart-people-x">✕</div>

        {/* Message */}
        <div className="smart-people-content">
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>Wait!</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '1rem', lineHeight: '1.5' }}>
            Only smart people are allowed here
          </p>

          {/* Checkbox */}
          <label className="smart-people-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Do not show again</span>
          </label>
        </div>

        {/* Footer - Stacked Buttons */}
        <div className="smart-people-footer">
          <div className="smart-people-button-decline" onClick={handleDecline}>
            <span className="smart-people-button-icon">✕</span>
            <span className="smart-people-button-text">I'm not smart</span>
          </div>
          <div className="smart-people-button-accept" onClick={handleAccept}>
            <span className="smart-people-button-icon">✓</span>
            <span className="smart-people-button-text">I'm smart</span>
          </div>
        </div>
      </div>
    </>
  );
}
