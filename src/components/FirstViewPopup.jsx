import { useState, useEffect } from "react";

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

export default function FirstViewPopup({ pageKey, content }) {
  const [show, setShow] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this popup before
    const cookieName = `satchsGuides.${pageKey}.dismissed`;
    const isDismissed = getCookie(cookieName) === "true";

    if (!isDismissed) {
      setShow(true);
    }
  }, [pageKey]);

  const handleAccept = () => {
    if (dontShowAgain) {
      const cookieName = `satchsGuides.${pageKey}.dismissed`;
      setCookie(cookieName, "true");
    }
    setShow(false);
  };

  if (!show || !content) return null;

  return (
    <div className="first-view-popup">
      {/* Scrollable Content */}
      <div className="first-view-content">
        {content.title && <h1>{content.title}</h1>}
        {content.sections && content.sections.map((section, index) => (
          <div key={index} className="first-view-section">
            {section.heading && <h2>{section.heading}</h2>}
            {section.paragraphs && section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet, bIndex) => (
                  <li key={bIndex}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Footer */}
      <div className="first-view-footer">
        <div className="first-view-footer-check" onClick={handleAccept}>
          <span>✓</span>
        </div>
        <div className="first-view-footer-dismiss" onClick={handleAccept}>
          <label className="first-view-footer-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Do Not Show Again</span>
          </label>
        </div>
      </div>
    </div>
  );
}
