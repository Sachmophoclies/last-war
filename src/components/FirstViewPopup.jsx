import { useState, useEffect } from "react";
import Modal from "./modal/Modal";

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
    // Always save the current state of dontShowAgain when accepting
    const cookieName = `satchsGuides.${pageKey}.dismissed`;
    setCookie(cookieName, dontShowAgain.toString());
    setShow(false);
  };

  const toggleDontShowAgain = () => {
    setDontShowAgain(!dontShowAgain);
  };

  if (!show || !content) return null;

  return (
    <Modal isOpen={show} onClose={handleAccept} title={content.title || ""}>
      {/* Scrollable Content */}
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {content.sections && content.sections.map((section, index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            {section.heading && <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{section.heading}</h3>}
            {section.paragraphs && section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} style={{ margin: '8px 0' }}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {section.bullets.map((bullet, bIndex) => (
                  <li key={bIndex} style={{ margin: '4px 0' }}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <Modal.Footer>
        <div className="modal-footer-item">
          <div className="modal-footer-checkbox" onClick={toggleDontShowAgain}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={toggleDontShowAgain}
              onClick={(e) => e.stopPropagation()}
            />
            <span>Do Not Show Again</span>
          </div>
        </div>
        <div className="modal-footer-separator"></div>
        <div className="modal-footer-item">
          <button
            className="modal-button"
            onClick={handleAccept}
          >
            Got it
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
